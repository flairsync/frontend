import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    fetchOrdersApiCall,
    createOrderApiCall,
    fetchOrderDetailsApiCall,
    updateOrderApiCall,
    CreateOrderDto,
    UpdateOrderDto
} from "./service";

export const useOrders = (businessId: string) => {
    const queryClient = useQueryClient();

    const { data: orders, isFetching: fetchingOrders, refetch } = useQuery({
        queryKey: ["orders", businessId],
        queryFn: async () => {
            try {
                const resp = await fetchOrdersApiCall(businessId);
                const resData = resp.data;
                const actualData = resData?.data !== undefined ? resData.data : resData;

                if (actualData && actualData.data && Array.isArray(actualData.data)) return actualData.data;
                return Array.isArray(actualData) ? actualData : [];
            } catch (error) {
                console.warn("Failed to fetch orders:", error);
                return [];
            }
        },
        enabled: !!businessId,
    });

    const createOrderMutation = useMutation({
        mutationFn: (data: CreateOrderDto) => createOrderApiCall(businessId, data),
        onSuccess: () => {
            toast.success("Order created successfully");
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
            // Tables might be marked as occupied
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] });
            queryClient.invalidateQueries({ queryKey: ["tables", businessId] });
        },
    });

    const updateOrderMutation = useMutation({
        mutationFn: ({ orderId, data }: { orderId: string; data: UpdateOrderDto }) =>
            updateOrderApiCall(businessId, orderId, data),
        onSuccess: () => {
            toast.success("Order updated successfully");
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
            // Tables might be marked as available if order is completed/cancelled
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] });
            queryClient.invalidateQueries({ queryKey: ["tables", businessId] });
        },
    });

    return {
        orders,
        fetchingOrders,
        refetchOrders: refetch,
        createOrder: createOrderMutation.mutate,
        isCreatingOrder: createOrderMutation.isPending,
        updateOrder: updateOrderMutation.mutate,
        isUpdatingOrder: updateOrderMutation.isPending,
    };
};

export const useOrderDetails = (businessId: string, orderId: string) => {
    return useQuery({
        queryKey: ["order", businessId, orderId],
        queryFn: async () => {
            try {
                const resp = await fetchOrderDetailsApiCall(businessId, orderId);
                return resp.data?.data || resp.data || null;
            } catch (error) {
                console.warn("Failed to fetch order details:", error);
                return null;
            }
        },
        enabled: !!businessId && !!orderId,
    });
};
