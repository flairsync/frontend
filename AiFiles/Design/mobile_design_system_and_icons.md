# FlairSync Mobile — Design System & Icon Usage

**Audience:** frontend agents building the public guest app, the staff app and the manager app.

This is a **port target**, not a proposal. Everything here is what the web frontend
(`restaurant-saas/frontend`) actually renders today, read out of the code. Follow the
decisions and the vocabulary; write idiomatic code for your platform.

## How this fits with the specs you already have

| Doc | Covers | Relationship |
|---|---|---|
| `AiFiles/MobileApp/guest_app_navigation_spec.md` | Guest app tabs, screens, data | Navigation. Still current. |
| `AiFiles/EasyMode/android_easy_mode_prompt.md` | Easy Mode shell, registry, vocabulary | Navigation + IA. Still current. |
| **This doc** | Color, type, spacing, icons, touch targets | **Visual layer under both.** |

Those two say *what screens exist and what they're called*. This says *what they look like
and which icon goes where*. Read this one first if you are restyling; read theirs first if
you are adding a screen.

## Authority order

When sources disagree, trust in this order:

1. `layouts/tailwind.css` — the only true source for color, radius, root font size.
2. `features/navigation/taskRegistry.ts` — the only true source for navigation, icons, wording.
3. The component code on the matching web surface (table below).
4. `DESIGN_SYSTEM.md` — written for the **marketing site**, partly drifted from the app. Loses to 1–3.

Known drift, so it doesn't trip you: `DESIGN_SYSTEM.md` §10 forbids `font-black`. The app uses
it 136 times. That is not rule-breaking — it's a second register (see Typography).

| Your app | Web surface to read |
|---|---|
| Public guest app | `pages/diner/@businessId/*`, `pages/business/@id`, `components/diner-mode/` |
| Staff app | `pages/manage/@id/staff/*`, `/station/pos`, `/station/kds`, `components/pos/`, `components/station/` |
| Manager app | `pages/manage/@id/owner/*`, `pages/manage/(global)/*`, `components/management/` |

---

## 1. Color

All color is OKLCH, exposed as semantic tokens. **Port the token names, not the values.** A
screen that references `primary` stays correct when the brand shifts; one that hardcodes
indigo does not. There is no literal brand hex anywhere in the app.

| Token | Light | Dark | Use for |
|---|---|---|---|
| `background` | `oklch(0.985 0.004 256)` | `oklch(0.148 0.012 258)` | Screen background |
| `foreground` | `oklch(0.145 0.008 258)` | `oklch(0.93 0.008 255)` | Default text |
| `card` | `oklch(1 0 0)` | `oklch(0.205 0.012 258)` | Raised surface, list rows |
| `card-foreground` | `oklch(0.145 0.008 258)` | `oklch(0.93 0.008 255)` | Text on cards |
| `popover` | `oklch(1 0 0)` | `oklch(0.205 0.012 258)` | Sheets, menus, dialogs |
| `primary` | `oklch(0.58 0.19 262)` | `oklch(0.60 0.17 262)` | CTAs, active state, focus ring |
| `primary-foreground` | `oklch(0.98 0.008 256)` | `oklch(0.97 0.010 255)` | Text on primary |
| `secondary` | `oklch(0.962 0.006 258)` | `oklch(0.268 0.012 258)` | Secondary buttons |
| `muted` | `oklch(0.962 0.006 258)` | `oklch(0.268 0.012 258)` | Subtle fill, chips, skeletons |
| `muted-foreground` | `oklch(0.50 0.014 260)` | `oklch(0.65 0.014 260)` | Secondary text |
| `accent` | `oklch(0.962 0.006 258)` | `oklch(0.268 0.012 258)` | Hover/pressed fill |
| `border` | `oklch(0.90 0.006 260)` | `oklch(1 0 0 / 13%)` | Dividers, outlines |
| `input` | `oklch(0.90 0.006 260)` | `oklch(1 0 0 / 16%)` | Field borders |
| `ring` | `oklch(0.58 0.19 262)` | `oklch(0.60 0.17 262)` | Focus ring |
| `destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.65 0.20 22)` | Errors, destructive actions |

Charts: `chart-1` … `chart-5` exist and **differ between light and dark** — port them from
`layouts/tailwind.css` if you render analytics. A `sidebar-*` set also exists; ignore it
unless you build a drawer mirroring the web sidebar.

### Four things that go wrong when porting

- **Dark mode is a root token swap, never a per-component branch.** Define both palettes once
  and switch at the root. Any `if (isDark)` inside a component is a bug.
