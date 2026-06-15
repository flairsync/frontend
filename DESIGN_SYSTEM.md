# FlairSync Design System
> Reference for the SaaS product (restaurant-saas/frontend) and any sibling properties (parent company site, marketing pages, etc.)

---

## 1. Typography

**Primary font:** `Plus Jakarta Sans` — weights 200–800, italic supported.

```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet">
```

| Role | Weight | Size scale |
|---|---|---|
| Display / Hero | `font-extrabold` (800) | `text-5xl` → `text-7xl` |
| Section heading | `font-bold` (700) | `text-3xl` → `text-5xl` |
| Sub-heading / Card title | `font-bold` (700) | `text-xl` → `text-2xl` |
| Body | `font-medium` (500) | `text-base` → `text-lg` |
| Caption / label | `font-medium` (500) | `text-sm` |
| Nav links | `font-medium` (500) | `text-sm` |

**Base font size:** `18px` (set on `<html>`).  
**Line-height for headings:** `leading-[1.2]`.  
**Mono:** reserved for code, IDs, receipts — never use for UI copy.

---

## 2. Color Tokens

All values are in **OKLCH**. Map them to CSS custom properties exactly as shown — the Tailwind `@theme inline` block exposes them as utility classes automatically.

### Light mode (`:root`)

| Token | OKLCH value | Approx. hex | Usage |
|---|---|---|---|
| `--primary` | `oklch(0.58 0.19 262)` | `#5B5EF4` (indigo-blue) | CTAs, links, active states, ring |
| `--primary-foreground` | `oklch(0.98 0.008 256)` | near white | text on primary bg |
| `--background` | `oklch(0.985 0.004 256)` | `#F8F8FC` | page bg |
| `--foreground` | `oklch(0.145 0.008 258)` | `#131318` | default text |
| `--card` | `oklch(1 0 0)` | `#FFFFFF` | card surfaces |
| `--card-foreground` | `oklch(0.145 0.008 258)` | `#131318` | text on cards |
| `--muted` | `oklch(0.962 0.006 258)` | `#F1F1F6` | subtle bg, tags |
| `--muted-foreground` | `oklch(0.50 0.014 260)` | `#767688` | secondary text |
| `--border` | `oklch(0.90 0.006 260)` | `#E2E2EA` | dividers, input borders |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `#E53E1A` | errors, delete |

**Highlight accent (used on pricing card CTA):** `#98D26C` — a fresh lime-green, white-label only for the "featured" plan button.  
**Gradient on featured card:** `from-[#8A89F9] to-[#6366F1]` (indigo).

### Dark mode (`.dark`)

| Token | OKLCH value | Notes |
|---|---|---|
| `--background` | `oklch(0.148 0.012 258)` | dark navy-gray |
| `--foreground` | `oklch(0.93 0.008 255)` | off-white |
| `--card` | `oklch(0.205 0.012 258)` | slightly lifted surface |
| `--primary` | `oklch(0.60 0.17 262)` | slightly brighter indigo |
| `--muted` | `oklch(0.268 0.012 258)` | dark tag/badge bg |
| `--border` | `oklch(1 0 0 / 13%)` | white at 13% opacity |

---

## 3. Spacing & Layout

| Concept | Value |
|---|---|
| Max content width | `max-w-7xl` (80rem / 1280px) |
| Page horizontal padding | `px-4 sm:px-6 lg:px-8` |
| Section vertical padding | `py-16 md:py-24` |
| Card gap (grid) | `gap-8` |
| Header height | `h-20` (80px), fixed + `backdrop-blur-xl bg-background/80` |

---

## 4. Border Radius

```css
--radius: 0.65rem;          /* base — used as rounded-lg */
--radius-sm: 0.40rem;       /* rounded-sm */
--radius-md: 0.55rem;       /* rounded-md */
--radius-xl: 0.90rem;       /* rounded-xl */
```

Cards: `rounded-xl`.  
Buttons (pill): `rounded-full`.  
Buttons (standard): `rounded-lg`.  
Inputs: `rounded-md` (inherits default radius).

---

## 5. Shadows

| Token | Where used |
|---|---|
| `shadow-lg` | standard card lift |
| `shadow-2xl` | hero image, featured pricing card |
| `shadow-md shadow-primary/20` | primary CTA button glow |
| `shadow-sm` | active toggle pill |

---

## 6. Animation

