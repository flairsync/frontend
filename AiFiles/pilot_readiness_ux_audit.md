# Pilot Readiness UX Audit — 2026-10-14

Full-platform UI/UX audit against the bar "ready for the first paying pilot restaurants running live service." Published report: https://claude.ai/artifact/HwGHtMh57G9xco4oaRMX4Q

Methodology: three parallel code audits (Diner Mode & public pages; owner/staff manage app; POS/KDS & auth) against actual component/page source, cross-checked against AiFiles integration docs and prior known-issue notes. Findings reflect code state as read, not documentation's description of it where the two disagreed.

Check items off as they're fixed. Severity/effort are as judged at audit time — re-triage if scope turns out different once you're in the code.

## Systemic issue: i18n coverage has silently regressed

All three audits independently found hardcoded English on screens a translated app shouldn't have. Sharpest case: **Simple Mode is the default UI for every new signup** and has 0 of 218 keys translated outside English (fr-FR/es-ES/ca) — exactly this platform's target locale set. Treat non-English-pilot readiness as blocked until this is addressed.

## Phase 1 — before any pilot invite goes out

- [x] Fix Join invitation page: add loading/error state for `loadingInvitationDetails` (currently renders "Join undefined"), guard `handleRefuse` against invalid/expired token like `handleAccept` already does, remove dead commented `useJoinInvitation` reference. — `pages/join/+Page.tsx` — High / M
- [x] ~~Translate Simple Mode's default-shell strings for fr-FR/es-ES/ca~~ — **false positive, verified 2026-10-14.** All 218 `simple_mode` keys already exist and are properly translated in `fr-FR`/`es-ES`/`ca` management.json (not just present — spot-checked for machine-translation artifacts and English fallback leakage, found none). Original audit agent likely checked the wrong locale dir names (`fr`/`es`/`cat` per CLAUDE.md's stale naming) instead of the real ones. No action needed.
- [x] Fix hardcoded `$` currency symbol on customer's own order history — use the shared currency formatter instead. — `components/business_details/BusinessDetailsUserHistory.tsx:95,104,266` — High / S
- [x] Give the table-QR landing route a server-side redirect instead of client `useEffect` + `window.location.replace` (SSR renders nothing, blank screen until hydration on every scan). — `pages/diner/@businessId/+Page.tsx:8-10` — High / S
- [x] Translate the welcome checklist (menu/floor-plan/staff/publish steps). — `components/management/dashboard/WelcomeChecklist.tsx:46-106` — High / S-M
- [x] Translate the TFA page (zero `t()` calls, no locale keys exist). — `pages/tfa/+Page.tsx` — High / S
- [x] Translate Diner Mode order-error toasts (duplicate order at table, failed submit, failed feedback). — `features/diner-mode/useDinerMode.ts:215,223,237,255` — High / S

## Phase 2 — before the first live dinner service

- [x] Add a visible connection/reconnecting indicator to the station socket (no `connect_error`/`disconnect` handling today — silent drop with wifi still up gives staff zero signal). — `features/station/useStationSocket.ts:18-39` — High / M
- [x] Detect "backend unreachable," not just local NIC online/offline — the banner misses the likeliest real outage (wifi up, backend down). — `features/station/useNetworkStatus.ts`, `offlineQueue.ts:126-129` — High / M
- [x] Distinguish "wrong PIN" from "network failure" on staff PIN login — currently any no-response error falls through to the generic incorrect-PIN message. — `components/pos/StaffPinScreen.tsx:63-74` — High / S
- [ ] Add an audio alert for new KDS tickets (toast-only today; easy to miss in a loud kitchen). — `components/station/KDSApp.tsx:598-601` — Medium/High / S-M
- [ ] Bump KDS ticket text size for at-a-glance legibility (currently 9-11px for most fields). — `components/station/KDSApp.tsx` — Medium / M
- [ ] Fix KDS item-list 260px scroll cap so allergen notes on long orders can't scroll out of view during a rush. — `components/station/KDSApp.tsx:340` — Medium / S

## Phase 3 — during the pilot, not blocking it

- [ ] Consolidate the two competing dashboard pages (`owner/home` current Easy View launcher vs legacy `owner/dashboard`, which also has no real loading/error handling).
- [ ] Wire onboarding tour (`usePageTour`) into Menu and Floor Plan setup — currently only schedule/settings/attendance/staff.
- [ ] Extend Simple Mode's mobile-card layout to Schedule, Reservations, Menu, Tasks, Attendance (works today on orders/home/floor-plan/inventory/staff).
- [ ] Translate header tax-ID warning + Live/Draft publish pill (`pages/manage/@id/owner/+Layout.tsx:168-171,186`) — shown on every page.
- [ ] Translate Alerts & Warnings page heading/tabs (`pages/manage/@id/owner/alerts/+Page.tsx:19-29`).
- [ ] Translate "Unknown Table" fallback (`owner/orders/+Page.tsx:243`) and upgrade-limit modal message (`owner/menu/+Page.tsx:69`).
- [ ] Replace `window.location.reload()` after station pairing with a bootstrap refetch. — `components/station/StationBootstrap.tsx:54` — Low / S
- [ ] Marketplace guest loading state: replace plain text with the skeleton pattern used elsewhere. — `pages/marketplace/guest/+Page.tsx:34` — Low / S
- [ ] Idle-exit modal in Diner Mode auto-navigates home after 12s by default — cancelable, low risk, but matches a previously-flagged auto-navigation pattern; reconsider the default. — `pages/diner/@businessId/+Layout.tsx:140-146` — Medium / S
- [ ] Code hygiene: stray `;;` import (`owner/tasks/+Page.tsx:2`), ~30 lines dead commented sidebar code (`owner/+Layout.tsx:241-269`).

## Already solid — don't touch

Checked against the same bar and held up: Diner Mode's core ordering path (menu/variants/modifiers/allergens/cart/idempotent submit/order-status progression, full i18n on the `diner` namespace); reservation/booking flow states; login/signup/reset-password error handling; the network/server lock-screen (CLAUDE.md's description of it as auto-reloading is stale — code already fixed); Shift Scheduling clarity pass; Business Alerts feature; staff dashboard; the mobile tab-overflow bug from an earlier audit (no longer reproduces); the latest POS item-variants-modal commit (complete, not mid-stream).

## Related

- `AiFiles/i18n` remediation is a separate, older, narrower backlog (113-file gap found 2026-08-23) — this audit's i18n findings are additive to that one, not a duplicate.
