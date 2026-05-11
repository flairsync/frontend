# Vike Project Structure & Conventions Guide

This document is for AI agents building features in this project. Follow every convention here exactly — naming, folder placement, patterns, and library usage must match what is already established.

---

## Tech Stack

| Concern | Library |
|---|---|
| Framework | Vike (vike + vike-react + vike-react-query + vike-server) |
| Bundler | Vite 7 |
| UI | React 19 |
| Server | Hono (via vike-server) |
| HTTP client | axios (custom instance: `flairapi`) |
| Server state | TanStack Query v5 (`@tanstack/react-query`) |
| Client state | Zustand v5 |
| Forms | react-hook-form + `@hookform/resolvers` + zod or yup |
| UI components | shadcn/ui (Radix UI primitives) |
| Styling | Tailwind CSS v4 |
| Toasts | sonner |
| Icons | lucide-react + `@remixicon/react` |
| Date handling | dayjs + date-fns |
| i18n | i18next + react-i18next |
| Realtime | socket.io-client |
| Progress bar | nprogress |
| Storage | react-secure-storage |
| Animations | framer-motion + animejs |
| TypeScript | v5, strict mode |

---

## Folder Structure

```
/
├── pages/                    # Vike file-based routing
│   ├── +config.ts            # Global Vike config (layout, query defaults, passToClient)
│   ├── +Head.tsx             # Global <head> tags
│   ├── +onCreatePageContext.server.js  # SSR context (reads cookies via Hono)
│   ├── +onPageTransitionStart.ts       # NProgress start + body class
│   ├── +onPageTransitionEnd.ts         # NProgress done
│   ├── index/
│   │   ├── +Page.tsx
│   │   └── +config.js        # Per-page overrides (layout, ssr, etc.)
│   ├── [route]/
│   │   ├── +Page.tsx         # The page component
│   │   ├── +Layout.tsx       # Nested layout (optional)
│   │   ├── +guard.ts         # Auth guard
│   │   ├── +data.js          # Server-side data loader (SSR only)
│   │   ├── +config.js        # Route-level config overrides
│   │   └── +title.js         # Dynamic page title
│   └── @id/                  # Dynamic segments use @param convention
├── features/                 # Feature modules (business logic)
│   └── [featureName]/
│       ├── service.ts        # Raw axios API calls
│       ├── use[Feature].ts   # TanStack Query hooks
│       └── [FeatureName]Store.ts  # Zustand store (if needed)
├── components/               # Shared and feature UI components
│   ├── ui/                   # shadcn/ui generated components
│   ├── inputs/               # Reusable input components
│   ├── shared/               # App-wide shared components
│   └── [feature]/            # Feature-specific components
├── models/                   # TypeScript model classes with parsers
│   ├── [ModelName].ts
│   └── [domain]/
│       └── [ModelName].ts
├── hooks/                    # Generic reusable hooks
│   └── use-api-mutation.ts
├── lib/                      # Core utilities
│   ├── flairapi.ts           # Axios instance (THE http client)
│   └── utils.ts              # cn() and other shared helpers
├── layouts/                  # Vike layout components
│   ├── LayoutDefault.tsx
│   ├── LayoutPos.tsx
│   ├── tailwind.css          # Tailwind entry (imported in layouts)
│   └── style.css             # Global styles
├── misc/                     # App-level utilities
│   ├── SecureStorage.ts      # Wrapper for react-secure-storage
│   └── FormValidators.ts     # Shared validation helpers
├── utils/                    # Pure utility functions
│   ├── currency.ts
│   ├── date-utils.ts
│   └── error-utils.ts
├── translations/             # i18n
│   ├── i18n.ts               # i18next config
│   ├── english_us.ts
│   ├── french_fr.ts
│   ├── spanish_es.ts
│   └── catalan_cat.ts
├── assets/                   # Static assets (SVGs, images)
├── public/                   # Publicly served files
├── server/
│   └── index.js              # Hono server entry (reads cookies → sets pageContext)
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Path Alias

All imports use the `@/` alias which maps to the project root.

```typescript
import flairapi from "@/lib/flairapi";
import { UserProfile } from "@/models/UserProfile";
import { cn } from "@/lib/utils";
```

**Never use relative paths that go up more than one level.** Use `@/` instead.

---

## Routing (Vike)

Vike uses file-based routing. Every route is a folder inside `pages/` with a `+Page.tsx`.

### File naming conventions

| File | Purpose |
|---|---|
| `+Page.tsx` | The page component |
| `+Layout.tsx` | Nested layout wrapping child pages |
| `+config.ts` / `+config.js` | Route-level Vike config overrides |
| `+guard.ts` | Auth redirect logic (runs before render) |
| `+data.js` | Server-side data loader (SSR only, no credentials) |
| `+title.js` | Dynamic document title |
| `+Head.tsx` | Route-level head tags |

### Dynamic segments

Use `@param` for dynamic URL segments:

```
pages/manage/@id/owner/         → /manage/:id/owner/
pages/jobs/@slug/+Page.tsx      → /jobs/:slug
pages/manage/@id/owner/jobs/@jobId/applications/@appId/+Page.tsx
```

### Guard pattern

```typescript
// pages/[route]/+guard.ts
import { redirect } from "vike/abort";
import { PageContext } from "vike/types";

