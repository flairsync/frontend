# Marketplace Integration: Frontend Instructions

This document provides instructions for integrating the Flairsync Marketplace into the frontend application. 
The marketplace allows both the platform to sell proprietary hardware/items and businesses to sell their own retail items.

## Overview

The new module is located under `/marketplace`.
- **Proprietary (Platform) Items**: `businessId` is `null`.
- **Business/Shop Items**: `businessId` is the UUID of the specific business.

All endpoints currently start with the global prefix: `/api/v1` (or whatever the global prefix is set to, assuming `/api/v1`).

---

## 1. DTOs / Interfaces

### `MarketplaceItem`
```typescript
interface MarketplaceItem {
  id: string; // UUID
  businessId: string | null; // Null if it's a Flairsync proprietary item
  name: string;
  description: string;
  price: number;
  currency: string; // Example: 'USD'
  images: string[]; // Array of strings (URLs)
  isActive: boolean;
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
}
```

### `CreateMarketplaceItemDto`
```typescript
interface CreateMarketplaceItemDto {
  name: string;
  description?: string;
  price: number;
  currency?: string; // Optional, defaults to USD in DB
  images?: string[]; 
  isActive?: boolean; // Optional, defaults to true
  businessId?: string; // Send this if creating a retail item for a specific shop
}
```

### `UpdateMarketplaceItemDto`
```typescript
// All fields from CreateMarketplaceItemDto are optional here
interface UpdateMarketplaceItemDto extends Partial<CreateMarketplaceItemDto> {}
```

---

## 2. API Endpoints

### Get Platform Items (Flairsync Shop)
Retrieves items sold directly by the platform (e.g., Tablets, NFC cards). This endpoint is **paginated**.
- **Method**: `GET`
- **URL**: `/marketplace/items/platform`
- **Query Parameters**:
  - `page`: number (default: 1)
  - `limit`: number (default: 10)
- **Auth**: None (or standard user auth depending on visibility)
- **Response**: `ApiResponse` (Paginated)
```json
{
  "code": "200",
  "success": true,
  "message": "Platform items retrieved successfully",
  "data": {
    "data": [ /* Array of MarketplaceItem */ ],
    "current": 1,
    "pages": 5
  }
}
```

### Get Business Shop Items (Restaurant Retail)
Retrieves retail items sold by a specific restaurant or coffee shop (e.g., Coffee Beans).
- **Method**: `GET`
- **URL**: `/marketplace/items/business/:businessId`
- **Auth**: None (or standard user auth depending on visibility)
- **Path Parameter**: `businessId` (UUID)
- **Response**: `ApiResponse`
```json
{
  "code": "200",
  "success": true,
  "message": "Business items retrieved successfully",
  "data": [ /* Array of MarketplaceItem */ ]
}
```

### Get Single Item Details
Retrieves details for a specific item by ID.
- **Method**: `GET`
- **URL**: `/marketplace/items/:id`
- **Path Parameter**: `id` (UUID of the item)
- **Response**: `ApiResponse` with `data` as `MarketplaceItem`

### Create a Business Shop Item
Creates a new marketplace item for a specific shop.
- **Method**: `POST`
- **URL**: `/marketplace/items`
- **Auth**: Yes (Requires JWT token - `JwtAuthGuardVerified`)
- **Content-Type**: `multipart/form-data`
- **Body (`FormData`)**:
  - `businessId`: string (UUID)
  - `name`: string
  - `description`: string (optional)
  - `price`: number
  - `currency`: string (optional, defaults to USD)
  - `isActive`: boolean (optional)
  - `images`: File list (1 to 5 images, e.g., PNG, JPG, WEBP)
- **Response**: `MarketplaceItem`

### Update a Business Shop Item
Updates an existing business marketplace item.
- **Method**: `PATCH`
- **URL**: `/marketplace/items/:id`
- **Auth**: Yes (Requires JWT token - `JwtAuthGuardVerified`)
- **Path Parameter**: `id` (UUID)
- **Body**: `UpdateMarketplaceItemDto`
- **Response**: `MarketplaceItem`

