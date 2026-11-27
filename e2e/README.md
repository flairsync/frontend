# E2E suite (KAN-71 round 5)

Run against a real deployment:

```
BASE_URL=https://staging.flairsync.com \
E2E_BUSINESS_SLUG=bar-prueba-madrid \
E2E_TABLE_ID=1 \
E2E_OWNER_EMAIL=owner@example.com \
E2E_OWNER_PASSWORD=... \
npm run test:e2e
```

Without `BASE_URL`, Playwright starts `npm run dev` locally instead (see `playwright.config.ts`).

Required env vars for the guest-ordering suite (`guest-ordering.spec.ts`):
- `E2E_BUSINESS_SLUG` — slug of a published business with `allowOrders`, `allowTableOrdering`
  and at least one orderable menu item, with table ordering enabled.
- `E2E_TABLE_ID` — id/number of one of that business's tables (used to build `/tbl/{slug}/{id}`).
- `E2E_OWNER_EMAIL` / `E2E_OWNER_PASSWORD` — login for that business's owner, used only by the
  KAN-88 spec to verify the placed order reaches the Orders list.

If these aren't set, the specs that need them are skipped (reported, not silently green) rather
than failing on missing fixtures — this suite can't invent a seeded business in a staging DB it
doesn't control.

## What's NOT automated here

- **Kitchen Display Station (KDS) verification** (`/station/kds`) needs a paired station device
  (a `localStorage` token set via the station pairing flow) that this suite has no way to obtain
  non-interactively. `guest-ordering.spec.ts`'s KAN-88 test verifies the order reaching the
  owner's Orders list instead, which is driven by the same backend order-status data the KDS
  screen reads — but an actual KDS-screen render was not clicked through by this suite. Treat
  that leg of KAN-88 as a manual check until station pairing is scriptable.
- **SPF/DKIM/DMARC DNS verification** (KAN-75) is infra, not app behavior — not something a
  browser-driven E2E test can check from the frontend. See the backend's mail tests instead for
  what IS covered (link building, logo attachment).
