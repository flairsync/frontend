import flairapi from "@/lib/flairapi";
import { unwrap, unwrapPaginated } from "../shared/api-response";

const publicBase = `${'https://api.flairsync.com/api/v1'}/marketplace`;
const mgmtBase = (businessId: string) =>
    `${'https://api.flairsync.com/api/v1'}/businesses/${businessId}/marketplace`;

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface UpdateMarketplaceItemDto {
    name?: string;
    description?: string;
    price?: number;
    currency?: string;
    isActive?: boolean;
    stock?: number;
    discountType?: 'PERCENTAGE' | 'FIXED' | null;
    discountValue?: number | null;
    discountExpiresAt?: string | null;
}

export interface CreateMarketplaceOrderDto {
    itemId: string;
    quantity: number;
    shippingFullName: string;
    shippingAddress: string;
    shippingCityStateZip: string;
    shippingPhone: string;
    customizationInstructions?: string;
}

export interface UpdateMarketplaceOrderStatusDto {
    status: 'CONFIRMED' | 'FULFILLED' | 'CANCELLED';
    resolutionNote?: string;
}

// ─── Public / customer endpoints ─────────────────────────────────────────────

export const getBusinessShopItemsApiCall = async (
    businessId: string,
    params?: { search?: string; page?: number; limit?: number }
) =>
    unwrapPaginated(await flairapi.get(`${publicBase}/items/business/${businessId}`, { params }));

export const getPlatformItemsApiCall = async (
    type: 'PLATFORM_SAAS' | 'PLATFORM_B2B',
    params?: { page?: number; limit?: number }
) =>
    unwrapPaginated(await flairapi.get(`${publicBase}/items/platform`, { params: { ...params, type } }));

export const getItemDetailsApiCall = async (id: string) =>
    unwrap(await flairapi.get(`${publicBase}/items/${id}`));

// ─── Orders — buyer (this business placing/managing orders) ─────────────────

export const createOrderApiCall = (businessId: string, dto: CreateMarketplaceOrderDto) =>
    flairapi.post(`${mgmtBase(businessId)}/orders`, dto);

export const getMyOrdersApiCall = async (businessId: string, params?: { status?: string; page?: number; limit?: number }) =>
    unwrapPaginated(await flairapi.get(`${mgmtBase(businessId)}/orders`, { params }));

export const cancelOrderApiCall = (businessId: string, id: string) =>
    flairapi.delete(`${mgmtBase(businessId)}/orders/${id}`);

// ─── Orders — seller (orders placed on this business's own items) ───────────

export const getIncomingOrdersApiCall = async (businessId: string, params?: { status?: string; page?: number; limit?: number }) =>
    unwrapPaginated(await flairapi.get(`${mgmtBase(businessId)}/sales`, { params }));

export const resolveIncomingOrderApiCall = (
    businessId: string,
    id: string,
    dto: UpdateMarketplaceOrderStatusDto
) =>
    flairapi.patch(`${mgmtBase(businessId)}/sales/${id}/status`, dto);

// ─── Business dashboard / management endpoints ───────────────────────────────

export const getMgmtItemsApiCall = async (businessId: string) =>
    unwrap(await flairapi.get(`${mgmtBase(businessId)}/items`));

export const createMgmtItemApiCall = (businessId: string, formData: FormData) => {
    return flairapi.post(`${mgmtBase(businessId)}/items`, formData);
};

export const updateMgmtItemApiCall = (
    businessId: string,
    id: string,
    data: UpdateMarketplaceItemDto
) => {
    return flairapi.patch(`${mgmtBase(businessId)}/items/${id}`, data);
};

export const updateMgmtItemStockApiCall = (
    businessId: string,
    id: string,
    stock: number
) => {
    return flairapi.patch(`${mgmtBase(businessId)}/items/${id}/stock`, { stock });
};

export const uploadMgmtItemImagesApiCall = (
    businessId: string,
    id: string,
    formData: FormData
) => {
    return flairapi.post(`${mgmtBase(businessId)}/items/${id}/images`, formData);
};

export const removeMgmtItemImageApiCall = (
    businessId: string,
    id: string,
    imageUrl: string
) => {
    return flairapi.delete(`${mgmtBase(businessId)}/items/${id}/images`, {
        data: { imageUrl },
    });
};

export const deleteMgmtItemApiCall = (businessId: string, id: string) => {
    return flairapi.delete(`${mgmtBase(businessId)}/items/${id}`);
};
