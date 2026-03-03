import flairapi from "@/lib/flairapi";
import { MarketplaceItem } from "@/models/MarketplaceItem";

const marketplaceUrl = `${import.meta.env.BASE_URL}/marketplace`;

export interface CreateMarketplaceItemDto {
    name: string;
    description?: string;
    price: number;
    currency?: string;
    images?: string[];
    isActive?: boolean;
    businessId?: string;
}

export interface UpdateMarketplaceItemDto extends Partial<CreateMarketplaceItemDto> { }

export const getPlatformItemsApiCall = (page: number = 1, limit: number = 10) => {
    return flairapi.get(`${marketplaceUrl}/items/platform`, {
        params: { page, limit }
    });
};

export const getBusinessShopItemsApiCall = (businessId: string) => {
    return flairapi.get(`${marketplaceUrl}/items/business/${businessId}`);
};

export const getItemDetailsApiCall = (id: string) => {
    return flairapi.get(`${marketplaceUrl}/items/${id}`);
};

export const createItemApiCall = (data: CreateMarketplaceItemDto) => {
    return flairapi.post(`${marketplaceUrl}/items`, data);
};

export const updateItemApiCall = (id: string, data: UpdateMarketplaceItemDto) => {
    return flairapi.patch(`${marketplaceUrl}/items/${id}`, data);
};

export const deleteItemApiCall = (id: string) => {
    return flairapi.delete(`${marketplaceUrl}/items/${id}`);
};