**Library:** [Anime.js v4](https://animejs.com/) for scroll-driven and entrance animations.  
**Library:** [Framer Motion](https://www.framer.com/motion/) for interactive state transitions (mobile nav, modals).

### Entry animations (scroll-driven)
- Fade + slide-up: `opacity [0→1], y ["10rem"→"0rem"]`, `duration: 3000`, `easing: inOutQuad`.
- Text reveal (word/char clip): `y ["120%"→"0%"]`, staggered by `125ms`.
- Char reveal (section titles): stagger `50ms`, `duration: 750`, `ease: out(3)`.

### Hover/interaction
- Lift on hover: `hover:scale-105 active:scale-95`.
- Transition: `transition-all duration-300`.
- Image tilt: `md:rotate-3 hover:rotate-0 transition-transform duration-500 ease-out`.

### Mobile nav (Framer Motion)
```tsx
initial={{ opacity: 0, height: 0 }}
animate={{ opacity: 1, height: "auto" }}
exit={{ opacity: 0, height: 0 }}
```

---

## 7. Component Patterns

### Header (sticky)
```
fixed top-0 w-full z-50
backdrop-blur-xl bg-background/80
border-b border-white/10 shadow-sm
h-20
```
- Logo left, nav links center (desktop), auth CTA right.
- CTA button: `rounded-full bg-primary`, pill shape.
- Active nav link: `text-primary font-bold` + animated underline SVG.
- Mobile: hamburger → `AnimatePresence` slide-down panel.

### Buttons

| Variant | Classes |
|---|---|
| Primary CTA | `bg-primary text-primary-foreground rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200` |
| Primary large | `px-8 py-6 text-lg rounded-lg font-bold hover:scale-105 active:scale-95 shadow-lg shadow-primary/20` |
| Outline | `border-2 rounded-lg font-bold hover:scale-105 active:scale-95` |
| Ghost nav | `hover:bg-primary/10 hover:text-primary` |
| Icon (social/submit) | `size-9 bg-primary text-primary-foreground rounded-md` |

### Cards
```
bg-card rounded-xl p-6 shadow-lg
border-none
hover:scale-[1.02] transition-all duration-300
```
**Featured card (pricing):** gradient `from-[#8A89F9] to-[#6366F1]`, `ring-4 ring-[#8A89F9]/50 shadow-2xl z-10`.

### Section structure
```tsx
<section className="py-16 md:py-24 bg-muted/50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6">...</h2>
    <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">...</p>
  </div>
</section>
```
Alternate section bg: `bg-muted/50` ↔ `bg-background`.

### Images
- Hero: `rounded-2xl overflow-hidden shadow-2xl`, aspect-ratio via `aspect-[4/3]`.
- Editorial pair: two images `w-[45%]` + `w-[55%]`, both `aspect-[3/4] rounded-2xl`, one `mt-12` offset.

### Footer
```
bg-card text-card-foreground
pt-12
4-column grid: logo+social | quick links | support | contact+newsletter
```
Separator: `<Separator className="my-12 border-border" />`.

---

## 8. Icon Library

**[Lucide React](https://lucide.dev/)** — always `w-4 h-4` for inline/nav icons, `w-5 h-5` for standalone/mobile.

---

## 9. Utility Stack

| Tool | Purpose |
|---|---|
| Tailwind CSS v4 | utility classes, `@theme inline` for custom tokens |
| `tw-animate-css` | Tailwind-native animate utilities |
| `class-variance-authority` (CVA) | component variant management |
| `cn()` from `@/lib/utils` | `clsx` + `tailwind-merge` |
| `shadcn/ui` | base component primitives (Button, Card, Input, Badge, Dropdown, etc.) |

---

## 10. Do / Don't

| Do | Don't |
|---|---|
| Use `--primary` / `text-primary` for brand color | Hardcode `#5B5EF4` inline |
| Keep section headings `font-extrabold` | Use `font-black` or `font-semibold` for h1/h2 |
| Use `bg-muted/50` for alternating section bgs | Introduce new gray values |
| Animate on scroll with Anime.js | Add CSS-only keyframe animations for entrance effects |
| `rounded-full` for pill CTAs, `rounded-xl` for cards | Mix radius conventions |
| `max-w-7xl mx-auto` for all page-width containers | Go wider than 1280px |
| Dark mode via `.dark` class token swap | Hard-code dark values in components |