- **Dark `border` and `input` are white at 13% / 16% alpha**, not solid gray. Keep the alpha —
  they are designed to sit on whatever surface is under them.
- **Dark `muted-foreground` is *lighter* than light mode** (0.65 vs 0.50). Don't share one value.
- **`secondary`, `muted` and `accent` are currently identical.** Keep them as three separate
  tokens anyway; they exist to diverge later.

---

## 2. Typography

**Font:** Plus Jakarta Sans, weights 200–800. Mono is reserved for code, IDs and receipts —
never UI copy.

### The root font-size ladder — read this before anything else

The web sets `html { font-size: var(--font-size-base) }` and sizes everything in rem, so this
one value scales the **whole UI**, not just type. It is both a responsive rule and a
user-facing accessibility control (`components/shared/text-size-provider.tsx`).

| Setting | Phone (<640px) | Tablet/desktop |
|---|---|---|
| Default | **16px** | 18px |
| Large | 18px | 20px |
| Extra Large | 20px | 22px |

Two reasons phones get 16px and not the 18px house base:

1. 18px made every utility one notch bigger than its name — `text-lg` rendered at 20.25px —
   which is what left headings and menu names truncating at 360px.
2. 16px is the threshold below which iOS Safari zooms the page on field focus.

**What this means for you:** expose the same three-step control, persist it per device, and
make sure each step moves the same two notches. It is a real accessibility escape hatch for
users who are often 50+ and reading a phone mid-service — not a cosmetic preference. On
native, map it onto the platform's own font-scale API rather than reinventing it, but keep the
three labelled steps so the setting reads the same across web and app.

### Two registers

The app deliberately runs two type registers. Use the one that matches the surface.

| | Product register | Device register |
|---|---|---|
| Where | Guest app, manager app, most of staff app | POS / till / KDS screens only |
| Headings | `font-bold` / `font-extrabold` | `font-black`, often `uppercase` |
| Labels | `font-medium` / `font-semibold`, sentence case | `font-black uppercase tracking-widest`, 10–12px |
| Feel | Calm, readable, consumer | Dense, high-contrast, glanceable at arm's length |

Measured usage: `font-black` appears 136 times, **107 of them in `components/station/` and
`components/pos/`** and zero in landing or diner-mode. So this split is real and intentional,
not drift. The device register exists because a till is read standing up, at distance, in a
hurry. Don't take it into the guest app, and don't take the product register into the till.

### Scale (product register)

| Role | Weight | Size |
|---|---|---|
| Screen title | extrabold (800) | 24–30px |
| Section heading | bold (700) | 18–20px |
| Card title | semibold/bold (600–700) | 14–16px |
| Body | medium (500) | 14–16px |
| Secondary / caption | medium (500), `muted-foreground` | 12–13px |
| Tab bar label | medium (500) | 10px |
| Section eyebrow | semibold, `uppercase tracking-wide`, `muted-foreground` | 12–14px |

Heading line-height: 1.2.

---

## 3. Spacing, radius, touch targets

**Radius** — base `--radius: 0.65rem` (10.4px), with a derived scale:

| Name | Value | Use |
|---|---|---|
| `sm` | base − 4px | Small chips, inner elements |
| `md` | base − 2px | Inputs |
| `lg` | base (10.4px) | Standard buttons |
| `xl` | base + 4px | Cards |
| `2xl` (16px) | — | **Launcher tiles**, sheets |
| full | — | Pills, avatars, icon buttons |

Don't mix conventions: cards are `xl`, tiles are `2xl`, pills are full.

**Sheets** are the dominant mobile container — bottom-anchored, `rounded-t-2xl`/`3xl`,
`max-h-[85–90dvh]`, scrollable. Use `dvh`, not `vh`.

### Touch targets — the web sizes are NOT good enough

The shadcn `Button` defaults to `h-9` (36px). **That is below every platform minimum** (44pt
iOS / 48dp Android). The web gets away with it because it is mostly used with a mouse. Where
the web itself expects touch it already goes bigger, and those are the numbers to copy:

| Element | Web value | Port as |
|---|---|---|
| Guest tab bar | `h-16` (64px) | 56–64dp |
| Launcher search + buttons | `h-12` (48px) | ≥48dp |
| Launcher tile | ~96px tall, full-width cell | ≥88dp |
| Tile icon badge | 48×48px | 48dp |
| Anything else interactive | — | **≥44pt / 48dp, no exceptions** |

