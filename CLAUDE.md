# CLAUDE.md — FlairSync Frontend

Orientation hub for this repo. It indexes the other docs (don't duplicate their content — go read them) and records the **current, verified** state of the codebase: actual feature/component inventory, actual `flairapi` behavior, actual i18n setup. Where this doc and another `.md` disagree, **trust this doc or the code**, not the older guide — see "Known Doc Drift" at the bottom.

## What This Is

FlairSync is a multi-tenant restaurant SaaS platform. This repo is the customer- and business-facing web frontend (Vike SSR + React 19). It covers: business setup (menus, taxes, hours), staff management (roles, teams, scheduling, shift swaps/bidding, time-off, attendance, payroll), orders (dine-in/takeaway/delivery lifecycle, payments, refunds), a Kitchen Display System and POS station app, table/floor-plan management, reservations (booking, walk-ins, lifecycle), inventory + recipes, analytics, a public discovery + booking + ordering flow for customers ("Diner Mode"), a jobs board/recruitment flow, a marketplace, and subscriptions/billing. See `AiFiles/FlairSync_Feature_Guide.md` for the full user-facing walkthrough of every feature.

## Documentation Map

| Doc | Covers | Read it when |
|---|---|---|
| `ARCHITECTURE.md` | The 2 hard placement rules (components/ vs features/) | Always applies — see below |
| `API_HOOKS_GUIDE.md` | service.ts / use[Feature].ts conventions, short version | Building a new feature's data layer |
| `API_PATTERNS.md` | Fuller axios+TanStack pattern reference (portable to Electron too) | Same as above, more detail/examples |
| `VIKE_PROJECT_GUIDE.md` | Full Vike routing conventions, guards, layouts, server entry, "Do Not" list | Adding/modifying a page, route guard, or SSR data loader |
| `DESIGN_SYSTEM.md` | Typography, OKLCH color tokens, spacing, shadows, component visual patterns | Any UI/styling work |
| `.cursorrules` | Dev-environment constraints (no prod builds, BASE_URL prefix rule) | Always applies |
| `AiFiles/FlairSync_Feature_Guide.md` | End-user-facing how-to for every feature | Understanding what a feature does from a user's POV |
| `AiFiles/<Feature>/*.md` | Backend-integration specs for specific feature changes (state machines, idempotency, v2 rewrites, etc.) | Working on that specific feature — see index below |

## Tech Stack

| Concern | Library |
|---|---|
| Framework | Vike (vike + vike-react + vike-react-query + vike-server) on Vite 7 |
| UI | React 19, Tailwind CSS v4, shadcn/ui (Radix primitives), CVA |
| Server | Hono (`server/index.js`, via vike-server) |
| HTTP | axios — single instance `flairapi` (`lib/flairapi.ts`) |
| Server state | TanStack Query v5 |
| Client state | Zustand v5 (sparingly — see State Management) |
| Forms | Formik + yup/zod |
| i18n | i18next + i18next-http-backend + react-i18next |
| Realtime | socket.io-client |
| Other | dayjs/date-fns, sonner (toasts), nprogress, react-secure-storage, framer-motion + animejs, maplibre-gl/leaflet (maps), @zxing (barcode/QR scan), @photo-sphere-viewer (virtual tours) |

## Architecture — Two Hard Rules

1. All React components (UI, layout, pages) live under `components/`.
2. All API calls, TanStack hooks, and store configs live under `features/`.

Pages (`pages/**/+Page.tsx`) call feature hooks and pass data down; they own local UI state only. No business logic or data fetching directly in a `+Page.tsx`.

## Non-Negotiable Rules

- Never run `npm run build`/production builds unless explicitly asked — stay inside `npm run dev`.
- Every new API call must be prefixed with the `BASE_URL` env var (`import.meta.env.BASE_URL`, currently `https://api.flairsync.com/api/v1`) — never hardcode absolute paths.
- Always call through `flairapi` (`@/lib/flairapi`). Never instantiate a new axios client, never set `withCredentials`/`timeout`/global headers anywhere else.
- Never use `localStorage`/`sessionStorage` for auth/session data — use `@/misc/SecureStorage`.
- Use the `@/` path alias everywhere; never relative-import more than one level up.
- No `useEffect` data fetching — TanStack Query only.
- `enabled: !!param` guard on any `useQuery` that depends on a route/business param.
- shadcn components in `components/ui/` are generated — don't hand-edit; regenerate via `npm run shadcn` (= `npx shadcn@latest add ...`).

## Verified Directory Map

```
pages/        Vike file-based routing (+Page.tsx, +Layout.tsx, +guard.ts, +data.js, +config.ts, +title.js)
features/     API calls + TanStack hooks + Zustand stores, one subfolder per domain
components/   Presentational React components, grouped by feature/domain
models/       TS classes with static parseApiResponse() factories
lib/          flairapi.ts + cross-cutting utils (dateUtils, formatCurrency, attendanceUtils, firebase, locationUtils)
misc/         SecureStorage.ts, FormValidators.ts
utils/        cookies.ts, currency.ts, date-utils.ts, error-utils.ts
hooks/        use-api-mutation.ts, use-mobile.ts, useSectionObserver.tsx
layouts/      LayoutDefault.tsx, LayoutPos.tsx, style.css, tailwind.css
translations/ i18n.ts only (locale strings live in public/locales/, see i18n section)
server/       index.js — Hono entry, injects cookies (user/tfa/session) into pageContext
data/         Static geo data (andorra.cities.json, andorra.geo.json, world.geo.json) for maps
```

Note: `utils/currency.ts` and `lib/formatCurrency.ts` both exist — check both before adding a new currency helper to avoid a third copy. `components/` also has a handful of root-level files (`ClientOnly.tsx`, `app-sidebar.tsx`, `search-form.tsx`, `version-switcher.tsx`, `comp-542.tsx`) that look like leftover shadcn sidebar-block scaffolding, not tied to a real feature.

### `features/` inventory (27 modules)

| Feature | Notes |
|---|---|
| `auth` | login/signup/verification + `usePermissions.ts`, `permissionsService.ts` |
| `business` | core business CRUD + nested `employment/`, `invitations/`, `menu/`, `reviews/`, `roles/`, `team/`, `taxes/`, `types/` |
| `orders` | order lifecycle + `discounts.ts`, `taxes.ts` |
| `reservations` | booking/lifecycle + `useReservationDashboard.ts`, customer timeline logic |
| `shifts` | scheduling split into 10 hooks: shifts, attendance, time-off, swaps, templates, absences, availability, recurring rules |
| `station` | POS/KDS device pairing, `useStationSocket.ts`, `offlineQueue.ts` |
| `pos` | `useStaffSession.ts` (PIN login), `types.ts` |
| `inventory` | items + `useInventoryGroups`, `useInventoryRecipes`, `useInventoryUnits` |
| `analytics` | `analytics.api.ts` + `useDashboardAnalytics.ts` |
| `notifications` | `useNotifications.ts` + `useNotificationSocket.ts` |
| `subscriptions` | billing/plans + `SubscriptionStore.ts` (upgrade modal) |
| `discovery` | public restaurant search (`discovery.api.ts`) |
| `diner-mode` | customer ordering UI state (`DinerModeStore.ts`) |
| `jobs` | postings + `useMyApplications.ts` |
| `marketplace` | listings |
| `payroll` | payroll generation/export |
| `audit` | audit log viewer |
| `profile` / `profileSettings` | own profile vs. settings (password, 2FA, deletion, data export) split |
| `floor-plan` | tables/floors |
| `tour` | onboarding tour (`tourStore.ts`, `usePageTour.ts`, `useTour.ts`) |
| `favorites` | customer favorites |
| `shared` | cross-feature platform data: `useAllergies`, `usePlatformCountries`, `usePlatformPermissions`, `api-response.ts` |
| `professionalProfile` | job-seeker profile |
| `support` | support ticket submission (service only, no hooks yet) |
| `system-errors` | `SystemErrorStore.ts` + `SystemErrorOverlay.tsx` (network/server lock screen, permission-denied modal) |
| `tasks` | staff task assignment |

### `components/` subdirectories

`ui`, `shared`, `inputs`, `helpers`, `staff`, `station`, `pos`, `management`, `profile`, `business_details`, `diner-mode`, `feed`, `analytics`, `jobs`, `landing`, `marketplace`, `notifications`, `payments`, `shift-tracking`, `tutorials`, `audit`, `subscriptions`

### `models/` — domain classes with `parseApiResponse()`

Top-level: `Business`, `BusinessCardDetails`, `Job`, `MarketplaceItem`, `Station`, `Subscription`, `SubscriptionPack`, `SubscriptionInvoice`, `Task`, `TfaStatus`, `UserAuthProfile`, `UserProfile`, `UserSession`.
Nested: `business/` (employee, invitation, tag, type, media, team, employment), `business/menu/`, `business/shift/`, `business/roles/`, `discovery/`, `inventory/`, `professional/`, `shared/`, `analytics/`.

### `pages/` route map (top-level)

`about`, `business/@id` (public profile), `diner/@businessId` (customer ordering, has its own `+Layout.tsx` + `menu`/`order` subroutes), `feed`, `forgot-password`, `gdpr`, `index`, `jobs`, `join`, `learn`, `login`, `manage` (the whole admin app, see below), `marketplace`, `notifications`, `privacy`, `profile`, `reset-password`, `signup`, `station` (`/station/kds`, `/station/pos`), `support`, `terms`, `tfa`, `verify`, `_error`.

`manage/@id/owner/*` and `manage/@id/staff/*` are the two role-scoped admin surfaces (same business, different permission level), each with its own subroutes: `analytics`, `attendance`, `audit-logs` (owner only), `branding` (owner only), `danger` (owner only), `dashboard`, `floor-plan` (owner only), `integrations` (owner only), `inventory`, `jobs` (owner only), `marketplace` (owner only), `menu`, `orders`, `payroll` (owner only), `reservations`, `reviews` (owner only), `schedule`, `settings` (owner only), `staff`, `stations` (owner only), `tasks`, plus staff-only `messages`. `manage/(global)/*` (billing, help, joined, overview, owned, plans, professional-profile, profile) is a route group shared across all businesses the user belongs to.

## `lib/flairapi.ts` — Verified Behavior

- The axios instance has **no `baseURL`** configured — every service call must build its own full path, prefixed with `import.meta.env.BASE_URL`. The one exception is the token-refresh call, which hardcodes the literal string `https://api.flairsync.com/api/v1/auth/refresh`.
- `withCredentials: true`, header `x-client-type: web`.
- `Timeouts` enum exported: `SHORT` (10s), `DEFAULT` (60s, the instance default), `UPLOAD` (300s) — pass via `{ timeout: Timeouts.SHORT }` per call.
- In-flight GET/HEAD requests are deduplicated by `method:url:params` key so concurrent identical calls share one network request.
- NProgress bar driven by active-request counter; a "taking longer than expected" toast fires after 4s if requests are still pending.
- On `auth.token.expired`: queues concurrent failed requests, calls refresh once, replays the queue. On refresh failure: if code is `auth.session.expired`, sets `localStorage.auth_logout_reason = 'inactivity'` and hard-redirects to `/login`; otherwise does `window.location.reload()`.
- On `auth.tfa.required`: redirects to `/tfa?origin=<current path>` (unless already on `/tfa`).
- On 403 with code containing `limit_reached` (or the legacy "Upgrade your subscription..." message): opens the subscription upgrade modal via `useSubscriptionStore.getState().openUpgradeModal()`.
- On any other 403: `useSystemErrorStore.getState().openPermissionDenied()`.
- On no response (network/CORS/timeout): `useSystemErrorStore.getState().lock('network')` + toast.
- On 5xx: `useSystemErrorStore.getState().lock('server')` + toast.

## State Management

- **TanStack Query** is the default for all server state — always.
- **Zustand** only for cross-component client UI state, currently 4 stores: `SubscriptionStore` (upgrade modal), `SystemErrorStore` (network/server lock screen, permission-denied modal — both driven from `flairapi.ts` interceptors), `DinerModeStore` (customer ordering UI state), `tourStore` (onboarding tour progress). Plus a staff-session store inside `features/pos/useStaffSession.ts`.
- No Redux. React context is used mainly via Vike's `pageContext` (user/tfa/session, injected server-side in `pages/+onCreatePageContext.server.js`, exposed client-side via `passToClient` in `pages/+config.ts`).

## i18n — Actual Implementation

Real setup (`translations/i18n.ts`) uses **`i18next-http-backend`** loading JSON files from `public/locales/{{lng}}/{{ns}}.json` — **not** the plain TS-object pattern shown in `VIKE_PROJECT_GUIDE.md`'s i18n section (that example is stale, see Known Doc Drift).

- Locales: `en`, `fr`, `es`, `cat` — files exist under `public/locales/<locale>/`.
- Namespaces: `common`, `landing`, `auth`, `feed`, `management`, `tutorials` (one JSON file per namespace per locale).
- Detection order: cookie (`getLangCookie()` from `@/utils/cookies`) → browser language → fallback `en`.
- `react.useSuspense: false` is set, so don't wrap translation-dependent components assuming Suspense.

## Realtime (Socket.io)

- `features/station/useStationSocket.ts` — used by `components/station/POSApp.tsx` and `KDSApp.tsx` for live order updates at the station/KDS level.
- `features/notifications/useNotificationSocket.ts` — separate connection for in-app notifications.

## AiFiles/ Index — Feature-Specific Integration Specs

These are point-in-time specs written when a backend feature shipped/changed — useful for understanding *why* something is built a certain way, not general conventions.

| Folder/File | Topic |
|---|---|
| `Auth/forgot_reset_password_frontend_guide.md` | Forgot/reset password flow |
| `DinerMode/frontend_diner_mode_guide.md`, `frontend_diner_mode_updates.md` | Customer ordering UI, later updates |
| `FloorPlan/frontend_floor_elements_guide.md` | Floor/table element editor |
| `Jobs/frontend_jobs_guide.md`, `frontend_jobs_update_hub_invite.md` | Jobs board; invite-button + status-freeze update |
| `KDS/kds_frontend_updates.md`, `POS/kds_frontend_guide.md` | Kitchen Display System |
| `POS/frontend_tax_receipt_guide.md`, `pos_frontend_guide.md` | POS taxes/receipts, core POS guide |
| `Station/frontend_station_guide.md` | Station pairing/device auth |
| `Marketplace/frontend-instructions.md`, `marketplace/marketplace-frontend-instructions.md` | Marketplace (two docs — check both, possibly duplicated/superseding) |
| `Notifications/frontend-integration.md` | Notification system integration |
| `Settings/frontend_settings_update.md` | Business settings updates |
| `Support/frontend_support_guide.md` | Support ticket flow |
| `Tasks/frontend_tasks_guide.md` | Task assignment |
| `Users/frontend_account_deletion_guide.md`, `frontend_data_export_guide.md` | GDPR deletion + export |
| `attendance/frontend_attendance_guide.md` | Attendance/clock in-out |
| `audits/audit_log_frontend_guide.md` | Audit log viewer |
| `frontend_delete_business_guide.md` (root) | Business deletion |
| `inventory/frontend_inventory_instructions.md` | Inventory module |
| `orders/frontend_idempotency_update.md`, `frontend_state_machine_update.md` | Order idempotency, order status state machine |
| `public/frontend_public_history_and_reviews.md` | Public profile history/reviews |
| `reservations/frontend_preorder_workflow.md`, `frontend_reservation_customer_timeline.md`, `frontend_reservation_detail_and_actions.md`, `frontend_reservation_v2.md` | Pre-order flow, customer timeline, reservation detail/actions, full V2 rewrite |
| `shifts/frontend_overtime_payroll_absence_guide.md` | Overtime/payroll/absence rules |
| `subscriptions/business_plan_frontend_guide.md` | Subscription plans |

## Known Doc Drift

- **i18n**: `VIKE_PROJECT_GUIDE.md`'s i18n section shows TS-object translation files (`translations/english_us.ts` etc.) and manual `resources` config. The actual code uses `i18next-http-backend` + JSON files in `public/locales/`. Trust the code (and the section above), not that guide's example.
- **Marketplace**: two near-duplicate AiFiles docs exist (`Marketplace/frontend-instructions.md` and `marketplace/marketplace-frontend-instructions.md`, different casing). Check both and look at git history/dates if they conflict.