export const guard = (pageContext: PageContext) => {
  const { user } = pageContext;

  if (!user) {
    throw redirect("/login");
  }

  if (!user.hasPP) {
    throw redirect("/manage/join");
  }
};
```

### Nested layout pattern

```tsx
// pages/manage/(global)/+Layout.tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

Group folders like `(global)` are used purely for organization and do not affect the URL.

### Server-side data loader

```javascript
// pages/[route]/+data.js  — runs on server only, plain JS
import axios from "axios";

export async function data(pageContext) {
  try {
    const id = pageContext.routeParams.id;
    const response = await axios.get(`https://api.example.com/resource/${id}/metadata`);
    return { resourceMeta: response.data.data };
  } catch {
    return { resourceMeta: null };
  }
}
```

Data loaders use plain `axios` (not `flairapi`) because they run server-side with no browser cookies.

### PageContext (SSR hydration)

`pages/+onCreatePageContext.server.js` reads Hono cookies and injects them into `pageContext`:

```javascript
export async function onCreatePageContext(pageContext) {
  const user = pageContext.hono.get("user");
  const tfa = pageContext.hono.get("tfa");
  const sess = pageContext.hono.get("session");

  pageContext.user = user;
  pageContext.tfa = tfa;
  pageContext.session = sess;
  return { user, tfa, session: sess };
}
```

`passToClient: ["user", "tfa", "session"]` is set in `pages/+config.ts` so these values are available client-side via `usePageContext()`.

---

## HTTP Client: `flairapi`

**Always import and use `flairapi` for all API calls**, never raw axios in components or features.

```typescript
import flairapi from "@/lib/flairapi";
```

`flairapi` is an axios instance (`withCredentials: true`) that handles:
- NProgress bar on every request
- Slow network toast after 4 seconds
- Automatic token refresh on `auth.token.expired` error code (queues concurrent requests)
- 403 subscription limit modal
- Network/server error lock screen (via `SystemErrorStore`)
- Global error toasts

**Never create another axios instance.** Never configure `withCredentials`, `timeout`, or global headers outside of `lib/flairapi.ts`.

---

## Feature Module Pattern

Every feature lives in `features/[featureName]/` with this structure:

```
features/
└── orders/
    ├── service.ts       ← axios calls only
    ├── useOrders.ts     ← TanStack Query hooks
    └── OrdersStore.ts   ← Zustand store (only if needed)
```

### service.ts — API call layer

Rules:
- Export functions named with `ApiCall` suffix: `fetchOrdersApiCall`, `createOrderApiCall`
- Build URLs with `import.meta.env.BASE_URL` if the endpoint is relative, or use the full API base URL
- Define request DTOs inline (`CreateOrderDto`, `UpdateOrderDto`) if not already in `@/models`
- For file uploads, use `FormData` and set `Content-Type: multipart/form-data`

```typescript
// features/orders/service.ts
import flairapi from "@/lib/flairapi";

export type CreateOrderDto = {
  tableId: string;
  items: { menuItemId: string; quantity: number }[];
};

export const fetchOrdersApiCall = (businessId: string) => {
  return flairapi.get(`/business/${businessId}/orders`);
};

export const createOrderApiCall = (businessId: string, data: CreateOrderDto) => {
  return flairapi.post(`/business/${businessId}/orders`, data);
};

