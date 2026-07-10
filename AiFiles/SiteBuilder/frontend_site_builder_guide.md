# Frontend Guide: Business Website Builder (Site Builder)

Base URL: `https://api.flairsync.com/api/v1`

---

## Overview

Owners can build their own customer-facing website by dragging pre-made components (header, menu list, gallery, hours, reviews, etc.) onto a page, configuring each one, and publishing. The backend already exists and is done — this guide is scoped purely to the frontend: an **owner-facing designer** and a **public renderer**.

Two surfaces to build:

1. **Designer** (owner, authenticated) — where an owner builds/edits/publishes their site.
2. **Renderer** (public, no auth) — where the saved page is actually displayed to customers.

For this pass, mount the renderer at a **new, separate test route**: `pages/business/@id/site/`. Do **not** touch the existing `pages/business/@id/+Page.tsx` (the current hardcoded profile page) — that stays as-is until we decide whether the site builder replaces it or lives alongside it.

---

## 1. What Already Exists (Backend)

### Owner-facing (draft/publish CRUD)

Guarded by `JwtCookieGuard` + `EffectivePermissionsGuard`, permission key `WEBSITE` (already added to the roles system — will show up in the roles/permissions UI like Menu, Orders, etc. automatically, no frontend change needed there beyond checking `hasPermission("WEBSITE", action)`).

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/businesses/:businessId/site-pages` | — | List all pages (draft + published state) for the nav/page list |
| GET | `/businesses/:businessId/site-pages/:pageId` | — | Full page incl. `draftContent` |
| POST | `/businesses/:businessId/site-pages` | `{ slug, title }` | Create a page. `slug` must match `^[a-z0-9-]+$` |
| PATCH | `/businesses/:businessId/site-pages/:pageId` | `{ title?, order? }` | Update page metadata |
| PATCH | `/businesses/:businessId/site-pages/:pageId/draft` | `{ sections: [...] }` | Save the working draft (see content shape below) |
| POST | `/businesses/:businessId/site-pages/:pageId/publish` | — | Copies `draftContent` → `publishedContent`, sets `isPublished: true` |
| POST | `/businesses/:businessId/site-pages/:pageId/unpublish` | — | Sets `isPublished: false` (content is kept, page just stops being served publicly) |
| DELETE | `/businesses/:businessId/site-pages/:pageId` | — | Delete |

### Public-facing (published only, no auth)

Added to the existing `discovery` controller — same style as `/discovery/businesses/:id/menu`, `/reviews`, etc.

| Method | Path | Returns |
|---|---|---|
| GET | `/discovery/businesses/:id/site-pages` | `{ slug, title, order }[]` — published pages only, for building a nav |
| GET | `/discovery/businesses/:id/site-pages/:slug` | `{ slug, title, publishedContent, publishedAt }` — 404 if no published page at that slug |

**Important:** the public endpoint never returns `draftContent` — only ever the last-published snapshot. If a business has no published page for a slug, you'll get a 404. The renderer must handle that (see §5, default fallback).

### Page content shape

```ts
interface SitePageContent {
  sections: {
    id: string;
    order: number;
    components: {
      id: string;
      typeKey: string;         // e.g. "menu-list@1" — points into the frontend component registry, backend never interprets it
      order: number;
      props: Record<string, any>;       // static config: text, colors, image urls, spacing
      bindings?: Record<string, any>;   // explicit pointers to live data, e.g. { items: { source: "menuCategory", categoryId: 5 } }
    }[];
  }[];
}
```

`props` vs `bindings`: anything the owner typed/picked by hand is a prop. Anything that should always reflect current database state (menu items, review count, opening hours) is a binding, resolved at render time — never bake live data into `props` at save time or menu changes won't show up on the public page.

---

## 2. Library Decision: reuse `@dnd-kit`, don't add a page-builder framework

The obvious instinct is to reach for a full page-builder toolkit (Puck, Craft.js, GrapesJS). **Don't** — for this codebase specifically:

- `@dnd-kit/core` + `@dnd-kit/sortable` are **already a dependency** and already solve this exact interaction elsewhere: menu category/item reordering (`components/management/menu/DNDSortableCategories.tsx`, `MenuCategoryCardSortable.tsx`), station reordering (`pages/manage/@id/owner/stations/+Page.tsx`), and branding gallery reordering. The site builder's canvas is fundamentally the same problem — an ordered list of blocks the owner can reorder, add to, and remove — not free-form x/y placement (that's what Floor Plan does, and it's a heavier, purpose-built canvas that would be overkill here).
- A full page-builder framework brings its own canvas/hydration/serialization assumptions that would have to be reconciled with Vike's SSR + `vike-react-query` hydration model. Not worth the integration risk for a save of maybe a few days.
- Palette → drop-onto-canvas (adding a *new* component) is the one interaction pattern not already in the codebase, but `@dnd-kit` supports multiple drag sources and drop zones out of the box — it's the same primitives, just a second `DndContext` region.

**Recommendation:** build the designer canvas as a `DndContext` with `SortableContext` (`verticalListSortingStrategy`) per section, following `DNDSortableCategories.tsx` as the direct template, plus a component palette panel that's a second drag source into the same context.

The app is already on **Vike** (`vike-react` + `vike-react-query` + `vike-server`) — no framework migration needed anywhere in this task.

---

## 3. Component Registry

The registry is the link between saved `typeKey` strings and actual React components. It must be importable from **both** the designer (for the palette + prop editor) and the public renderer (to actually render), so put it in a shared feature folder, not inside either page.

```
features/site-builder/
  registry/
    index.ts              // COMPONENT_REGISTRY map + resolve() function
    components/
      Header.tsx
      MenuList.tsx
      Gallery.tsx
      OpeningHours.tsx
      Contact.tsx
      Reviews.tsx
      CallToAction.tsx
      Fallback.tsx         // "fallback@1" — reserved, never removable
  service.ts               // API calls (owner CRUD + public reads)
  useSiteBuilder.ts         // TanStack Query hooks (mirrors features/floor-plan/useFloorPlan.ts)
  bindings.ts               // maps binding `source` → existing discovery API calls
  components/
    SiteBuilderDesigner.tsx  // DndContext canvas + palette (owner side)
    SiteBuilderCanvas.tsx    // shared section/component list renderer (used by both designer preview and public page)
    SiteBuilderRenderer.tsx  // resolves + renders a SitePageContent for the public page
