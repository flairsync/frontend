import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    fetchOrdersApiCall,
    createOrderApiCall,
    fetchOrderDetailsApiCall,
    updateOrderApiCall,
    addItemsToOrderApiCall,
    sendOrderApiCall,
    serveOrderApiCall,
    closeOrderApiCall,
    createPaymentApiCall,
    CreateOrderDto,
    UpdateOrderDto,
    CreatePaymentDto,
    Order
} from "./service";

export const useOrders = (businessId: string) => {
    const queryClient = useQueryClient();

    const { data: orders, isFetching: fetchingOrders, refetch } = useQuery<Order[]>({
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

    const addItemsToOrderMutation = useMutation({
        mutationFn: ({ orderId, data }: { orderId: string; data: { items: any[] } }) =>
            addItemsToOrderApiCall(businessId, orderId, data),
        onSuccess: (response, variables) => {
            const updatedOrderData = response.data?.data !== undefined ? response.data.data : response.data;
            toast.success("Items added to order successfully");

            // Update cache dynamically
            queryClient.setQueryData(["orders", businessId], (oldOrders: Order[] | undefined) => {
                if (!oldOrders) return oldOrders;
                return oldOrders.map(order =>
                    order.id === variables.orderId ? updatedOrderData : order
                );
            });
            // Also invalidate just in case
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
        },
        onError: () => {
            toast.error("Failed to add items to order");
        }
    });

    const sendOrderMutation = useMutation({
        mutationFn: (orderId: string) => sendOrderApiCall(businessId, orderId),
        onSuccess: () => {
            toast.success("Order sent to kitchen");
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
        },
        onError: () => {
            toast.error("Failed to send order to kitchen");
        }
    });

    const serveOrderMutation = useMutation({
        mutationFn: (orderId: string) => serveOrderApiCall(businessId, orderId),
        onSuccess: () => {
            toast.success("Order marked as served");
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
        },
        onError: () => {
            toast.error("Failed to mark order as served");
        }
    });

    const closeOrderMutation = useMutation({
        mutationFn: (orderId: string) => closeOrderApiCall(businessId, orderId),
        onSuccess: () => {
            toast.success("Order closed successfully");
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] });
            queryClient.invalidateQueries({ queryKey: ["tables", businessId] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Failed to close order";
            toast.error(msg);
        }
    });

    const createPaymentMutation = useMutation({
        mutationFn: ({ orderId, data }: { orderId: string; data: CreatePaymentDto }) =>
            createPaymentApiCall(businessId, orderId, data),
        onSuccess: () => {
            toast.success("Payment recorded successfully");
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Failed to record payment";
            toast.error(msg);
        }
    });

    return {
        orders,
        fetchingOrders,
        refetchOrders: refetch,
        createOrder: createOrderMutation.mutate,
        isCreatingOrder: createOrderMutation.isPending,
        updateOrder: updateOrderMutation.mutate,
        isUpdatingOrder: updateOrderMutation.isPending,
        addItemsToOrder: addItemsToOrderMutation.mutate,
        isAddingItems: addItemsToOrderMutation.isPending,
        sendOrder: sendOrderMutation.mutate,
        isSendingOrder: sendOrderMutation.isPending,
        serveOrder: serveOrderMutation.mutate,
        isServingOrder: serveOrderMutation.isPending,
        closeOrder: closeOrderMutation.mutate,
        isClosingOrder: closeOrderMutation.isPending,
        createPayment: createPaymentMutation.mutateAsync,
        isCreatingPayment: createPaymentMutation.isPending,
    };
};

export const useOrderDetails = (businessId: string, orderId: string) => {
    return useQuery<Order | null>({
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
