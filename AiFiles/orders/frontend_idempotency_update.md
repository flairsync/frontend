# Frontend Idempotency Update — Payment Endpoint

The backend now has server-side idempotency protection for the Add Payment endpoint.
This document explains what changed, what the frontend must send, and how to generate
and manage idempotency keys correctly.

---

## What Changed on the Backend

`POST /businesses/:businessId/orders/:orderId/payments` now reads an optional
`Idempotency-Key` request header. When the header is present:

1. **Application-layer check** — looks up an existing payment with that key. If found
   (and it belongs to the same order), returns the original payment immediately without
   creating a new record.
2. **DB-layer safety net** — a partial unique index on `payments.idempotencyKey`
   (where the column is not null) prevents duplicate inserts even when two requests
   with the same key race past the application check simultaneously. The losing request
   is caught with a PostgreSQL unique-constraint error, rolled back via a savepoint,
   and the original payment is returned instead.

**Result:** calling `POST /payments` twice with the same `Idempotency-Key` is safe —
the second call returns the exact same payment object as the first. No double charge.

---

## What the Frontend Must Do

### 1. Generate a UUID Before Opening the Payment Form

Generate one `crypto.randomUUID()` per payment *attempt* — when the user opens the
payment modal / starts the payment flow. Store it in component state. Do **not**
regenerate it on retry.

```ts
// In the component that renders the payment form
const [idempotencyKey] = useState(() => crypto.randomUUID());
```

`useState` with an initialiser runs once on mount, so the key is stable for the
lifetime of that form. If the user closes and reopens the form, a new key is generated
(which is correct — a fresh attempt is a different payment intent).

---

### 2. Send the Key as a Header on Every Payment Submission

```ts
async function submitPayment(orderId: string, payload: AddPaymentPayload) {
    const response = await api.post(
        `/businesses/${businessId}/orders/${orderId}/payments`,
        payload,
        {
            headers: {
                'Idempotency-Key': idempotencyKey,   // same key on every retry
            },
        },
    );
    return response.data;
}
```

> [!IMPORTANT]
> Use the **same key** if you retry after a network error or timeout. Never generate a
> new key for a retry — that defeats the entire purpose and creates a new payment.

---

### 3. Retry Strategy for Network Failures Only

With idempotency keys in place, it is now safe to retry `POST /payments` on network
errors and timeouts — because the server will deduplicate. Do **not** retry on `4xx`
responses (those are logic errors, not transient failures).

```ts
// React Query example
const paymentMutation = useMutation({
    mutationFn: submitPayment,
    retry: (failureCount, error) => {
        // Retry up to 2 times only on network-level failures
        if (failureCount >= 2) return false;
        const status = (error as any)?.response?.status;
        // Never retry on client errors (bad request, conflict, etc.)
        if (status && status < 500) return false;
        return true;
    },
});
```

```ts
// Axios example — automatic retry with idempotency-safe config
axiosRetry(axios, {
    retries: 2,
    retryCondition: (error) => {
        // Only retry true network failures or 5xx; never retry 4xx
        if (!error.response) return true;          // no response = network error
        return error.response.status >= 500;
    },
    retryDelay: axiosRetry.exponentialDelay,
});
```

---

### 4. Response Handling — Both First Call and Retry Return the Same Shape

The server always returns the `Payment` object on success, whether it was freshly
created or already existed. No special handling needed for the retry case.

```ts
interface Payment {
    id: string;
    orderId: string;
    amount: number;
    tipAmount: number;
    method: 'cash' | 'card' | 'online' | 'other';
    status: 'success' | 'failed' | 'refunded';
    idempotencyKey: string | null;   // ← new field on the Payment type
    createdAt: string;
    updatedAt: string;
}
```

Add `idempotencyKey: string | null` to your `Payment` TypeScript interface / Zod schema.

---

### 5. When to Generate a New Key vs. Reuse the Existing One

| Scenario | Action |
|---|---|
| User opens payment form | Generate new key (`crypto.randomUUID()`) |
| User submits form | Send that key |
| Request fails with network error / timeout | **Reuse same key**, retry |
| Request fails with `4xx` (validation error, bad amount, etc.) | Fix the error, **reuse same key** (still the same payment attempt) |
| User closes form and reopens it | New key is generated automatically by `useState` initialiser |
| User explicitly clicks "Try a different amount" | Unmount + remount the form component → new key |
| Payment succeeds, user wants to add a *second* partial payment | New form mount → new key |

---

### 6. Error: `payment.idempotency_key_conflict`

If the backend returns error code `payment.idempotency_key_conflict`, it means the
key was already used for a **different order**. This should never happen in normal
usage (the key is generated per form instance which is per order). If you see it:

- Do **not** retry with the same key.
- Show an error toast: *"Something went wrong with this payment. Please refresh and try again."*
- Refresh the order to see its current payment state.

---

### 7. Complete Payment Flow Example

```tsx
function PaymentModal({ orderId, onSuccess, onClose }) {
    // Key is generated once when this modal mounts
    const [idempotencyKey] = useState(() => crypto.randomUUID());
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(values: PaymentFormValues) {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await api.post(
                `/businesses/${businessId}/orders/${orderId}/payments`,
                {
                    amount: values.amount,
                    method: values.method,
                    tipAmount: values.tipAmount ?? 0,
                },
                { headers: { 'Idempotency-Key': idempotencyKey } },
            );
            onSuccess();   // close modal, refresh order
        } catch (err) {
            const code = err?.response?.data?.code;
            if (code === 'payment.idempotency_key_conflict') {
                showToast('Something went wrong. Refreshing order...');
                refreshOrder();
                onClose();
            } else {
                showToast(err?.response?.data?.message ?? 'Payment failed');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Modal>
            <PaymentForm onSubmit={handleSubmit} disabled={isSubmitting} />
        </Modal>
    );
}
```

---

## Summary Checklist

- [ ] Add `idempotencyKey: string | null` to the `Payment` TypeScript interface / Zod schema
- [ ] Generate `crypto.randomUUID()` once per payment form mount (via `useState` initialiser)
- [ ] Send the key as the `Idempotency-Key` request header on `POST /payments`
- [ ] Reuse the **same key** on network retries — never regenerate it for a retry
- [ ] Update any HTTP retry config to allow retrying `POST /payments` (now safe with a key)
- [ ] Still disable the submit button on click to prevent UI double-submits
- [ ] Handle `payment.idempotency_key_conflict` with a refresh + toast (should be rare)