export const uploadOrderReceiptApiCall = (orderId: string, file: File) => {
  const payload = new FormData();
  payload.append("receipt", file);
  return flairapi.post(`/orders/${orderId}/receipt`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
```

### use[Feature].ts — Hook layer

Rules:
- File starts with `use` lowercase: `useOrders.ts`
- Use `useQuery` for fetching, `useMutation` (or `useApiMutation`) for mutations
- Always provide a descriptive `queryKey` array
- Invalidate or refetch on mutation success
- Use `sonner` toast for user feedback
- Use `useApiMutation` (from `@/hooks/use-api-mutation`) for typed axios error handling

```typescript
// features/orders/useOrders.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOrdersApiCall, createOrderApiCall, CreateOrderDto } from "./service";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { toast } from "sonner";

export const useOrders = (businessId: string) => {
  const queryClient = useQueryClient();

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ["orders", businessId],
    queryFn: async () => {
      const resp = await fetchOrdersApiCall(businessId);
      return resp.data.data;
    },
    enabled: !!businessId,
  });

  const { mutate: createOrder, isPending: creatingOrder } = useApiMutation({
    mutationFn: (data: CreateOrderDto) => createOrderApiCall(businessId, data),
    onSuccess: () => {
      toast.success("Order created");
      queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? "Failed to create order");
    },
  });

  return { orders, isLoading, createOrder, creatingOrder, refetch };
};
```

### useApiMutation

Thin wrapper around `useMutation` with typed `AxiosError`:

```typescript
// hooks/use-api-mutation.ts
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useApiMutation<TData = any, TVars = any>(
  options: UseMutationOptions<TData, AxiosError<{ message: string }>, TVars>
) {
  return useMutation<TData, AxiosError<{ message: string }>, TVars>(options);
}
```

Use `useApiMutation` instead of raw `useMutation` for any call that uses `flairapi` so you get typed error messages.

---

## Zustand Stores

Store files are named `[Feature]Store.ts` and live inside `features/[featureName]/`.

```typescript
// features/orders/OrdersStore.ts
import { create } from "zustand";

interface OrdersState {
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  selectedOrderId: null,
  setSelectedOrderId: (id) => set({ selectedOrderId: id }),
}));
```

Access state imperatively (outside React) via `.getState()`:

```typescript
useOrdersStore.getState().setSelectedOrderId("123");
```

---

## Model Classes

Models live in `models/` and are TypeScript classes with:
- Constructor for all fields
- Static `parseApiResponse(data: any)` factory method
- Helper methods as needed

```typescript
// models/Order.ts
import dayjs from "dayjs";

export class Order {
  id: string;
  status: string;
  total: number;
  createdAt: Date;

  constructor(id: string, status: string, total: number, createdAt: Date) {
    this.id = id;
    this.status = status;
    this.total = total;
    this.createdAt = createdAt;
  }

  static parseApiResponse(data: any): Order | null {
    if (!data) return null;
    return new Order(data.id, data.status, data.total, new Date(data.createdAt));
  }

  getFormattedDate() {
    return dayjs(this.createdAt).format("YYYY-MM-DD");
  }
}
```

Domain-specific models are nested: `models/business/shift/Shift.ts`, `models/inventory/InventoryItem.ts`.

---

## Components

### Naming

- Feature components: `PascalCase` matching the feature name, e.g., `OrdersTable.tsx`, `OrderCreateModal.tsx`
- Shared inputs: live in `components/inputs/`
- shadcn/ui components: live in `components/ui/` (auto-generated, do not edit manually)
- App-wide shared components: live in `components/shared/`

### Component co-location

Large pages sometimes co-locate sub-section components next to the `+Page.tsx`:

```
pages/manage/@id/owner/staff/
├── +Page.tsx
├── StaffSection.tsx        ← co-located sub-component
├── InvitationsSection.tsx
└── RolesSection.tsx
```

Only do this for page-specific sections that won't be reused. Reusable components go in `components/[feature]/`.

### Styling

Use Tailwind utility classes. Merge conditionally with `cn()` from `@/lib/utils`:

```tsx
import { cn } from "@/lib/utils";

<div className={cn("base-class", isActive && "active-class", className)} />
```

---

## Global Vike Config (`pages/+config.ts`)

```typescript
import type { Config } from "vike/types";
import vikeReact from "vike-react/config";
import Layout from "../layouts/LayoutDefault.js";
import vikeReactQuery from "vike-react-query/config";
import vikeServer from "vike-server/config";

