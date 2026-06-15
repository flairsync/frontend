# Marketplace — Frontend Implementation Guide

## Overview

The marketplace lets a **business** sell physical items (merch, mugs, t-shirts, special products, etc.) directly to customers.  
There are two contexts:

| Context | Who manages | What they see |
|---|---|---|
| **Customer / public** | Read-only | Active items with images, price, stock, description |
| **Business dashboard** | Owner / staff | Full management: create, edit, toggle active, manage images, set stock |

All responses follow the shared `ApiResponse` envelope:

```ts
interface ApiResponse<T> {
  code: string;       // HTTP status as string, e.g. "200"
  success: boolean;
  message: string;
  data: T;
}

// Paginated variant wraps data differently:
interface PaginatedData<T> {
  data: T[];
  current: number;   // current page
  pages: number;     // total pages
}
```

---

## Data Types

```ts
interface MarketplaceItem {
  id: string;                  // UUID
  businessId: string | null;   // null = Flairsync platform item
  name: string;
  description: string | null;
  price: number;               // decimal, e.g. 24.99
  currency: string;            // default "USD"
  images: string[];            // array of CDN URLs (WebP, max 5)
  isActive: boolean;
  stock: number;               // non-negative integer
  createdAt: string;           // ISO date
  updatedAt: string;           // ISO date
}
```

---

## Public / Customer Endpoints

### List active items for a business

```
GET /api/v1/marketplace/items/business/:businessId
```

Query params (all optional):

| Param | Type | Default | Description |
|---|---|---|---|
| `search` | string | — | Filter by name (case-insensitive) |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |

Response: `ApiResponse<PaginatedData<MarketplaceItem>>`

Only **active** items (`isActive: true`) are returned here.

---

### Get single item detail

```
GET /api/v1/marketplace/items/:id
```

Response: `ApiResponse<MarketplaceItem>`

---

## Business Dashboard Endpoints

> **Auth**: All routes below require the user to be authenticated (JWT cookie) and belong to the business (owner or staff).  
> Base path: `/api/v1/businesses/:businessId/marketplace`

---

### List all items (management view)

```
GET /api/v1/businesses/:businessId/marketplace/items
```

Returns **all** items including inactive ones (for management purposes).  
Response: `ApiResponse<MarketplaceItem[]>`

---

### Create a new item

```
POST /api/v1/businesses/:businessId/marketplace/items
Content-Type: multipart/form-data
```

Form fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✅ | Item name |
| `description` | string | — | Text description |
| `price` | number | ✅ | Min 0 |
| `currency` | string | — | Defaults to "USD" |
| `stock` | number (int) | — | Defaults to 0 |
| `isActive` | boolean | — | Defaults to true. Send as string "true"/"false" in multipart. |
| `images` | File[] | — | Up to 5 images. JPEG/PNG/WebP accepted. Automatically compressed to WebP 80% quality, max 1600px wide. |

Response: `ApiResponse<MarketplaceItem>` with status code `"201"`

**Note**: Images can be included at creation time or added later via the images endpoint. The 5-image limit is enforced across both.

---

### Upload images to an existing item

```
POST /api/v1/businesses/:businessId/marketplace/items/:id/images
Content-Type: multipart/form-data
```

Form fields:

| Field | Type | Notes |
|---|---|---|
| `images` | File[] | Current count + new files must not exceed 5. Server returns 400 if exceeded. |

Response: `ApiResponse<MarketplaceItem>` (updated item with new image URLs)

---

### Remove a single image

```
DELETE /api/v1/businesses/:businessId/marketplace/items/:id/images
Content-Type: application/json
```

Body:
```json
{ "imageUrl": "https://cdn.example.com/marketplace/business/..." }
```

Response: `ApiResponse<MarketplaceItem>` (updated item without the removed image)

Use this when the user clicks ✕ on an image in the item edit form.

---

### Update item details

```
PATCH /api/v1/businesses/:businessId/marketplace/items/:id
Content-Type: application/json
```

