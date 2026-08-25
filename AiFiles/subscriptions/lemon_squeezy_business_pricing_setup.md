# Lemon Squeezy Setup — Per-Business Pricing

How to configure Lemon Squeezy so a pack's real bill matches what the Plans page calculator shows: a flat base price covering `includedBusinesses`, plus `extraBusinessPrice` per business beyond that, up to `maxBusinesses`.

## Status

The code side of this is already done and shipped:

- `Pack` entity has `includedBusinesses` / `extraBusinessPrice` (`flairsync-api/src/subscriptions/entities/pack.entity.ts`), editable per pack in the admin panel's Pricing page.
- The Plans page calculator (`models/SubscriptionPack.ts`) computes `price + extraBusinessPrice × max(0, count − includedBusinesses)`.
- Checkout and change-plan now send the selected business count to Lemon Squeezy as the line-item **quantity**:
  - New checkout: `flairsync-api/src/lemon/lemon.service.ts` → `createLemonCheckout(..., quantity)` sets `checkoutData.variantQuantities`.
  - Plan change on an existing subscription: `changeSubscriptionPlan(..., quantity)` swaps the variant, then calls Lemon's `updateSubscriptionItem` to set the new quantity (`invoiceImmediately: true`).
  - Both are already wired end-to-end from the Plans page stepper through the API.

**What's missing is entirely on the Lemon Squeezy side**: each pack's variant needs to be switched from flat/Standard pricing to a pricing model that actually understands quantity as "included + overage," so that a quantity of, say, 5 doesn't just multiply the full price by 5.

⚠️ **Do not test-checkout any pack with a business count greater than 1 until you've done this.** Right now the code sends `quantity` on every checkout — if the variant is still on Standard pricing, Lemon will multiply the *full* price by quantity, which is the exact bug this whole change was meant to fix, except now it happens for real inside Lemon Squeezy instead of just on the display. Business count of 1 is always safe (quantity × price = price, no-op) regardless of pricing model.

## The model to configure: Graduated Pricing

Lemon Squeezy's **Graduated Pricing** model lets you charge a different per-unit rate across tiers of quantity, with an optional flat fee per tier. That's exactly "N included, then charge per extra":

| Tier | Applies to | Unit price | Flat fee |
|---|---|---|---|
| 1 | units 1 – `includedBusinesses` | $0 | `price` (the pack's base price) |
| 2 | units `includedBusinesses`+1 – `maxBusinesses` | `extraBusinessPrice` | — |

Example — Pro: `price` = $49, `includedBusinesses` = 3, `extraBusinessPrice` = $12, `maxBusinesses` = 10. Selecting 5 businesses → $49 + 2×$12 = $73.

## Step by step, per pack variant

Do this **in Test Mode first**, for one pack, and verify a full test checkout before touching any other variant or going live.

1. **Lemon Squeezy dashboard → Products** → open the product for this pack (or the variant, if packs map 1:1 to variants — check `lemonProductId`/`lemonVariantId` on the pack in the admin Pricing page to know which one you're looking at).
2. Open the **variant's pricing settings** and change the pricing model from Standard to **Graduated**.
3. Add two tiers:
   - Tier 1: last unit = `includedBusinesses` (e.g. `3`), unit price = `0`, flat fee = the pack's `price` (e.g. `49.00`).
   - Tier 2: last unit = `maxBusinesses` (e.g. `10`, or leave open-ended if `maxBusinesses` is `-1`/unlimited), unit price = `extraBusinessPrice` (e.g. `12.00`).
4. **Before saving for real**, confirm in the Lemon Squeezy UI preview (most variant editors show a live price preview as you type quantities) that:
   - Quantity 1 through `includedBusinesses` all show exactly `price`.
   - Quantity `includedBusinesses + 1` shows `price + extraBusinessPrice`.
   - Quantity `includedBusinesses + 2` shows `price + 2×extraBusinessPrice`.

   This is the step that actually matters — confirm the flat fee behaves as "charged once, tier 1 only" and doesn't get re-charged or dropped when quantity crosses into tier 2. If the preview doesn't match, do **not** proceed to a real test checkout; the tier configuration needs adjusting first (this is the one piece of Lemon's UI behavior that can't be fully verified from documentation alone).
5. Save. Do a real **test-mode checkout** through the app (Plans page, select `includedBusinesses + 2` for this pack) and confirm the Lemon checkout page shows the expected total before paying.
6. Repeat for every pack/variant that should have overage pricing (packs with `includedBusinesses >= maxBusinesses`, or where `extraBusinessPrice` is `0`, don't need this — they're effectively flat-priced regardless of quantity).

## Keeping the two sides in sync

Lemon Squeezy's tiers and this app's `includedBusinesses`/`extraBusinessPrice` fields are **not linked automatically** — there's no API call that reads pricing tiers back from Lemon into our `Pack` entity. If you change one, change the other:

- Change a pack's price/included/extra in the admin Pricing page → go update the matching Graduated tiers in Lemon Squeezy.
- Change a tier in Lemon Squeezy → go update the pack's fields in the admin Pricing page.

A mismatch means the Plans page shows one number and Lemon Squeezy charges another — same class of bug as before, just moved to a different seam.

## Existing subscribers

Changing a variant's pricing model in Lemon Squeezy only affects *new* checkouts and subscription items going forward — it does not retroactively re-price subscriptions that already exist on that variant. Confirm this in test mode with a dummy existing subscription before relying on it for real subscribers, since Lemon's exact behavior here can change between UI versions.

## Going live checklist

- [ ] Every pack with `extraBusinessPrice > 0` has its Lemon Squeezy variant on Graduated pricing with tiers matching `includedBusinesses`/`extraBusinessPrice`/`maxBusinesses`.
- [ ] Test-mode checkout confirmed for at least one pack at quantity = `includedBusinesses` (should equal `price`) and quantity = `includedBusinesses + 1` (should equal `price + extraBusinessPrice`).
- [ ] Test-mode change-plan confirmed (upgrade an existing test subscription and change its business count) — this exercises `updateSubscriptionItem`, a different code path from checkout.
- [ ] Admin Pricing page values double-checked against the live Lemon Squeezy tiers for every affected pack.
- [ ] Switch from Lemon Squeezy Test Mode to Live only after all of the above pass.