### Delete a Business Shop Item
Deletes a business marketplace item entirely.
- **Method**: `DELETE`
- **URL**: `/marketplace/items/:id`
- **Auth**: Yes (Requires JWT token - `JwtAuthGuardVerified`)
- **Path Parameter**: `id` (UUID)
- **Response**: `void`

---

## 3. Platform Admin API Endpoints

These endpoints are strictly for internal Flairsync administrators explicitly managing proprietary platform items (where `businessId` is `null`).

### Create a Platform Item
- **Method**: `POST`
- **URL**: `/marketplace/admin/items`
- **Auth**: Yes (Requires `x-admin-key` header with the correct environment secret)
- **Header**: `x-admin-key: <ADMIN_API_KEY>`
- **Content-Type**: `multipart/form-data`
- **Body (`FormData`)**:
  - `name`: string
  - `description`: string (optional)
  - `price`: number (e.g. `15.99`)
  - `currency`: string (optional, e.g. `USD`)
  - `isActive`: boolean (optional)
  - `images`: File list (1 to 5 images, e.g., PNG, JPG, WEBP)
- **Response**: `MarketplaceItem`

### Update a Platform Item
- **Method**: `PATCH`
- **URL**: `/marketplace/admin/items/:id`
- **Auth**: Yes (Requires `x-admin-key` header)
- **Path Parameter**: `id` (UUID)
- **Body**: `UpdateMarketplaceItemDto` (Standard JSON)
- **Response**: `MarketplaceItem`

### Delete a Platform Item
- **Method**: `DELETE`
- **URL**: `/marketplace/admin/items/:id`
- **Auth**: Yes (Requires `x-admin-key` header)
- **Path Parameter**: `id` (UUID)
- **Response**: `void`

---

## 4. Appending Additional Images (After Creation)

If you need to add images *after* an item is already created, you can use these dedicated endpoints.

### Add Images to Business Shop Item
- **Method**: `POST`
- **URL**: `/marketplace/items/:id/images`
- **Auth**: Yes (Requires JWT token - `JwtAuthGuardVerified`)
- **Path Parameter**: `id` (UUID of the marketplace item)
- **Content-Type**: `multipart/form-data`
- **Body (`FormData`)**:
  - `images`: File list (1 to 5 images, e.g., PNG, JPG, WEBP).
- **Response**: Returns the updated `MarketplaceItem` object including the newly appended image URLs.

### Add Images to Platform Item (Admin)
- **Method**: `POST`
- **URL**: `/marketplace/admin/items/:id/images`
- **Auth**: Yes (Requires `x-admin-key` header)
- **Header**: `x-admin-key: <ADMIN_API_KEY>`
- **Path Parameter**: `id` (UUID of the marketplace item)
- **Content-Type**: `multipart/form-data`
- **Body (`FormData`)**:
  - `images`: File list (1 to 5 images, e.g., PNG, JPG, WEBP).
- **Response**: Returns the updated `MarketplaceItem` object including the newly appended image URLs.

---

## 5. Global API Response Wrapper

**ALL** marketplace REST endpoints now return their data wrapped within the standard `ApiResponse` object.
Example standard successful response:
```json
{
  "code": "200",
  "success": true,
  "message": "Action completed successfully",
  "data": { ... } // Or an array
}
```

---

## 6. Important Notes for Frontend Implementation

1. **Creating with Images (`multipart/form-data`)**: When creating an item using the POST methods, be sure to send the request as `multipart/form-data`. The text fields (`name`, `price`, etc.) are sent as text parts, and the `images` are sent as file parts. NestJS will parse the string/number fields automatically alongside the files.
2. **Currency Display**: Use the `currency` field provided in the `MarketplaceItem` to format prices correctly (e.g., USD, EUR).
3. **Business Update**: The `Business` entity has also been updated to include a `currency` field. This means `GET /businesses/:id` or similar calls will now return a `{ currency: string }` property for the business itself, which should be used as the default fallback currency.
4. **No Payment Processing Yet**: The current iteration is purely for content presentation. Do not build checkout logic unless otherwise instructed in the future.
5. **Image Handling**: `images` is a simple array of string URLs in the response. Ensure the UI can display these gracefully (e.g., carousel for multiple images).
