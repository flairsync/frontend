import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getPlatformItemsApiCall,
    getBusinessShopItemsApiCall,
    getItemDetailsApiCall,
    createItemApiCall,
    updateItemApiCall,
    deleteItemApiCall,
    CreateMarketplaceItemDto,
    UpdateMarketplaceItemDto
} from "./service";
import { MarketplaceItem } from "@/models/MarketplaceItem";
import { toast } from "sonner";

export const usePlatformMarketplaceItems = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: ["marketplace_items", "platform", page, limit],
        queryFn: async () => {
            const res = await getPlatformItemsApiCall(page, limit);
            const apiResp = res.data;
            if (apiResp?.success && apiResp?.data) {
                return {
                    data: (apiResp.data.data || []).map((item: any) => MarketplaceItem.parseApiResponse(item)),
                    current: apiResp.data.current || 1,
                    pages: apiResp.data.pages || 1
                };
            }
            return { data: [], current: 1, pages: 1 };
        }
    });
};

export const useBusinessMarketplaceItems = (businessId?: string) => {
    return useQuery({
        queryKey: ["marketplace_items", "business", businessId],
        queryFn: async () => {
            if (!businessId) return [];
            const res = await getBusinessShopItemsApiCall(businessId);
            const apiResp = res.data;
            if (apiResp?.success && Array.isArray(apiResp.data)) {
                return apiResp.data.map((item: any) => MarketplaceItem.parseApiResponse(item));
            }
            return [];
        },
        enabled: !!businessId
    });
};

export const useMarketplaceItemDetails = (id?: string) => {
    return useQuery({
        queryKey: ["marketplace_item", id],
        queryFn: async () => {
            if (!id) return null;
            const res = await getItemDetailsApiCall(id);
            const apiResp = res.data;
            if (apiResp?.success && apiResp?.data) {
                return MarketplaceItem.parseApiResponse(apiResp.data);
            }
            return null;
        },
        enabled: !!id
    });
};

export const useMarketplaceMutations = () => {
    const queryClient = useQueryClient();

    const invalidateMarketplaceQueries = () => {
        queryClient.invalidateQueries({ queryKey: ["marketplace_items"] });
        queryClient.invalidateQueries({ queryKey: ["marketplace_item"] });
    };

    const createItem = useMutation({
        mutationFn: async (data: CreateMarketplaceItemDto) => {
            toast.loading("Creating item...", { id: "create-item" });
            return await createItemApiCall(data);
        },
        onSuccess: () => {
            toast.success("Item created successfully", { id: "create-item" });
            invalidateMarketplaceQueries();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to create item", { id: "create-item" });
        }
    });

    const updateItem = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: UpdateMarketplaceItemDto }) => {
            toast.loading("Updating item...", { id: "update-item" });
            return await updateItemApiCall(id, data);
        },
        onSuccess: () => {
            toast.success("Item updated successfully", { id: "update-item" });
            invalidateMarketplaceQueries();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update item", { id: "update-item" });
        }
    });

    const deleteItem = useMutation({
        mutationFn: async (id: string) => {
            toast.loading("Deleting item...", { id: "delete-item" });
            return await deleteItemApiCall(id);
        },
        onSuccess: () => {
            toast.success("Item deleted successfully", { id: "delete-item" });
            invalidateMarketplaceQueries();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to delete item", { id: "delete-item" });
        }
    });

    return { createItem, updateItem, deleteItem };
};