```

```ts
// features/site-builder/registry/index.ts (shape)
export interface RegistryEntry {
  component?: React.ComponentType<any>;
  propsSchema?: Record<string, any>;   // drives the designer's prop-editing panel
  label?: string;                      // shown in the palette
  deprecated?: boolean;
  migrateTo?: string;                  // next typeKey in the chain
  migrate?: (oldProps: Record<string, any>) => Record<string, any>;
}

export const COMPONENT_REGISTRY: Record<string, RegistryEntry> = {
  "header@1": { component: Header, propsSchema: {...}, label: "Header" },
  "menu-list@1": { component: MenuList, propsSchema: {...}, label: "Menu List" },
  "gallery@1": { component: Gallery, propsSchema: {...}, label: "Photo Gallery" },
  "opening-hours@1": { component: OpeningHours, label: "Opening Hours" },
  "contact@1": { component: Contact, label: "Contact & Map" },
  "reviews@1": { component: Reviews, label: "Reviews" },
  "call-to-action@1": { component: CallToAction, label: "Reserve / Order Button" },
  "fallback@1": { component: Fallback }, // reserved — never delete this key
};

// Walks migrateTo chains; falls back to "fallback@1" if no live component is reached.
export function resolveComponent(typeKey: string): { Component: React.ComponentType<any>; props: (raw: any) => any } { /* ... */ }
```

**MVP component list** — pick these first since each one already has a live public data source to bind to:

| typeKey | Bound to (existing endpoint) |
|---|---|
| `header@1` | static props only (logo/name pulled from business profile as default) |
| `menu-list@1` | `GET /discovery/businesses/:id/menu` |
| `gallery@1` | business `media` (already on `/discovery/businesses/:id` profile response) |
| `opening-hours@1` | business `openingHours` (same profile response) |
| `reviews@1` | `GET /discovery/businesses/:id/reviews` + `/reviews/stats` |
| `contact@1` | business profile (`address`, `phone`, `email`, `location`) |
| `call-to-action@1` | static props (links to existing reservation/order flow) |

### Versioning & fallback (carried over from the architecture discussion — implement it now, not later)

- Never delete a registry key outright. Deprecate it: set `deprecated: true`, `migrateTo: "x@2"`, and a `migrate()` function converting old props to new. Only actually remove the entry once you've confirmed (ask backend/DB) nothing references it anymore.
- `resolveComponent` walks `migrateTo` chains applying `migrate` at each hop until it finds an entry with a real `component`.
- If a `typeKey` isn't in the registry and no chain resolves it, render `fallback@1`. In the **designer**, show it visibly flagged ("This block is no longer supported — remove or replace it"). On the **public page**, skip rendering that instance silently (don't show a broken block to a customer) but `console.warn`/log it so it's noticed.

---

## 4. Owner Designer

Route: `pages/manage/@id/owner/website/+Page.tsx` (sibling of `.../owner/floor-plan`, `.../owner/menu`).

- Gate with `usePermissions` the same way other owner pages do — `hasPermission("WEBSITE", "read"|"update")` (see `features/auth/usePermissions.ts`).
- Page list view: fetch via `GET /businesses/:businessId/site-pages`, show create/rename/delete, publish/unpublish toggle (surface `isPublished` + `publishedAt`).
- Editor view: load one page's `draftContent`, render `SiteBuilderCanvas` in edit mode — sections as sortable groups, components within each section sortable via `@dnd-kit`, a palette panel to drag new components from the registry's `label` list, and a prop-editing side panel driven by the selected component's `propsSchema`.
- Save button → `PATCH .../draft`. Debounce or explicit save button, your call — this isn't collaborative editing, so no need for realtime sync.
- Publish button → `POST .../publish`, with a confirmation toast; unpublish similarly.
- Model pagination/mutation hooks in `useSiteBuilder.ts` exactly like `features/floor-plan/useFloorPlan.ts` (React Query `useQuery`/`useMutation`, `unwrap()` from `features/shared/api-response.ts`).

---

## 5. Public Renderer (test route)

Route: `pages/business/@id/site/+Page.tsx` — new, parallel to the existing `pages/business/@id/+Page.tsx`.

Follow the exact SSR pattern already used on the existing business profile page (`withFallback` + `useSuspenseQuery`, see `pages/business/@id/+Page.tsx` for the template):

1. Fetch `GET /discovery/businesses/:id/site-pages/home` (hardcode slug `home` for this test route; a slug-aware route can come later).
2. **If 404** (no published page yet): render a **default fallback template** — don't show a blank page. Compose it from data already available via `fetchDiscoveryProfileApiCall` + `fetchDiscoveryMenuApiCall` (the same calls the existing profile page already makes): a hero with the business name/logo/description, the menu, opening hours, contact info. This can literally reuse the existing presentational components (`BusinessDetailsHero`, `BusinessDetailsMenu`, `BusinessDetailsTiming`, `BusinessDetailsContact`) as the "default site" — the owner just hasn't customized anything yet, so show what we already show today.
3. **If found**: resolve each component instance's `bindings` (see `bindings.ts` below) in parallel with the page fetch, then render via `SiteBuilderCanvas` in read-only/public mode, passing each component its `props` merged with resolved binding data.

```ts
// features/site-builder/bindings.ts (shape)
type BindingSource = "menuCategory" | "businessReviews" | "businessProfile" | ...;

