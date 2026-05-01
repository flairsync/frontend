# API & Data Fetching Patterns

This document describes the folder structure and conventions for making API calls using **Axios** + **TanStack Query**. Follow these patterns in any new project (including Electron).

---

## Folder Structure

```
src/
├── components/          # UI / presentational components only — no data fetching
│   └── [feature]/
├── features/            # All API logic, hooks, and domain types
│   └── [feature]/
│       ├── service.ts       # API call functions + DTOs + TypeScript interfaces
│       ├── useXxx.ts        # TanStack Query hooks (useQuery / useMutation)
│       └── types.ts         # (optional) separate domain types when the file gets large
├── lib/
│   └── api.ts           # Axios instance — single shared client
├── utils/               # Pure helpers (currency, dates, error parsing)
├── hooks/               # Global React hooks (non-feature-specific)
└── pages/ (or views/)   # Route-level components — consume hooks, own local state
```

### Rules

- `features/` owns all data logic. Components never import axios directly.
- `components/` are presentational — they receive data/callbacks as props.
- Page/view components call hooks and pass data down.
- One feature = one subfolder in `features/`. Sub-features get their own subfolder (e.g. `features/business/menu/`).

---

## 1. API Client (`lib/api.ts`)

One shared Axios instance. All interceptors live here.

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,       // use false + Authorization header for Electron/token auth
  timeout: 60000,
  headers: {
    "x-client-type": "desktop",
  },
});

// Token refresh interceptor
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

