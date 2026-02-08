# API Integration & Hooks Guide

This guide outlines the patterns and best practices for creating API integrations and hooks in the **FlairSync Frontend**.

## 1. Directory Structure
API integrations are organized by feature in the `features/` directory.
```text
features/
└── [featureName]/
    ├── service.ts       # API call definitions and DTOs
    ├── use[Feature].ts  # TanStack Query hooks
    └── types/           # (Optional) Complex types specific to the feature
```

---

## 2. The Service Layer (`service.ts`)
The service layer handles the raw HTTP requests using the `flairapi` instance.

### Key Rules:
- **Naming**: Export functions with the suffix `ApiCall` (e.g., `fetchBusinessMenusApiCall`).
- **Instance**: Always use `import flairapi from "@/lib/flairapi"`.
- **DTOs**: Define types for request payloads (`CreateXDto`, `UpdateXDto`) in this file if they aren't globally defined in `@/models`.
- **FormData**: For file uploads, manually construct `FormData` and set the `Content-Type` header to `multipart/form-data`.

### Example:
```typescript
import flairapi from "@/lib/flairapi";

export type CreateItemDto = {
  name: string;
  files: File[];
};

export const createItemApiCall = (businessId: string, data: CreateItemDto) => {
  const payload = new FormData();
  payload.append("name", data.name);
  data.files.forEach((file) => payload.append("files", file));

  return flairapi.post(`/business/${businessId}/items`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
```

---

## 3. The Hook Layer (`use[Feature].ts`)
Hooks use `@tanstack/react-query` to manage server state.

### Key Rules:
- **Naming**: File starts with `use` (e.g., `useBusinessMenus.ts`).
- **Queries**: Use `useQuery` for fetching. Provide a descriptive `queryKey`.
- **Mutations**: Use `useMutation` for POST/PATCH/DELETE.
- **Cache Invalidation**: On success, use `queryClient.invalidateQueries` or call a `refetch` function returned by `useQuery`.
- **Toasts**: Use `sonner` for user feedback.

### Example:
```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchItemApiCall, createItemApiCall } from "./service";
import { toast } from "sonner";

export const useItems = (businessId: string) => {
  const queryClient = useQueryClient();

  const { data: items, refetch } = useQuery({
    queryKey: ["items", businessId],
    queryFn: async () => {
      const resp = await fetchItemApiCall(businessId);
      return resp.data.data; // Ideally, parse with a model here
    },
    enabled: !!businessId,
  });

  const { mutate: createItem } = useMutation({
    mutationFn: (data: any) => createItemApiCall(businessId, data),
    onSuccess: () => {
      toast.success("Item created!");
      refetch(); // or queryClient.invalidateQueries({ queryKey: ["items", businessId] })
    },
  });

  return { items, createItem };
};
```

---

## 4. Modeling & Parsing
We often use model classes with static `parseApiResponse` methods to ensure type safety and data integrity.

### Pattern:
```typescript
import { MyModel } from "@/models/MyModel";

// Inside useQuery:
const res = await fetchApiCall();
return MyModel.parseApiResponse(res.data.data);
```

---

## 5. Persistence & UI Feedback (Toasts)
For long-running operations, use the `toast.loading` pattern with IDs to update the same toast.

```typescript
const { mutate } = useMutation({
  mutationFn: async (data) => {
    toast.loading("Action in progress...", { id: "my-action" });
    return apiCall(data);
  },
  onSuccess: () => {
    toast.success("Done!", { id: "my-action" });
  },
  onError: () => {
    toast.error("Failed!", { id: "my-action" });
  }
});
```

---

## 6. Personal Notes for AI
- Check `flairapi.ts` in `lib/` for the base configuration (auth headers, intercepts).
- When creating NEW features, check if a sub-module structure is needed (e.g., `features/business/menu/`).
- Always check for existing models in `@/models` before creating new DTO types.
- Many hooks return both the data and the mutation functions for easy use in components.
