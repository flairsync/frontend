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
}

// ─── Public / customer endpoints ─────────────────────────────────────────────

export const getBusinessShopItemsApiCall = async (
    businessId: string,
    params?: { search?: string; page?: number; limit?: number }
) =>
    unwrapPaginated(await flairapi.get(`${publicBase}/items/business/${businessId}`, { params }));

export const getItemDetailsApiCall = async (id: string) =>
    unwrap(await flairapi.get(`${publicBase}/items/${id}`));

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