const processQueue = (error: any) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(null)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const errorCode = error.response?.data?.code;

    if (errorCode === "auth.token.expired" && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        await api.post("/auth/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

> **Electron note:** If you store the token in `localStorage` or the OS keychain instead of cookies, set `withCredentials: false` and attach the token as a `Bearer` header in a request interceptor.

---

## 2. Service File (`features/[feature]/service.ts`)

Contains API call functions and TypeScript interfaces. Nothing else.

```typescript
import api from "@/lib/api";

// URL builder — local to this file
const url = (businessId: string) => `/businesses/${businessId}/orders`;

// ── DTOs (request body shapes) ───────────────────────────────────────────────
export interface CreateOrderDto {
  type: "dine_in" | "takeaway" | "delivery";
  tableId?: string;
  items: {
    menuItemId: string;
    quantity: number;
    notes?: string;
  }[];
}

// ── Domain types (response shapes) ──────────────────────────────────────────
export type OrderStatus =
  | "created"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed"
  | "canceled";

export interface Order {
  id: string;
  businessId: string;
  type: "dine_in" | "takeaway" | "delivery";
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// ── API call functions ───────────────────────────────────────────────────────
export const fetchOrdersApiCall = (
  businessId: string,
  status?: "ongoing" | "all" | OrderStatus
) => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  const qs = params.toString();
  return api.get(qs ? `${url(businessId)}?${qs}` : url(businessId));
};

export const fetchOrderApiCall = (businessId: string, orderId: string) =>
  api.get(`${url(businessId)}/${orderId}`);

export const createOrderApiCall = (businessId: string, data: CreateOrderDto) =>
  api.post(url(businessId), data);

export const updateOrderApiCall = (
  businessId: string,
  orderId: string,
  data: Partial<CreateOrderDto>
) => api.patch(`${url(businessId)}/${orderId}`, data);

export const acceptOrderApiCall = (businessId: string, orderId: string) =>
  api.patch(`${url(businessId)}/${orderId}/accept`, {});

export const deleteOrderApiCall = (businessId: string, orderId: string) =>
  api.delete(`${url(businessId)}/${orderId}`);
```

### Rules

- Every function returns the raw Axios promise — no `.then()` chaining here.
- DTOs and domain types are co-located in the same file unless there are many (then split to `types.ts`).
- URL builders are local functions, not exported.
- No error handling, no toast — that belongs in the hooks.

---

## 3. TanStack Query Hook (`features/[feature]/useOrders.ts`)

One hook file per feature (or multiple when the feature is large). Wraps `useQuery` and `useMutation`.

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchOrdersApiCall,
  createOrderApiCall,
  acceptOrderApiCall,
  Order,
  CreateOrderDto,
  OrderStatus,
} from "./service";

export const useOrders = (
  businessId: string,
  status?: "ongoing" | "all" | OrderStatus
) => {
  const queryClient = useQueryClient();

  // ── READ ──────────────────────────────────────────────────────────────────
  const { data: orders, isFetching: fetchingOrders, refetch } = useQuery<Order[]>({
    queryKey: ["orders", businessId, status ?? "ongoing"],
    queryFn: async () => {
      const resp = await fetchOrdersApiCall(businessId, status);
      // Handle both response.data and response.data.data shapes
      const raw = resp.data;
      const payload = raw?.data !== undefined ? raw.data : raw;
      return Array.isArray(payload) ? payload : (payload?.data ?? []);
    },
    enabled: !!businessId,
  });

  // ── CREATE ────────────────────────────────────────────────────────────────
  const createOrderMutation = useMutation({
    mutationFn: (data: CreateOrderDto) => createOrderApiCall(businessId, data),
    onSuccess: () => {
      toast.success("Order created");
      queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to create order");
    },
  });

  // ── ACCEPT ────────────────────────────────────────────────────────────────
  const acceptOrderMutation = useMutation({
    mutationFn: (orderId: string) => acceptOrderApiCall(businessId, orderId),
    onSuccess: () => {
      toast.success("Order accepted");
      queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
    },
    onError: (error: any) => {
      const code = error.response?.data?.code;
      if (code === "order.invalid_transition") {
        toast.error("Order was already updated. Refreshing...");
        queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
        return;
      }
      toast.error(error.response?.data?.message ?? "Failed to accept order");
    },
  });

  return {
    orders: orders ?? [],
    fetchingOrders,
    refetchOrders: refetch,
    createOrder: createOrderMutation.mutate,
    isCreatingOrder: createOrderMutation.isPending,
    acceptOrder: acceptOrderMutation.mutate,
    isAcceptingOrder: acceptOrderMutation.isPending,
  };
};
```

### Rules

- **Query key shape:** `[resourceName, scopeId, ...filters]` — e.g. `["orders", businessId, status]`
- Always call `invalidateQueries` on mutation success, targeting the relevant key prefix.
- `onError` → toast notification. Never handle errors in the component.
- Return a flat object: query data, loading flags, and mutation trigger functions together.
- Use `mutate` (fire-and-forget) for click handlers; use `mutateAsync` when you need to `await` the result.

---

## 4. QueryClient Setup (`main.tsx`)

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
```

---

## 5. Consuming Hooks in a Page/View

```typescript
// pages/OrdersPage.tsx
import { useState } from "react";
import { useOrders } from "@/features/orders/useOrders";

const OrdersPage = ({ businessId }: { businessId: string }) => {
  const [statusFilter, setStatusFilter] = useState<"ongoing" | "all">("ongoing");

  const {
    orders,
    fetchingOrders,
    acceptOrder,
    isAcceptingOrder,
  } = useOrders(businessId, statusFilter);

  return (
    <div>
      {fetchingOrders && <Spinner />}
      {orders.map((order) => (
        <div key={order.id}>
          <span>{order.type}</span>
          <button
            onClick={() => acceptOrder(order.id)}
            disabled={isAcceptingOrder}
          >
            Accept
          </button>
        </div>
      ))}
    </div>
  );
};
```

### Rules

- Pages own local UI state (`useState` for modals, filters, selected items).
- Pages call hooks and pass data/callbacks down as props.
- Components in `components/` are dumb — receive props, render JSX, no hooks for data fetching.

---

## Quick Reference

| Concern | File | Pattern |
|---|---|---|
| HTTP client | `lib/api.ts` | Single Axios instance, interceptors only |
| API functions | `features/[f]/service.ts` | One function per endpoint, returns raw Axios promise |
| Types & DTOs | `features/[f]/service.ts` or `types.ts` | Co-located interfaces |
| Read data | `features/[f]/useXxx.ts` → `useQuery` | `queryKey: [resource, scopeId, ...filters]` |
| Write data | `features/[f]/useXxx.ts` → `useMutation` | `onSuccess`: toast + invalidate; `onError`: toast |
| UI & local state | `pages/` or `views/` | Calls hooks, owns `useState` |
| Display only | `components/[f]/` | Props in, JSX out |
