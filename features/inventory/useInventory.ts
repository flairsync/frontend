import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchInventoryItemsApiCall,
    createInventoryItemApiCall,
    updateInventoryItemApiCall,
    deleteInventoryItemApiCall,
    adjustInventoryStockApiCall,
    CreateInventoryItemDto,
    UpdateInventoryItemDto,
    AdjustStockDto,
    InventoryFilters
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
            const resp = await fetchInventoryItemsApiCall(businessId, {
                limit: 20,
                ...filters
            });
            if (resp.data.success) {
                // The API returns { data: { data: [...], current: 1, pages: 1 } }
                const isPaginated = !!resp.data.data.data;
                const itemsData = isPaginated ? resp.data.data.data : resp.data.data;
                return {
                    items: InventoryItem.parseApiArrayResponse(itemsData),
                    pagination: isPaginated ? {
                        current: resp.data.data.current,
                        pages: resp.data.data.pages,
                    } : null
                };
            }
            return { items: [], pagination: null };
        },
        enabled: !!businessId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const createItemMutation = useMutation({
        mutationFn: (data: CreateInventoryItemDto) => createInventoryItemApiCall(businessId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory_items", businessId] });
            toast.success("Item created successfully");
        },
        onError: () => {
            toast.error("Failed to create item");
        }
    });

    const updateItemMutation = useMutation({
        mutationFn: ({ itemId, data }: { itemId: string, data: UpdateInventoryItemDto }) =>
            updateInventoryItemApiCall(businessId, itemId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory_items", businessId] });
            toast.success("Item updated successfully");
        },
        onError: () => {
            toast.error("Failed to update item");
        }
    });

    const deleteItemMutation = useMutation({
        mutationFn: (itemId: string) => deleteInventoryItemApiCall(businessId, itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory_items", businessId] });
            toast.success("Item deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete item");
        }
    });

    const adjustStockMutation = useMutation({
        mutationFn: ({ itemId, data }: { itemId: string, data: AdjustStockDto }) =>
            adjustInventoryStockApiCall(businessId, itemId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory_items", businessId] });
            toast.success("Stock adjusted successfully");
        },
        onError: () => {
            toast.error("Failed to adjust stock");
        }
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
