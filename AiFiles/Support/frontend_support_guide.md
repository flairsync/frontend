# Frontend Support Integration Guide

Base URL: `https://api.flairsync.com/api/v1`

Both endpoints in this section are **public** — no authentication header is required.

---

## 1. Fetch Support Categories

Use this on page load to populate the category dropdown dynamically. Never hardcode categories in the UI.

**Endpoint:** `GET /support/categories`

**No request body or query params.**

### Response

```json
[
  { "value": "billing_and_payments", "label": "Billing & Payments" },
  { "value": "subscription",         "label": "Subscription" },
  { "value": "getting_started",      "label": "Getting Started" },
  { "value": "menu_management",      "label": "Menu Management" },
  { "value": "staff_and_permissions","label": "Staff & Permissions" },
  { "value": "reservations_and_orders","label": "Reservations & Orders" },
  { "value": "technical_issue",      "label": "Technical Issue" },
  { "value": "account_and_security", "label": "Account & Security" },
  { "value": "integrations",         "label": "Integrations" },
  { "value": "other",                "label": "Other" }
]
```

Send `value` when submitting the contact form. Display `label` to the user.

---

## 2. Submit a Support Ticket

**Endpoint:** `POST /support/contact`

**Content-Type:** `application/json`

### Request body

```json
{
  "name":     "Jane Smith",
  "email":    "jane@example.com",
  "category": "billing_and_payments",
  "subject":  "Unable to update payment method",
  "message":  "I have been trying to update my card details for the past two days but the page keeps showing an error."
}
```

### Field rules

| Field      | Type   | Required | Constraints                        |
|------------|--------|----------|------------------------------------|
| `name`     | string | Yes      | max 100 characters                 |
| `email`    | string | Yes      | valid email format                 |
| `category` | string | Yes      | must be one of the `value` strings from `/support/categories` |
| `subject`  | string | Yes      | max 150 characters                 |
| `message`  | string | Yes      | min 10 chars, max 2000 chars       |

### Success response — `200 OK`

```json
{
  "message": "Your message has been received. We will get back to you shortly."
}
```

### Error response — `400 Bad Request`

```json
{
  "statusCode": 400,
  "message": ["email must be an email", "category must be a valid enum value"],
  "error": "Bad Request"
}
```

---

## 3. TypeScript Types

```ts
export interface SupportCategory {
  value: string;
  label: string;
}

export interface SupportTicketPayload {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
}
```

---

## 4. API Calls

```ts
// services/support.ts

const BASE = 'https://api.flairsync.com/api/v1';

export async function getSupportCategories(): Promise<SupportCategory[]> {
  const res = await fetch(`${BASE}/support/categories`);
  if (!res.ok) throw new Error('Failed to load categories');
  return res.json();
}

export async function submitSupportTicket(payload: SupportTicketPayload): Promise<void> {
  const res = await fetch(`${BASE}/support/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? 'Failed to submit ticket');
  }
}
```

---

## 5. Form Behavior

### On mount
1. Call `GET /support/categories` to populate the dropdown.
2. Show a loading skeleton or spinner while fetching.
3. If the fetch fails, show a static fallback list or an inline error — do not block the form.

### Validation (run client-side before submit)
- `name` — required, ≤ 100 chars
- `email` — required, valid email format
- `category` — required, user must select one
- `subject` — required, ≤ 150 chars
- `message` — required, between 10 and 2000 chars; show a live character counter

### On submit
1. Disable the submit button and show a spinner.
2. Call `POST /support/contact`.
3. **On success:** hide the form and show a confirmation message, e.g.:
   > "Thanks! We've received your message and will reply to **{email}** shortly."
4. **On error:** re-enable the form, show the error inline (not a modal). Map the `message` array from the 400 response to the relevant field if possible.

### Edge cases
- Do not clear the form on a network error — let the user retry without re-typing.
- Trim whitespace from `name`, `subject`, and `message` before sending.
- Prevent double-submit by disabling the button until the request resolves.

---

## 6. Example Component Structure (React)

```tsx
function SupportPage() {
  const [categories, setCategories] = useState<SupportCategory[]>([]);
  const [form, setForm] = useState({
    name: '', email: '', category: '', subject: '', message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    getSupportCategories().then(setCategories).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      await submitSupportTicket({
        ...form,
        name: form.name.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setStatus('success');
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <p>Thanks! We've received your message and will reply to <strong>{form.email}</strong> shortly.</p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* name, email, subject inputs */}

      <select
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        required
      >
        <option value="" disabled>Select a category</option>
        {categories.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>

      <textarea
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        minLength={10}
        maxLength={2000}
        required
      />
      <p>{form.message.length} / 2000</p>

      {status === 'error' && <p className="error">{errorMsg}</p>}

      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}
```

---

## 7. What Happens on the Backend

When the form is submitted:
1. The API validates all fields against the rules above.
2. An HTML email is sent to the admin address configured as `SUPPORT_EMAIL` in the environment.
3. The email `Reply-To` header is set to the user's email, so the admin can reply directly from their inbox.
4. The user receives the `200` success response — **no confirmation email is sent to the user** at this stage.

> If a user confirmation email is needed in the future, request it as a backend feature — it is not currently implemented.
