import flairapi from "@/lib/flairapi";
import { unwrap, unwrapPaginated } from "../shared/api-response";

const baseBusinessUrl = `${import.meta.env.VITE_API_BASE_URL}/businesses`;

const getInventoryUrl = (businessId: string) => {
    return `${baseBusinessUrl}/${businessId}/inventory`;
};

// DTOs & Types
export interface CreateInventoryGroupDto {
    name: string;
}

export interface CreateInventoryItemDto {
    name: string;
    description?: string;
    unitId?: number;
    quantity?: number;
    lowStockThreshold?: number;
    barcode?: string;
    groupId?: string;
}

export interface UpdateInventoryItemDto {
    name?: string;
    description?: string;
    unitId?: number;
    lowStockThreshold?: number;
    barcode?: string;
    groupId?: string;
}

export type AdjustStockType = "add" | "subtract" | "set" | "waste";

export interface AdjustStockDto {
    type: AdjustStockType;
    amount: number;
    notes?: string;
}

export interface InventoryFilters {
    page?: number;
    limit?: number;
    groupId?: string;
    lowStock?: boolean;
    search?: string;
    barcode?: string;
    unitId?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface TopConsumedFilters {
    limit?: number;
    startDate?: string;
    endDate?: string;
}

export interface TimelineFilters {
    page?: number;
    limit?: number;
    itemId?: string;
    type?: string;
    sourceType?: string;
    startDate?: string;
    endDate?: string;
}

export interface RecipeIngredientDto {
    inventoryItemId: string;
    quantityRequired: number;
    unit?: string;
}

export interface SetRecipeDto {
    ingredients: RecipeIngredientDto[];
}

// API Calls - Units
export const fetchInventoryUnitsApiCall = async (system?: string) =>
    unwrap(await flairapi.get(`${import.meta.env.VITE_API_BASE_URL}/inventory/units`, { params: { system } }));

// API Calls - Groups
export const fetchInventoryGroupsApiCall = async (businessId: string) =>
    unwrap(await flairapi.get(`${getInventoryUrl(businessId)}/groups`));

export const createInventoryGroupApiCall = (businessId: string, data: CreateInventoryGroupDto) => {
    return flairapi.post(`${getInventoryUrl(businessId)}/groups`, data);
};

export const updateInventoryGroupApiCall = (businessId: string, groupId: string, data: CreateInventoryGroupDto) => {
    return flairapi.patch(`${getInventoryUrl(businessId)}/groups/${groupId}`, data);
};

export const deleteInventoryGroupApiCall = (businessId: string, groupId: string) => {
    return flairapi.delete(`${getInventoryUrl(businessId)}/groups/${groupId}`);
};

// API Calls - Items
export const fetchInventoryItemsApiCall = async (businessId: string, params?: InventoryFilters) =>
    unwrapPaginated(await flairapi.get(`${getInventoryUrl(businessId)}/items`, { params }));

export const fetchInventoryAutocompleteApiCall = async (businessId: string, query: string) =>
    unwrap(await flairapi.get(`${getInventoryUrl(businessId)}/autocomplete`, { params: { q: query } }));

export const fetchInventoryLowStockApiCall = async (businessId: string) =>
    unwrap(await flairapi.get(`${getInventoryUrl(businessId)}/items/low-stock`));

export const fetchInventoryItemApiCall = async (businessId: string, itemId: string) =>
    unwrap(await flairapi.get(`${getInventoryUrl(businessId)}/items/${itemId}`));

export const createInventoryItemApiCall = (businessId: string, data: CreateInventoryItemDto) => {
    return flairapi.post(`${getInventoryUrl(businessId)}/items`, data);
};

export const updateInventoryItemApiCall = (businessId: string, itemId: string, data: UpdateInventoryItemDto) => {
    return flairapi.patch(`${getInventoryUrl(businessId)}/items/${itemId}`, data);
};

export const deleteInventoryItemApiCall = (businessId: string, itemId: string) => {
    return flairapi.delete(`${getInventoryUrl(businessId)}/items/${itemId}`);
};

export const adjustInventoryStockApiCall = (businessId: string, itemId: string, data: AdjustStockDto) => {
    return flairapi.post(`${getInventoryUrl(businessId)}/items/${itemId}/adjust`, data);
};

// API Calls - Dashboard & Analytics
export const fetchInventoryDashboardApiCall = async (businessId: string) =>
    unwrap(await flairapi.get(`${getInventoryUrl(businessId)}/dashboard`));

export const fetchInventoryTopConsumedApiCall = async (businessId: string, params?: TopConsumedFilters) =>
    unwrap(await flairapi.get(`${getInventoryUrl(businessId)}/top-consumed`, { params }));

// API Calls - Movement History
export const fetchInventoryMovementsApiCall = async (businessId: string, itemId: string, params?: { page?: number; limit?: number }) =>
    unwrapPaginated(await flairapi.get(`${getInventoryUrl(businessId)}/items/${itemId}/movements`, { params }));

export const fetchInventoryTimelineApiCall = async (businessId: string, params?: TimelineFilters) =>
    unwrapPaginated(await flairapi.get(`${getInventoryUrl(businessId)}/timeline`, { params }));

// API Calls - Recipes
export const setMenuItemRecipeApiCall = (businessId: string, menuItemId: string, data: SetRecipeDto) =>
    flairapi.post(`${baseBusinessUrl}/${businessId}/menu/items/${menuItemId}/recipes`, data);

export const getMenuItemRecipeApiCall = async (businessId: string, menuItemId: string) =>
    unwrap(await flairapi.get(`${baseBusinessUrl}/${businessId}/menu/items/${menuItemId}/recipes`));

export const deleteRecipeIngredientApiCall = (businessId: string, recipeId: string) => {
    return flairapi.delete(`${getInventoryUrl(businessId)}/recipes/${recipeId}`);
};