export async function resolveBinding(businessId: string, binding: { source: BindingSource; [k: string]: any }) {
  switch (binding.source) {
    case "menuCategory": return fetchDiscoveryMenuApiCall(businessId); // filter by binding.categoryId client-side or extend endpoint later
    case "businessReviews": return fetchReviewsApiCall(businessId);
    // ...
  }
}
```

Resolve all bindings for all components on the page in one `Promise.all` alongside the page-content fetch, inside the same `useSuspenseQuery` block the existing profile page already uses — keeps it server-rendered and avoids client-side waterfalls.

---

## 6. Out of Scope for This Pass (flag, don't build)

- **Theme/global colors & fonts** — no entity exists yet (branding page today only has logo + gallery + virtual tour, no color/theme fields). Don't invent one; surface per-component color props for now if a component needs it, and revisit a shared theme entity as a fast-follow once the component set stabilizes.
- **Multi-slug/multi-page public routing** (`/site/:slug`) — this pass hardcodes `home`. Extending to arbitrary slugs is a small follow-up once the mechanics are proven.
- **Custom domains / subdomains** — not needed to validate the mechanics at `business/@id/site`.

---

## 7. Suggested Build Order

1. `features/site-builder/service.ts` — all 8 owner endpoints + 2 public endpoints, `unwrap()`-wrapped, matching `discovery.api.ts` conventions.
2. `features/site-builder/registry/` — build the 7 MVP components (can start as visually simple, styled placeholders) + `resolveComponent`.
3. `features/site-builder/useSiteBuilder.ts` — query/mutation hooks.
4. `features/site-builder/components/SiteBuilderCanvas.tsx` — shared renderer (both edit and read-only mode via a prop).
5. Owner designer page (`pages/manage/@id/owner/website/`) — page list → editor → publish flow.
6. Public test route (`pages/business/@id/site/`) — published fetch, fallback-to-default-template on 404, binding resolution.
7. Wire up the fallback/migration behavior in the registry resolver, verify by manually saving a page with a `typeKey` that isn't in the registry and confirming it degrades gracefully on both surfaces.