**Safe areas are already handled on the web diner surface** — copy the pattern rather than
inventing one. Bottom nav uses `pb-[env(safe-area-inset-bottom)]`; sheets and floating bars
use `max(<base>, env(safe-area-inset-bottom))` so they never lose their own padding on a
device without a notch. See `pages/diner/@businessId/+Layout.tsx` and
`components/diner-mode/DinerCartFab.tsx`.

---

## 4. Icons

**Library: [Lucide](https://lucide.dev/).** It has first-party or community ports for Android
(Compose), iOS (SwiftUI) and React Native. Use Lucide — do not substitute Material or SF
Symbols. The icon *is* the navigation in Easy Mode, so an owner who learns a shape on the web
must meet the same shape in the app.

### Sizes

Measured across ~1,400 icon usages:

| Size | Where | Share |
|---|---|---|
| 16px (`w-4 h-4`) | Default — inline, buttons, list rows, menu items | ~65% |
| 12–14px | Dense metadata, badges, inline hints | ~15% |
| 20px (`w-5 h-5`) | Standalone, tab bar, sheet headers | ~15% |
| 24px (`w-6 h-6`) | Launcher tile badges, feature headers | ~4% |
| 32px (`w-8 h-8`) | Empty-state illustration, avatars | rare |

**Default to 16px inline and 20px standalone.** Stroke weight stays at Lucide's default (2) —
the app never overrides it.

### The accent system

Launcher tiles carry a colour accent, defined once in `TILE_ACCENTS`
(`features/navigation/taskRegistry.ts`). Eight accents, each a three-part recipe:

- **surface** — accent at **500/10%** (light) or **400/10%** (dark), behind the icon
- **icon** — accent **600** (light) or **400** (dark)
- **ring** — accent at **500/40%**, on hover/press only

These are Tailwind's stock palette, *not* the semantic tokens above. Exact values:

| Accent | 400 | 500 | 600 |
|---|---|---|---|
| orange | `oklch(75% 0.183 55.934)` | `oklch(70.5% 0.213 47.604)` | `oklch(64.6% 0.222 41.116)` |
| amber | `oklch(82.8% 0.189 84.429)` | `oklch(76.9% 0.188 70.08)` | `oklch(66.6% 0.179 58.318)` |
| emerald | `oklch(76.5% 0.177 163.223)` | `oklch(69.6% 0.17 162.48)` | `oklch(59.6% 0.145 163.225)` |
| sky | `oklch(74.6% 0.16 232.661)` | `oklch(68.5% 0.169 237.323)` | `oklch(58.8% 0.158 241.966)` |
| blue | `oklch(70.7% 0.165 254.624)` | `oklch(62.3% 0.214 259.815)` | `oklch(54.6% 0.245 262.881)` |
| violet | `oklch(70.2% 0.183 293.541)` | `oklch(60.6% 0.25 292.717)` | `oklch(54.1% 0.281 293.009)` |
| rose | `oklch(71.2% 0.194 13.428)` | `oklch(64.5% 0.246 16.439)` | `oklch(58.6% 0.253 17.585)` |
| slate | `oklch(70.4% 0.04 256.788)` | `oklch(55.4% 0.046 257.417)` | `oklch(44.6% 0.043 257.281)` |

Accent is **identity, not status**. It never means "good" or "urgent" — it exists so owners
navigate by colour+shape instead of reading every label. Keep each tile's accent stable
forever; a tile that changes colour has to be relearned.

### Rules for picking an icon

1. **Don't pick one.** Look it up in `APP_TILES` / `TaskAction.icon`. If it's in the registry,
   the decision is already made.
2. If a screen genuinely isn't in the registry, **add it to the registry** — web and mobile
   read the same list. A feature that exists in one shell and not the other is the failure
   mode the registry was built to prevent.
3. **An icon never travels alone on a tile.** Every tile is icon + plain name + one-line
   description. As the source comment puts it: *"an icon alone is only obvious to whoever
   chose it."* Keep all three on mobile, even when space is tight.

---

## 5. The tile catalogue — 38 destinations

The canonical icon-to-meaning map, from `APP_TILES`. Roles: **O** = manager/owner app,
**S** = staff app. Guest app is not registry-driven — see §6.

### Today's service — *"What you need while you're open"*

| Key | Label | Icon | Accent | Roles |
|---|---|---|---|---|
| `dashboard` | Overview | `LayoutDashboard` | blue | O S |
| `orders` | Orders | `ShoppingBag` | orange | O S |
| `reservations` | Bookings | `CalendarCheck` | violet | O S |
| `floor-plan` | Tables | `LayoutGrid` | emerald | O |
| `tasks` | Tasks | `ClipboardList` | sky | O S |
| `shifts` | My shifts | `CalendarRange` | violet | S |
| `messages` | Messages | `MessageSquare` | sky | S |
| `pos-app` | Till | `MonitorSmartphone` | orange | O S |
| `kds-app` | Kitchen screen | `ChefHat` | rose | O S |

### Your place — *"Your menu, your team and how you run"*

| Key | Label | Icon | Accent | Roles |
|---|---|---|---|---|
| `menu` | Menu | `Utensils` | orange | O S |
| `inventory` | Stock | `PackageOpen` | amber | O S |
| `staff` | Team | `Users` | sky | O S |
| `schedule` | Rota | `CalendarRange` | violet | O S |
| `attendance` | Hours worked | `ClockFading` | emerald | O |
| `settings` | Opening hours & details | `Settings` | slate | O |

### Money & growth — *"What you earn and how to grow it"*

| Key | Label | Icon | Accent | Roles |
|---|---|---|---|---|
| `analytics` | Sales & reports | `BarChart3` | blue | O |
| `payments` | Card payments | `CreditCard` | emerald | O |
| `payroll` | Pay | `Banknote` | emerald | O |
| `tip-pooling` | Tips | `HandCoins` | amber | O |
| `discounts` | Offers | `Tag` | rose | O |
| `loyalty` | Loyalty | `Gift` | rose | O S |
| `reviews` | Reviews | `Star` | amber | O |
| `feedback` | Private feedback | `MessageSquareHeart` | violet | O |
| `fiscal-invoices` | Tax receipts | `Receipt` | slate | O |
| `fiscal-services` | Tax setup | `FileSpreadsheet` | slate | O |

### Setup & extras — *"Everything else you can set up"*

| Key | Label | Icon | Accent | Roles |
|---|---|---|---|---|
| `branding` | Logo & photos | `Images` | violet | O |
| `themes` | Colours | `Palette` | rose | O S |
| `menu-boards` | Menu screens | `MonitorPlay` | sky | O S |
| `stations` | Devices | `Tablet` | blue | O |
| `nfc-tags` | Tap cards | `Nfc` | sky | O S |
| `wifi` | Guest WiFi | `Wifi` | emerald | O S |
| `announcements` | Notices | `Megaphone` | amber | O |
| `jobs` | Hiring | `Briefcase` | blue | O |
| `marketplace` | Marketplace | `Store` | orange | O |
| `alerts` | Things to fix | `Bell` | amber | O |
| `audit-logs` | Activity history | `ScrollText` | slate | O |
| `data-export` | Data & backups | `DatabaseBackup` | sky | O |
| `danger` | Close or delete | `ShieldAlert` | rose | O |

Labels above are the English strings from `public/locales/en/management.json`. Note the
casing shift: registry tile keys are kebab-case (`floor-plan`, `pos-app`, `fiscal-invoices`)
while their locale keys are snake_case (`floor_plan`, `pos_app`, `fiscal_invoices`), and
`shifts` maps to `my_shifts`. Convert, don't assume. **Pull the real
strings from the locale files, never retype them** — every tile also has a `description` and a
`synonyms` list feeding search, and locales are `en`, `es-ES`, `fr-FR`, `ca` (BCP-47 dirs,
managed through Tolgee).

---

## 6. Wording rules

Copied verbatim from the registry, because this is what non-technical owners actually read:

> - labels are plain nouns a café owner would say out loud ("Stock", not "Inventory
>   Management"; "Tap cards", not "NFC").
> - descriptions are one short sentence, no jargon, no feature names.
> - actions are verb-first and always use the SAME verb for the same idea. We "Add" things. We
>   never "Create", "New" or "Register" them.
> - synonyms exist so search works when their word isn't our word.

The last one matters more than it looks: search over synonyms is how someone who calls it a
"floor plan" finds the tile called "Tables".

---

## 7. Per-app notes

### Public guest app

Consumer register throughout — product typography, generous spacing, no `font-black`, no
uppercase micro-labels. It is **not** registry-driven; follow
`AiFiles/MobileApp/guest_app_navigation_spec.md`.

The web diner surface is your closest model and already solves the mobile problems:

- **Bottom tab bar:** 64px tall, 20px icons, 10px medium labels, `primary` when active and
  `muted-foreground` when not, `pb-[env(safe-area-inset-bottom)]`.
- **Badges:** 16px min-width pill on the icon, `primary` fill, 10px bold, `99+` cap.
- **Item detail:** bottom sheet, `rounded-t-2xl`, `max-h-[90dvh]`, scrollable, safe-area padded.
- **Cart FAB:** floats above the tab bar at `max(6rem, 6rem + safe-area-inset-bottom)`.

### Staff app

Two registers in one app, and the boundary is the point:

- **Management screens** (`manage/@id/staff/*`) — product register, Easy Mode shell, tiles.
- **Till and kitchen screens** (`/station/pos`, `/station/kds`) — device register. Heavy
  weights, uppercase micro-labels, dense grids, big tap targets, high contrast. These are
  full-attention screens used standing up; they do not get a tab bar or a launcher.

Permission-gate every tile. Staff tiles carry a `permission: { key, action }` and are hidden
when the check fails. Owners skip the check entirely.

### Manager app

Product register, full Easy Mode. `AiFiles/EasyMode/android_easy_mode_prompt.md` is the spec —
key points that bear on design:

- **Easy Mode is the default**, not an opt-in. The audience is non-technical.
- Mode is stored **per device**, not per account (a shared floor tablet ≠ the manager's phone).
- **Launcher grid:** 1 column on phones, 2 at ≥640px, 3 at ≥1024px, 4 at ≥1280px, 12px gaps.
- **Every destination gets a tile** — no curated "top 10". Users star favourites and hide what
  they never use. Both are presentation-only, stored per device.
- **Landing on a screen shows real data plus a row of big icon+verb action buttons**, so the
  main things you can do are visible without hunting through tabs.

---

## 8. Pitfalls the web already hit

Four of these are verified in the current code. Don't repeat them.

1. **One over-wide child breaks the whole screen.** The manage layout's content container was
   `overflow-scroll`, so a single too-wide tab strip shifted *every* card and heading sideways.
   It now uses `overflow-y-auto overflow-x-hidden … min-w-0`. Because it clips instead of
   scrolling, **any wide child must carry its own horizontal scroll or wrap.** Equivalent trap
   on native: an unconstrained row inside a vertical scroll container.

2. **Centred tab strips can't be scrolled to.** `TabsList` still ships `justify-center`
   (`components/ui/tabs.tsx:17`). A centred flex row that overflows spills off *both* edges and
   the left overflow is unreachable — `scrollLeft` stays 0 while the first tab sits at negative
   x. Scrollable tab strips need start alignment, not just overflow. Its `h-10` also makes
   wrapped rows overlap; wrapping strips need auto height.

3. **Don't trust the declared type of a money field.** The API serialises Postgres `decimal`
   columns as **strings** (`"10.00"`), while the TypeScript types say `number`. This shipped a
   till crash (`toFixed is not a function`) and silently wrong tax on inclusive-tax businesses,
   because `100 + "10.00"` concatenates. **Coerce every money and rate field at the API
   boundary**, in one normalise step, not at each call site.

4. **Same-screen navigation can silently no-op.** On web, an action button pointing at the
   screen you're already on only swaps the URL — the screen never remounts, so anything reading
   its params on mount never fires. The web works around it with an action bus that publishes
   params in place. If your router reuses screen instances, handle the same case explicitly.

5. **Don't let the launcher and the old navigation drift.** Both read one registry. Adding a
   feature without a registry entry should fail a test.

---

## 9. Checklist for a screen

- [ ] Every colour is a semantic token; no hex, no per-component dark-mode branch
- [ ] Verified in dark mode, including alpha borders
- [ ] Correct type register for the surface (product vs device)
- [ ] Readable at the Large and Extra Large text steps without truncating
- [ ] Laid out at 360px wide with no horizontal overflow
- [ ] Every interactive target ≥44pt / 48dp
- [ ] Bottom-anchored UI respects the safe-area inset
- [ ] Icons are Lucide, from the registry, 16px inline / 20px standalone
- [ ] Tile accent matches the registry and hasn't been repurposed as a status colour
- [ ] All copy from the locale files; no retyped or invented labels
- [ ] New destination? Added to the registry, with label, description, synonyms, icon, accent, section, roles, permission

---

## Open questions worth raising before you start

- Should the text-size setting sync per account, or stay per device as on web? Web chose per
  device deliberately; a shared tablet argues for keeping that.
- Do the till and kitchen screens belong in the staff app at all, or stay a separate
  device-mode app? The web treats them as a separate shell with its own layout.