Body (all fields optional):
```json
{
  "name": "FlairSync Mug",
  "description": "Ceramic mug, 11oz",
  "price": 14.99,
  "currency": "USD",
  "isActive": true,
  "stock": 50
}
```

Response: `ApiResponse<MarketplaceItem>`

---

### Update stock only

```
PATCH /api/v1/businesses/:businessId/marketplace/items/:id/stock
Content-Type: application/json
```

Body:
```json
{ "stock": 42 }
```

`stock` must be an integer ≥ 0.

Response: `ApiResponse<MarketplaceItem>`

Use this for an inline stock editor (number input in the items table) without triggering a full item update.

---

### Delete an item

```
DELETE /api/v1/businesses/:businessId/marketplace/items/:id
```

Response: `ApiResponse<null>`

---

## UI Implementation Notes

### Customer-facing storefront

- Show a **grid of cards**: first image, name, price formatted with currency, stock badge ("In stock" / "Out of stock").
- Implement **search** (`?search=`) as a debounced text input (300ms).
- **Pagination**: use `current` and `pages` from the paginated response.
- On **item detail**: image gallery (swipeable, up to 5), full description, price, stock count, and a "Buy" / "Contact" CTA (transaction flow TBD).
- Items where `stock === 0`: show a disabled "Out of stock" badge — do not hide them.

### Business dashboard — item management

- Table or card list fetched from the management endpoint (includes inactive items).
- Each row: thumbnail, name, price, stock (editable inline via stock endpoint), active toggle, edit/delete actions.
- **Inline stock edit**: clicking the stock number opens a small number input. On blur or Enter, call `PATCH .../stock`. This avoids opening the full edit drawer just to adjust stock.
- **Active toggle**: `PATCH .../items/:id` with `{ "isActive": boolean }`.
- **Create / Edit form (drawer or modal)**:
  - Fields: Name (required), Description, Price (required, min 0), Currency, Stock (integer ≥ 0), Active toggle.
  - **Image section**: drag-and-drop or file picker showing current image thumbnails, each with an ✕ button that calls `DELETE .../images`. Show upload progress. Cap enforced: disable the file input once 5 images are loaded. Accepts JPEG, PNG, WebP.
  - **On create**: send everything as `multipart/form-data` (fields + images in one request).
  - **On edit**: send a JSON `PATCH` for field changes; use separate calls for adding/removing images.

### Image handling details

All uploaded images go through the backend pipeline:
- Validated as image files
- Resized to max 1600px wide (never upscaled)
- Converted to **WebP at 80% quality**
- Stored on CDN with permanent cache headers

The returned URLs are final CDN URLs. Show a loading spinner over the image area during upload; display the CDN URL immediately on success.

### Error handling

| Status | Meaning |
|---|---|
| 400 | Validation error (missing fields, wrong types, or exceeding 5-image cap) |
| 403 | Not the business owner or authorized staff |
| 404 | Item not found |

---

## Code Examples

### Create an item with images (multipart)

```ts
const formData = new FormData();
formData.append('name', 'FlairSync Mug');
formData.append('description', 'Ceramic mug with logo');
formData.append('price', '14.99');
formData.append('stock', '100');
formData.append('isActive', 'true');
files.forEach((file) => formData.append('images', file));

const res = await fetch(`/api/v1/businesses/${businessId}/marketplace/items`, {
  method: 'POST',
  credentials: 'include',  // sends JWT cookie
  body: formData,
});
const json = await res.json(); // ApiResponse<MarketplaceItem>
```

### Inline stock update

```ts
const res = await fetch(
  `/api/v1/businesses/${businessId}/marketplace/items/${itemId}/stock`,
  {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stock: newStockValue }),
  }
);
```

### Remove one image

```ts
const res = await fetch(
  `/api/v1/businesses/${businessId}/marketplace/items/${itemId}/images`,
  {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl: urlToRemove }),
  }
);
```
