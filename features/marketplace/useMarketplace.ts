import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getBusinessShopItemsApiCall,
    getPlatformItemsApiCall,
    getItemDetailsApiCall,
    getMgmtItemsApiCall,
    createMgmtItemApiCall,
    updateMgmtItemApiCall,
    updateMgmtItemStockApiCall,
    uploadMgmtItemImagesApiCall,
    removeMgmtItemImageApiCall,
    deleteMgmtItemApiCall,
    createOrderApiCall,
    getMyOrdersApiCall,
    cancelOrderApiCall,
    getIncomingOrdersApiCall,
    resolveIncomingOrderApiCall,
    UpdateMarketplaceItemDto,
    CreateMarketplaceOrderDto,
    UpdateMarketplaceOrderStatusDto,
} from "./service";
import { MarketplaceItem } from "@/models/MarketplaceItem";
import { toast } from "sonner";

// ─── Public / customer hooks ──────────────────────────────────────────────────

export const useBusinessMarketplaceItems = (
    businessId?: string,
    params?: { search?: string; page?: number; limit?: number }
) => {
    return useQuery({
        queryKey: ["marketplace_items", "business", businessId, params],
        queryFn: async () => {
            if (!businessId) return { data: [], current: 1, pages: 1 };
            const res = await getBusinessShopItemsApiCall(businessId, params);
            return {
                data: (res.data || []).map((item: any) => MarketplaceItem.parseApiResponse(item)),
                current: res.current || 1,
                pages: res.pages || 1,
            };
        },
        enabled: !!businessId,
    });
};

export const usePlatformMarketplaceItems = (
    type: 'PLATFORM_SAAS' | 'PLATFORM_B2B',
    params?: { page?: number; limit?: number }
) => {
    return useQuery({
        queryKey: ["marketplace_items", "platform", type, params],
        queryFn: async () => {
            const res = await getPlatformItemsApiCall(type, params);
            return {
                data: (res.data || []).map((item: any) => MarketplaceItem.parseApiResponse(item)),
                current: res.current || 1,
                pages: res.pages || 1,
            };
        },
    });
};

export const useMarketplaceItemDetails = (id?: string) => {
    return useQuery({
        queryKey: ["marketplace_item", id],
        queryFn: async () => {
            if (!id) return null;
            const data = await getItemDetailsApiCall(id);
            return data ? MarketplaceItem.parseApiResponse(data) : null;
        },
        enabled: !!id,
    });
};

// ─── Management hooks ─────────────────────────────────────────────────────────

export const useBusinessManagementItems = (businessId?: string) => {
    return useQuery({
        queryKey: ["marketplace_mgmt_items", businessId],
        queryFn: async (): Promise<MarketplaceItem[]> => {
            if (!businessId) return [];
            const data = await getMgmtItemsApiCall(businessId);
            return Array.isArray(data) ? data.map((item: any) => MarketplaceItem.parseApiResponse(item)) : [];
        },
        enabled: !!businessId,
    });
};

export const useMarketplaceMutations = (businessId: string) => {
    const queryClient = useQueryClient();

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["marketplace_mgmt_items", businessId] });
        queryClient.invalidateQueries({ queryKey: ["marketplace_items", "business", businessId] });
    };

    const createItem = useMutation({
        mutationFn: (formData: FormData) => {
            toast.loading("Creating item...", { id: "mp-create" });
            return createMgmtItemApiCall(businessId, formData);
        },
        onSuccess: () => {
            toast.success("Item created", { id: "mp-create" });
            invalidate();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to create item", { id: "mp-create" });
        },
    });

    const updateItem = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateMarketplaceItemDto }) => {
            toast.loading("Updating item...", { id: "mp-update" });
            return updateMgmtItemApiCall(businessId, id, data);
        },
        onSuccess: () => {
            toast.success("Item updated", { id: "mp-update" });
            invalidate();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update item", { id: "mp-update" });
        },
    });

    const updateStock = useMutation({
        mutationFn: ({ id, stock }: { id: string; stock: number }) =>
            updateMgmtItemStockApiCall(businessId, id, stock),
        onSuccess: () => {
            invalidate();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update stock");
        },
    });

    const uploadImages = useMutation({
        mutationFn: ({ id, formData }: { id: string; formData: FormData }) => {
            toast.loading("Uploading images...", { id: "mp-images" });
            return uploadMgmtItemImagesApiCall(businessId, id, formData);
        },
        onSuccess: () => {
            toast.success("Images uploaded", { id: "mp-images" });
            invalidate();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to upload images", { id: "mp-images" });
        },
    });

    const removeImage = useMutation({
        mutationFn: ({ id, imageUrl }: { id: string; imageUrl: string }) =>
            removeMgmtItemImageApiCall(businessId, id, imageUrl),
        onSuccess: () => {
            invalidate();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to remove image");
        },
    });

    const deleteItem = useMutation({
        mutationFn: (id: string) => {
            toast.loading("Deleting item...", { id: "mp-delete" });
            return deleteMgmtItemApiCall(businessId, id);
        },
        onSuccess: () => {
            toast.success("Item deleted", { id: "mp-delete" });
            invalidate();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to delete item", { id: "mp-delete" });
        },
    });

    return { createItem, updateItem, updateStock, uploadImages, removeImage, deleteItem };
};

// ─── Orders — buyer (this business placing/managing orders) ─────────────────

export const useCreateMarketplaceOrder = (businessId: string) => {
    return useMutation({
        mutationFn: (dto: CreateMarketplaceOrderDto) => createOrderApiCall(businessId, dto),
        onSuccess: () => {
            toast.success("Order placed successfully");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to place order");
        },
    });
};

export const useMyMarketplaceOrders = (businessId?: string, params?: { status?: string; page?: number; limit?: number }) => {
    return useQuery({
        queryKey: ["marketplace_orders", "mine", businessId, params],
        queryFn: async () => {
            if (!businessId) return { data: [], current: 1, pages: 1 };
            return getMyOrdersApiCall(businessId, params);
        },
        enabled: !!businessId,
    });
};

export const useCancelMarketplaceOrder = (businessId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => cancelOrderApiCall(businessId, id),
        onSuccess: () => {
            toast.success("Order cancelled");
            queryClient.invalidateQueries({ queryKey: ["marketplace_orders", "mine", businessId] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to cancel order");
        },
    });
};

// ─── Orders — seller (orders placed on this business's own items) ───────────

export const useIncomingMarketplaceOrders = (businessId?: string, params?: { status?: string; page?: number; limit?: number }) => {
    return useQuery({
        queryKey: ["marketplace_orders", "incoming", businessId, params],
        queryFn: async () => {
            if (!businessId) return { data: [], current: 1, pages: 1 };
            return getIncomingOrdersApiCall(businessId, params);
        },
        enabled: !!businessId,
    });
};

export const useResolveIncomingMarketplaceOrder = (businessId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateMarketplaceOrderStatusDto }) =>
            resolveIncomingOrderApiCall(businessId, id, dto),
        onSuccess: () => {
            toast.success("Order updated");
            queryClient.invalidateQueries({ queryKey: ["marketplace_orders", "incoming", businessId] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update order");
        },
    });
};
