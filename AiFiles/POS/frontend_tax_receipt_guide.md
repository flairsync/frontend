# FlairSync POS — Tax & Receipt Frontend Guide

> **Applies to:** dashboard + POS app  
> **Last updated:** 2026-05-10  
> **Backend readiness:** ✅ All endpoints live — tax config, cash payment fields, and receipt tax breakdown are implemented.

---

## Table of Contents

1. [What Changed](#1-what-changed)
2. [Tax Configuration — Dashboard](#2-tax-configuration--dashboard)
3. [Receipt Response — New Shape](#3-receipt-response--new-shape)
4. [Rendering the Tax Line on a Receipt](#4-rendering-the-tax-line-on-a-receipt)
5. [Cash Payment — Tendered & Change](#5-cash-payment--tendered--change)
6. [Full Receipt UI Example](#6-full-receipt-ui-example)
7. [TypeScript Types](#7-typescript-types)
8. [Migration Notes for Existing Integrations](#8-migration-notes-for-existing-integrations)

---

## 1. What Changed

| Area                 | Before                                              | After                                                                    |
| -------------------- | --------------------------------------------------- | ------------------------------------------------------------------------ |
| `order.taxAmount`    | Always `0` — field existed but was never calculated | Calculated automatically from business tax config at order creation time |
| Receipt `tax` field  | Flat `taxAmount: number`                            | Nested object with `name`, `rate`, `included`, `amount`                  |
| Business settings    | No tax fields                                       | `taxRate`, `taxName`, `taxIncluded`                                      |
| Cash payments        | Only `amount` + `tipAmount`                         | `cashTendered` input → server returns `changeGiven`                      |
| Per-payment response | No cash change info                                 | `cashTendered` + `changeGiven` on each payment                           |

**Key behaviour to understand:**

- Tax is **snapshotted at order creation time**. If the owner changes the tax rate later, existing receipts are unaffected.
- `taxIncluded: true` (default, EU/Andorra style): prices shown to the customer **already include** tax. The `taxAmount` on the receipt shows how much of the total was tax — it is **not added on top**.
- `taxIncluded: false` (US style): tax is **added on top** of the subtotal.

---

## 2. Tax Configuration — Dashboard

The tax settings live on the business object. Owners configure them once in the business settings screen.

### Read current settings

```
GET /businesses/:businessId
Auth: JwtCookieGuard
```

The response includes:

```json
{
  "data": {
    "taxRate": 4.5,
    "taxName": "IGI",
    "taxIncluded": true,
    ...
  }
}
```

### Update tax settings

```
PATCH /businesses/:businessId
Auth: JwtCookieGuard + BusinessOwnerGuard
Content-Type: application/json
```

```json
{
  "taxRate": 4.5,
  "taxName": "IGI",
  "taxIncluded": true
}
```

| Field         | Type      | Constraints  | Description                                                        |
| ------------- | --------- | ------------ | ------------------------------------------------------------------ |
| `taxRate`     | `number`  | `0–100`      | Tax percentage. `0` = no tax applied                               |
| `taxName`     | `string`  | max 30 chars | Label shown on receipts (e.g. `"IGI"`, `"VAT"`, `"IVA"`, `"GST"`)  |
| `taxIncluded` | `boolean` | —            | `true` = prices include tax (extract it); `false` = add tax on top |

### Dashboard settings form

```tsx
function TaxSettingsForm({ business }: { business: Business }) {
  const [taxRate, setTaxRate] = useState(business.taxRate);
  const [taxName, setTaxName] = useState(business.taxName);
  const [taxIncluded, setTaxIncluded] = useState(business.taxIncluded);

  async function save() {
    await fetch(`/businesses/${business.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ taxRate, taxName, taxIncluded }),
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <label>
        Tax rate (%)
        <input
          type="number"
          min={0}
          max={100}
          step={0.01}
          value={taxRate}
          onChange={(e) => setTaxRate(Number(e.target.value))}
        />
      </label>

      <label>
        Tax label on receipts
        <input
          type="text"
          maxLength={30}
          placeholder="e.g. IGI, VAT, IVA"
          value={taxName}
          onChange={(e) => setTaxName(e.target.value)}
        />
      </label>

      <label>
        Pricing model
        <select
          value={taxIncluded ? "included" : "excluded"}
          onChange={(e) => setTaxIncluded(e.target.value === "included")}
        >
          <option value="included">Prices include tax (EU / Andorra)</option>
          <option value="excluded">Tax added on top (US style)</option>
        </select>
      </label>

      <button type="submit">Save tax settings</button>
    </form>
  );
}
```

### Andorra (IGI) quick-start

For Andorra with the IGI tax at 4.5%, the correct configuration is:

```json
{
  "taxRate": 4.5,
  "taxName": "IGI",
  "taxIncluded": true
}
```

A coffee priced at €1.90 already contains `€1.90 × 4.5 / 104.5 = €0.08` of IGI. The receipt will show this breakdown automatically — the customer never pays more than €1.90.

---

## 3. Receipt Response — New Shape

```
GET /station/orders/:id/receipt         (POS — device + staff token)
GET /businesses/:businessId/orders/:id/receipt   (Dashboard — JWT cookie)
```

### Full response shape

```ts
{
  orderId: string;
  type: "dine_in" | "takeaway" | "delivery";
  status: string;
  paymentStatus: "unpaid" | "partially_paid" | "paid" | "refunded";
  tableId: string | null;
  tableName: string | null;

  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    modifiers: Array<{ name: string; price: number }>;
    totalPrice: number;
    status: string;
    notes: string | null;
  }>;

  subtotal: number; // sum of all active item prices
  discountAmount: number; // discount applied to the order

  // ── NEW ──────────────────────────────────────────────────
  tax: {
    name: string; // e.g. "IGI", "VAT" — from business config at order time
    rate: number; // e.g. 4.5
    included: boolean; // true = already in price, false = added on top
    amount: number; // the actual euro/dollar amount of tax
  }
  // ─────────────────────────────────────────────────────────

  totalAmount: number; // what the customer owes (includes tax if included=true)
  totalPaid: number;
  totalTip: number;

  payments: Array<{
    id: string;
    method: "cash" | "card" | "online" | "other";
    amount: number;
    tipAmount: number;
    // ── NEW (cash only — null for card/online) ──
    cashTendered: number | null;
    changeGiven: number | null;
    // ─────────────────────────────────────────────
    status: "success" | "failed" | "refunded";
  }>;

  createdAt: string;
  closedAt: string | null;
}
```

### Example — Andorra IGI receipt

```json
{
  "orderId": "abc-123",
  "type": "dine_in",
  "status": "completed",
  "paymentStatus": "paid",
  "tableId": "t1",
  "tableName": "Table 4",
  "items": [
    {
      "name": "Café amb llet",
      "quantity": 2,
      "unitPrice": 1.9,
      "modifiers": [],
      "totalPrice": 3.8,
      "notes": null
    }
  ],
  "subtotal": 3.8,
  "discountAmount": 0,
  "tax": {
    "name": "IGI",
    "rate": 4.5,
    "included": true,
    "amount": 0.16
  },
  "totalAmount": 3.8,
  "totalPaid": 3.8,
  "totalTip": 0,
  "payments": [
    {
      "method": "cash",
      "amount": 3.8,
      "tipAmount": 0,
      "cashTendered": 5.0,
      "changeGiven": 1.2,
      "status": "success"
    }
  ],
  "createdAt": "2026-05-10T11:30:00Z",
  "closedAt": "2026-05-10T11:35:00Z"
}
```

> **Note on `included: true`:** `totalAmount` (€3.80) already contains the tax. The tax line tells the customer how much of what they paid was IGI — it does **not** mean they pay €3.80 + €0.16.

---

## 4. Rendering the Tax Line on a Receipt

### Logic

```ts
function formatTaxLine(tax: ReceiptTax, currency: string): string | null {
  if (tax.rate === 0 || tax.amount === 0) return null; // no tax — hide the line

  const label = tax.included
    ? `${tax.name} ${tax.rate}% (included)`
    : `${tax.name} ${tax.rate}%`;

  return `${label}: ${formatCurrency(tax.amount, currency)}`;
}
```

### Receipt component

```tsx
function ReceiptTaxLine({
  tax,
  currency,
}: {
  tax: Receipt["tax"];
  currency: string;
}) {
  if (tax.rate === 0 || tax.amount === 0) return null;

  return (
    <div className="receipt-row receipt-row--tax">
      <span className="receipt-row__label">
        {tax.name} {tax.rate}%
        {tax.included && <span className="receipt-row__note"> incl.</span>}
      </span>
      <span className="receipt-row__value">
        {formatCurrency(tax.amount, currency)}
      </span>
    </div>
  );
}
```

### Full receipt totals block

```tsx
function ReceiptTotals({
  receipt,
  currency,
}: {
  receipt: Receipt;
  currency: string;
}) {
  return (
    <div className="receipt-totals">
      <ReceiptRow
        label="Subtotal"
        value={receipt.subtotal}
        currency={currency}
      />

      {receipt.discountAmount > 0 && (
        <ReceiptRow
          label="Discount"
          value={-receipt.discountAmount}
          currency={currency}
        />
      )}

      <ReceiptTaxLine tax={receipt.tax} currency={currency} />

      <ReceiptRow
        label="TOTAL"
        value={receipt.totalAmount}
        currency={currency}
        bold
      />

      {receipt.totalTip > 0 && (
        <ReceiptRow label="Tip" value={receipt.totalTip} currency={currency} />
      )}
    </div>
  );
}
```

---

## 5. Cash Payment — Tendered & Change

When the payment method is `cash`, pass the amount the customer physically handed over. The server calculates and stores the change.

### POST /station/orders/:id/payments

```json
{
  "amount": 3.8,
  "method": "cash",
  "tipAmount": 0,
  "cashTendered": 5.0
}
```

The server will:

1. Store `cashTendered: 5.00`
2. Compute `changeGiven = cashTendered − amount − tipAmount = 5.00 − 3.80 − 0 = 1.20`
3. Return both values on the payment record and the receipt

> `cashTendered` is optional — if omitted, both fields are stored as `null`. Only pass it for `method: "cash"`.

### Change calculator component (POS UI)

```tsx
function CashPaymentPanel({
  amountDue,
  currency,
  onSubmit,
}: {
  amountDue: number;
  currency: string;
  onSubmit: (cashTendered: number) => void;
}) {
  const [tendered, setTendered] = useState<string>("");

  const tenderedNum = parseFloat(tendered) || 0;
  const change = Math.max(0, tenderedNum - amountDue);
  const isEnough = tenderedNum >= amountDue;

  // Quick denominations for fast entry
  const bills = [5, 10, 20, 50, 100];
  const quickAmounts = bills.filter((b) => b >= amountDue);

  return (
    <div className="cash-panel">
      <p className="cash-panel__due">
        Amount due: <strong>{formatCurrency(amountDue, currency)}</strong>
      </p>

      <div className="cash-panel__quick">
        {quickAmounts.map((amount) => (
          <button key={amount} onClick={() => setTendered(String(amount))}>
            {formatCurrency(amount, currency)}
          </button>
        ))}
      </div>

      <label>
        Cash received
        <input
          type="number"
          min={amountDue}
          step={0.01}
          value={tendered}
          onChange={(e) => setTendered(e.target.value)}
          placeholder={formatCurrency(amountDue, currency)}
          autoFocus
        />
      </label>

      {tenderedNum > 0 && (
        <p className={`cash-panel__change ${isEnough ? "enough" : "short"}`}>
          Change: <strong>{formatCurrency(change, currency)}</strong>
        </p>
      )}

      <button
        disabled={!isEnough}
        onClick={() => onSubmit(tenderedNum)}
        className="cash-panel__confirm"
      >
        Confirm cash payment
      </button>
    </div>
  );
}
```

### Wiring into the payment flow

```ts
async function processCashPayment(
  orderId: string,
  amountDue: number,
  cashTendered: number,
) {
  const body: AddPaymentDto = {
    amount: amountDue,
    method: "cash",
    tipAmount: 0,
    cashTendered,
  };

  const res = await fetch(`/station/orders/${orderId}/payments`, {
    method: "POST",
    headers: posHeaders(true),
    body: JSON.stringify(body),
  });

  return res.json(); // payment record — includes changeGiven
}
```

### Showing change on the receipt after payment

```tsx
function PaymentRow({
  payment,
  currency,
}: {
  payment: ReceiptPayment;
  currency: string;
}) {
  return (
    <div className="payment-row">
      <span className="payment-row__method">
        {payment.method.toUpperCase()}
      </span>
      <span className="payment-row__amount">
        {formatCurrency(payment.amount, currency)}
      </span>

      {payment.method === "cash" && payment.cashTendered !== null && (
        <>
          <span className="payment-row__tendered">
            Tendered: {formatCurrency(payment.cashTendered, currency)}
          </span>
          <span className="payment-row__change">
            Change: {formatCurrency(payment.changeGiven ?? 0, currency)}
          </span>
        </>
      )}

      {payment.tipAmount > 0 && (
        <span className="payment-row__tip">
          Tip: {formatCurrency(payment.tipAmount, currency)}
        </span>
      )}
    </div>
  );
}
```

---

## 6. Full Receipt UI Example

A complete printed/screen receipt matching the Starbucks Andorra layout:

```
════════════════════════════════
       FLAIRSYNC CAFÉ
       Andorra la Vella
════════════════════════════════
Table 4                  #0042
10/05/2026           11:35 AM
────────────────────────────────
Café amb llet  x2
  @ €1.90                 €3.80
────────────────────────────────
Subtotal                  €3.80
IGI 4.5% incl.            €0.16
────────────────────────────────
TOTAL                     €3.80
════════════════════════════════
Cash tendered             €5.00
CHANGE                    €1.20
════════════════════════════════
       Gràcies per la visita!
```

```tsx
function PrintableReceipt({
  receipt,
  business,
}: {
  receipt: Receipt;
  business: Business;
}) {
  const currency = business.currency ?? "EUR";
  const cashPayments = receipt.payments.filter(
    (p) => p.method === "cash" && p.status === "success",
  );

  return (
    <div className="receipt-print">
      <header className="receipt-print__header">
        <h1>{business.name}</h1>
        {business.address && <p>{business.address}</p>}
      </header>

      <div className="receipt-print__meta">
        {receipt.tableName && <span>Table {receipt.tableName}</span>}
        <span>{new Date(receipt.createdAt).toLocaleString()}</span>
      </div>

      <hr />

      <ul className="receipt-print__items">
        {receipt.items.map((item) => (
          <li key={item.id}>
            <span>
              {item.name} ×{item.quantity}
            </span>
            <span>{formatCurrency(item.totalPrice, currency)}</span>
            {item.modifiers.map((m) => (
              <div key={m.name} className="receipt-print__modifier">
                + {m.name} {formatCurrency(m.price, currency)}
              </div>
            ))}
            {item.notes && (
              <div className="receipt-print__notes">{item.notes}</div>
            )}
          </li>
        ))}
      </ul>

      <hr />

      <div className="receipt-print__totals">
        <ReceiptRow
          label="Subtotal"
          value={receipt.subtotal}
          currency={currency}
        />

        {receipt.discountAmount > 0 && (
          <ReceiptRow
            label="Discount"
            value={-receipt.discountAmount}
            currency={currency}
          />
        )}

        {receipt.tax.rate > 0 && (
          <ReceiptRow
            label={`${receipt.tax.name} ${receipt.tax.rate}%${receipt.tax.included ? " incl." : ""}`}
            value={receipt.tax.amount}
            currency={currency}
          />
        )}

        <ReceiptRow
          label="TOTAL"
          value={receipt.totalAmount}
          currency={currency}
          bold
        />

        {receipt.totalTip > 0 && (
          <ReceiptRow
            label="Tip"
            value={receipt.totalTip}
            currency={currency}
          />
        )}
      </div>

      {cashPayments.length > 0 && (
        <>
          <hr />
          {cashPayments.map((p) => (
            <div key={p.id} className="receipt-print__cash">
              <ReceiptRow
                label="Cash tendered"
                value={p.cashTendered!}
                currency={currency}
              />
              <ReceiptRow
                label="CHANGE"
                value={p.changeGiven!}
                currency={currency}
                bold
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
}
```

---

## 7. TypeScript Types

Add these to your shared API types file:

```ts
export interface ReceiptTax {
  name: string;
  rate: number;
  included: boolean;
  amount: number;
}

export interface ReceiptPayment {
  id: string;
  method: "cash" | "card" | "online" | "other";
  amount: number;
  tipAmount: number;
  cashTendered: number | null;
  changeGiven: number | null;
  status: "success" | "failed" | "refunded";
}

export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  modifiers: Array<{ name: string; price: number }>;
  totalPrice: number;
  status: string;
  notes: string | null;
}

export interface Receipt {
  orderId: string;
  type: "dine_in" | "takeaway" | "delivery";
  status: string;
  paymentStatus: "unpaid" | "partially_paid" | "paid" | "refunded";
  tableId: string | null;
  tableName: string | null;
  items: ReceiptItem[];
  subtotal: number;
  discountAmount: number;
  tax: ReceiptTax;
  totalAmount: number;
  totalPaid: number;
  totalTip: number;
  payments: ReceiptPayment[];
  createdAt: string;
  closedAt: string | null;
}

export interface AddPaymentDto {
  amount: number;
  method: "cash" | "card" | "online" | "other";
  tipAmount?: number;
  cashTendered?: number; // only for method: 'cash'
}

// Business tax settings (subset of Business)
export interface BusinessTaxSettings {
  taxRate: number; // 0–100
  taxName: string; // e.g. "IGI"
  taxIncluded: boolean;
}
```

---

## 8. Migration Notes for Existing Integrations

### Receipt shape breaking change

The old flat `taxAmount` field is **replaced** by a nested `tax` object:

```ts
// ❌ Before
receipt.taxAmount; // number, always 0

// ✅ After
receipt.tax.amount; // number, calculated
receipt.tax.name; // string
receipt.tax.rate; // number
receipt.tax.included; // boolean
```

Update any code that reads `receipt.taxAmount` to use `receipt.tax.amount`.

### Payment shape — additive change

The `cashTendered` and `changeGiven` fields on payments are **new and nullable**. Existing code that maps payment arrays will not break — just add the two new fields to your type definition.

### Tax on new orders — zero by default

If the business has not yet configured a tax rate (`taxRate: 0`), all orders continue to have `tax.amount = 0` and the receipt tax line should be hidden. No action needed on existing businesses until an owner sets their rate.

### Order `taxAmount` field

The `Order` entity and list responses also expose `taxAmount` directly. This field is now populated correctly for all new orders. Old orders created before this change will still show `taxAmount: 0` — this is expected and correct since no tax configuration existed at the time they were created.