export default {
  Layout,
  title: "AppName",
  description: "...",
  extends: [vikeReact, vikeReactQuery, vikeServer],
  server: "server/index.js",
  passToClient: ["user", "tfa", "session"],
  queryClientConfig: {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    },
  },
} satisfies Config;
```

Per-page config (`+config.js`) overrides these defaults.

---

## Server Entry (Hono)

```javascript
// server/index.js
import { Hono } from "hono";
import { apply } from "vike-server/hono";
import { serve } from "vike-server/hono/serve";
import { getCookie } from "hono/cookie";

function startServer() {
  const app = new Hono();

  app.use("*", async (c, next) => {
    const userCookie = getCookie(c, "user");
    const tfaCookie = getCookie(c, "tfa");
    const sessionId = getCookie(c, "sid");

    let user = null;
    if (userCookie) {
      user = JSON.parse(userCookie.replace(/^j:/, ""));
    }

    c.set("user", user);
    c.set("tfa", tfaCookie ?? null);
    c.set("session", { id: sessionId });

    await next();
  });

  apply(app);
  return serve(app, {});
}

export default startServer();
```

---

## Default Layout

```tsx
// layouts/LayoutDefault.tsx
import "./style.css";
import "nprogress/nprogress.css";
import "./tailwind.css";
import "@/translations/i18n";
import { clientOnly } from "vike-react/clientOnly";
import { Toaster } from "@/components/ui/sonner";

const ThemeProvider = clientOnly(() => import("@/components/shared/theme-provider"));

export default function LayoutDefault({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
```

Use `clientOnly()` from `vike-react/clientOnly` for components that must not SSR.

---

## i18n

```typescript
// translations/i18n.ts — init once, import as side-effect in LayoutDefault.tsx
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: { en: { translation: english_us }, fr: { translation: french_fr } },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});
```

In components:

```tsx
import { useTranslation } from "react-i18next";
const { t } = useTranslation();
t("some.key", "Fallback string");
```

Translation files export plain objects: `translations/english_us.ts`.

---

## Navigation

Use Vike's router for programmatic navigation:

```typescript
import { navigate } from "vike/client/router";
navigate("/dashboard");
```

For links in JSX use standard `<a href="...">` or a `Link` component from `vike-react` if available.

---

## Vite Config

```typescript
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vike(), react(), tailwindcss()],
  build: { target: "es2022", sourcemap: false },
  resolve: {
    alias: { "@": new URL("./", import.meta.url).pathname },
  },
  define: { "process.env": {} },
});
```

---

## tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "types": ["vite/client", "vike-react"],
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "paths": { "@/*": ["./*"] },
    "noEmit": true,
    "skipLibCheck": true
  }
}
```

---

## SecureStorage

Use the wrapper in `misc/SecureStorage.ts` for any sensitive client-side storage:

```typescript
import { saveJwtToken, getJwtToken } from "@/misc/SecureStorage";
```

Never use `localStorage` directly for sensitive data.

---

## Quick Reference: What Goes Where

| What | Where |
|---|---|
| New page | `pages/[route]/+Page.tsx` |
| Auth guard | `pages/[route]/+guard.ts` |
| SSR data fetch | `pages/[route]/+data.js` |
| API calls | `features/[feature]/service.ts` |
| Query/mutation hooks | `features/[feature]/use[Feature].ts` |
| Client state | `features/[feature]/[Feature]Store.ts` |
| Data model/class | `models/[ModelName].ts` |
| Reusable component | `components/[feature]/[ComponentName].tsx` |
| shadcn component | `components/ui/` (use `npx shadcn@latest add`) |
| Generic hook | `hooks/use-[name].ts` |
| Pure utility fn | `utils/[name].ts` |
| App-level util | `lib/[name].ts` |
| Translation key | `translations/english_us.ts` (and all other locale files) |

---

## Do Not

- Do not create raw axios instances — use `flairapi`
- Do not use `localStorage` or `sessionStorage` for auth data — use `SecureStorage`
- Do not put business logic in `+Page.tsx` — extract to feature hooks
- Do not use relative imports that go up more than one level — use `@/`
- Do not add `useEffect` for data fetching — use TanStack Query
- Do not put server-side code (Node.js APIs, DB calls) in `+Page.tsx` — use `+data.js`
- Do not skip the `enabled: !!param` guard in `useQuery` when the query depends on a param
- Do not hardcode API base URLs in service files without using `import.meta.env.BASE_URL` or a config constant
