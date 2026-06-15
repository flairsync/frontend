import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchInventoryItemsApiCall,
    fetchInventoryLowStockApiCall,
    fetchInventoryDashboardApiCall,
    fetchInventoryTopConsumedApiCall,
    fetchInventoryMovementsApiCall,
    fetchInventoryTimelineApiCall,
    fetchInventoryAutocompleteApiCall,
    createInventoryItemApiCall,
    updateInventoryItemApiCall,
    deleteInventoryItemApiCall,
    adjustInventoryStockApiCall,
    CreateInventoryItemDto,
    UpdateInventoryItemDto,
    AdjustStockDto,
    InventoryFilters,
    TopConsumedFilters,
    TimelineFilters,
} from "./service";
import { InventoryItem } from "@/models/inventory/InventoryItem";
import { toast } from "sonner";

export const useInventory = (businessId: string, filters: InventoryFilters = {}) => {
    const queryClient = useQueryClient();

    const {
        data: inventoryItems,
        isFetching: fetchingInventoryItems,
        refetch: refreshInventoryItems,
    } = useQuery({
        queryKey: ["inventory_items", businessId, filters],
        queryFn: async () => {
            const paged = await fetchInventoryItemsApiCall(businessId, {
                limit: 20,
                ...filters,
            });
            return {
                items: InventoryItem.parseApiArrayResponse(paged.data),
                pagination: { current: paged.current, pages: paged.pages, total: paged.data.length },
            };
        },
        enabled: !!businessId,
        staleTime: 1000 * 60 * 2,
    });

    const createItemMutation = useMutation({
        mutationFn: (data: CreateInventoryItemDto) => createInventoryItemApiCall(businessId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory_items", businessId] });
            queryClient.invalidateQueries({ queryKey: ["inventory_dashboard", businessId] });
            toast.success("Item created successfully");
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Failed to create item";
            toast.error(msg);
        },
    });

    const updateItemMutation = useMutation({
        mutationFn: ({ itemId, data }: { itemId: string; data: UpdateInventoryItemDto }) =>
            updateInventoryItemApiCall(businessId, itemId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory_items", businessId] });
            toast.success("Item updated successfully");
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Failed to update item";
            toast.error(msg);
        },
    });

    const deleteItemMutation = useMutation({
        mutationFn: (itemId: string) => deleteInventoryItemApiCall(businessId, itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory_items", businessId] });
            queryClient.invalidateQueries({ queryKey: ["inventory_dashboard", businessId] });
            toast.success("Item deleted successfully");
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Failed to delete item";
            toast.error(msg);
        },
    });

    const adjustStockMutation = useMutation({
        mutationFn: ({ itemId, data }: { itemId: string; data: AdjustStockDto }) =>
            adjustInventoryStockApiCall(businessId, itemId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory_items", businessId] });
            queryClient.invalidateQueries({ queryKey: ["inventory_low_stock", businessId] });
            queryClient.invalidateQueries({ queryKey: ["inventory_dashboard", businessId] });
            queryClient.invalidateQueries({ queryKey: ["inventory_movements", businessId] });
            queryClient.invalidateQueries({ queryKey: ["inventory_timeline", businessId] });
            toast.success("Stock adjusted successfully");
        },
        onError: (error: any) => {
            const code = error.response?.data?.code;
            if (code === "inventory.negative_stock") {
                toast.error("This adjustment would result in negative stock. Please check the amount.");
            } else {
                const msg = error.response?.data?.message || "Failed to adjust stock";
                toast.error(msg);
            }
        },
    });

    return {
        inventoryItems: inventoryItems?.items,
        pagination: inventoryItems?.pagination,
        fetchingInventoryItems,
        refreshInventoryItems,
        createItem: createItemMutation.mutateAsync,
        isCreatingItem: createItemMutation.isPending,
        updateItem: updateItemMutation.mutateAsync,
        isUpdatingItem: updateItemMutation.isPending,
        deleteItem: deleteItemMutation.mutateAsync,
        isDeletingItem: deleteItemMutation.isPending,
        adjustStock: adjustStockMutation.mutateAsync,
        isAdjustingStock: adjustStockMutation.isPending,
    };
};

export const useInventoryDashboard = (businessId: string) => {
    return useQuery({
        queryKey: ["inventory_dashboard", businessId],
        queryFn: async () => {
            const data = await fetchInventoryDashboardApiCall(businessId);
            return {
                totalItems: (data as any)?.totalItems ?? 0,
                lowStockItems: (data as any)?.lowStockItems ?? 0,
                totalStockUnits: (data as any)?.totalStockUnits ?? 0,
            };
        },
        enabled: !!businessId,
        staleTime: 1000 * 60 * 2,
    });
};

export const useInventoryLowStock = (businessId: string) => {
    return useQuery({
        queryKey: ["inventory_low_stock", businessId],
        queryFn: async () => {
            const data = await fetchInventoryLowStockApiCall(businessId);
            return Array.isArray(data) ? data : [];
        },
        enabled: !!businessId,
        staleTime: 1000 * 60 * 2,
    });
};

export const useInventoryTopConsumed = (businessId: string, params?: TopConsumedFilters) => {
    return useQuery({
        queryKey: ["inventory_top_consumed", businessId, params],
        queryFn: async () => {
            const data = await fetchInventoryTopConsumedApiCall(businessId, params);
            return Array.isArray(data) ? data : [];
        },
        enabled: !!businessId,
        staleTime: 1000 * 60 * 5,
    });
};

export const useInventoryMovements = (businessId: string, itemId: string | null, params?: { page?: number; limit?: number }) => {
    return useQuery({
        queryKey: ["inventory_movements", businessId, itemId, params],
        queryFn: async () => {
            const paged = await fetchInventoryMovementsApiCall(businessId, itemId!, params);
            return {
                movements: paged.data,
                pagination: { current: paged.current, pages: paged.pages },
            };
        },
        enabled: !!businessId && !!itemId,
        staleTime: 1000 * 30,
    });
};

export const useInventoryTimeline = (businessId: string, params?: TimelineFilters) => {
    return useQuery({
        queryKey: ["inventory_timeline", businessId, params],
        queryFn: async () => {
            const paged = await fetchInventoryTimelineApiCall(businessId, params);
            return {
                movements: paged.data,
                pagination: { current: paged.current, pages: paged.pages },
            };
        },
        enabled: !!businessId,
        staleTime: 1000 * 30,
    });
};

export const useInventoryAutocomplete = (businessId: string, query: string) => {
    return useQuery({
        queryKey: ["inventory_autocomplete", businessId, query],
        queryFn: async () => {
            const data = await fetchInventoryAutocompleteApiCall(businessId, query);
            return Array.isArray(data) ? data : [];
        },
        enabled: !!businessId && query.length >= 1,
        staleTime: 1000 * 30,
    });
};
