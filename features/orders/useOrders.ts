import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    fetchOrdersApiCall,
    createOrderApiCall,
    fetchOrderDetailsApiCall,
    updateOrderApiCall,
    addItemsToOrderApiCall,
    acceptOrderApiCall,
    rejectOrderApiCall,
    prepareOrderApiCall,
    readyOrderApiCall,
    completeOrderApiCall,
    cancelOrderApiCall,
    createPaymentApiCall,
    refundPaymentApiCall,
    transferOrderApiCall,
    updateOrderItemApiCall,
    voidOrderItemApiCall,
    CreateOrderDto,
    UpdateOrderDto,
    CreatePaymentDto,
    Order,
    OrderStatus,
} from "./service";

export const useOrders = (
    businessId: string,
    status?: "ongoing" | "all" | OrderStatus,
    startDate?: string,
    endDate?: string
) => {
    const queryClient = useQueryClient();

    const { data: orders, isFetching: fetchingOrders, refetch } = useQuery<Order[]>({
        queryKey: ["orders", businessId, status || "ongoing", startDate, endDate],
        queryFn: async () => {
            try {
                const resp = await fetchOrdersApiCall(businessId, status, startDate, endDate);
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

    const handleInvalidTransition = (error: any, refetchFn: () => void) => {
        if (error.response?.data?.code === "order.invalid_transition") {
            toast.error("Order was already updated. Refreshing...");
            refetchFn();
        }
    };

    const acceptOrderMutation = useMutation({
        mutationFn: (orderId: string) => acceptOrderApiCall(businessId, orderId),
        onSuccess: () => {
            toast.success("Order accepted");
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
            queryClient.invalidateQueries({ queryKey: ["inventory_items", businessId] });
            queryClient.invalidateQueries({ queryKey: ["inventory_dashboard", businessId] });
        },
        onError: (error: any) => {
            const code = error.response?.data?.code;
            if (code === "inventory.insufficient_stock") {
                const msg = error.response?.data?.message || "Insufficient stock to accept this order.";
                toast.error("Insufficient Stock", {
                    description: msg,
                    duration: 8000,
                });
                return;
            }
            handleInvalidTransition(error, () => queryClient.invalidateQueries({ queryKey: ["orders", businessId] }));
            if (code !== "order.invalid_transition") toast.error("Failed to accept order");
        }
    });

    const rejectOrderMutation = useMutation({
        mutationFn: ({ orderId, data }: { orderId: string; data?: { reason?: string } }) =>
            rejectOrderApiCall(businessId, orderId, data),
        onSuccess: () => {
            toast.success("Order rejected");
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
        },
        onError: (error: any) => {
            handleInvalidTransition(error, () => queryClient.invalidateQueries({ queryKey: ["orders", businessId] }));
            if (error.response?.data?.code !== "order.invalid_transition") toast.error("Failed to reject order");
        }
    });

    const prepareOrderMutation = useMutation({
        mutationFn: (orderId: string) => prepareOrderApiCall(businessId, orderId),
        onSuccess: () => {
            toast.success("Order is now being prepared");
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
        },
        onError: (error: any) => {
            handleInvalidTransition(error, () => queryClient.invalidateQueries({ queryKey: ["orders", businessId] }));
            if (error.response?.data?.code !== "order.invalid_transition") toast.error("Failed to start preparing order");
        }
    });

    const readyOrderMutation = useMutation({
        mutationFn: (orderId: string) => readyOrderApiCall(businessId, orderId),
        onSuccess: () => {
            toast.success("Order marked as ready");
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
        },
        onError: (error: any) => {
            handleInvalidTransition(error, () => queryClient.invalidateQueries({ queryKey: ["orders", businessId] }));
            if (error.response?.data?.code !== "order.invalid_transition") toast.error("Failed to mark order as ready");
        }
    });

    const completeOrderMutation = useMutation({
        mutationFn: ({ orderId, data }: { orderId: string; data?: { force?: boolean; notes?: string } }) =>
            completeOrderApiCall(businessId, orderId, data),
        onSuccess: () => {
            toast.success("Order completed");
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] });
            queryClient.invalidateQueries({ queryKey: ["tables", businessId] });
        },
        onError: (error: any) => {
            handleInvalidTransition(error, () => queryClient.invalidateQueries({ queryKey: ["orders", businessId] }));
            if (error.response?.data?.code !== "order.invalid_transition") {
                const msg = error.response?.data?.message || "Failed to complete order";
                toast.error(msg);
            }
        }
    });

    const cancelOrderMutation = useMutation({
        mutationFn: ({ orderId, data }: { orderId: string; data?: { reason?: string } }) =>
            cancelOrderApiCall(businessId, orderId, data),
        onSuccess: () => {
            toast.success("Order canceled");
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] });
            queryClient.invalidateQueries({ queryKey: ["tables", businessId] });
        },
        onError: (error: any) => {
            handleInvalidTransition(error, () => queryClient.invalidateQueries({ queryKey: ["orders", businessId] }));
            if (error.response?.data?.code !== "order.invalid_transition") {
                const msg = error.response?.data?.message || "Failed to cancel order";
                toast.error(msg);
            }
        }
    });

    const createPaymentMutation = useMutation({
        mutationFn: ({ orderId, data, idempotencyKey }: { orderId: string; data: CreatePaymentDto; idempotencyKey?: string }) =>
            createPaymentApiCall(businessId, orderId, data, idempotencyKey),
        retry: (failureCount, error: any) => {
            if (failureCount >= 2) return false;
            const status = error?.response?.status;
            // Only retry true network failures (no response) or 5xx — never 4xx
            if (status && status < 500) return false;
            return true;
        },
        onSuccess: () => {
            toast.success("Payment recorded successfully");
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
            queryClient.invalidateQueries({ queryKey: ["order", businessId] });
        },
        onError: (error: any) => {
            if (error.response?.data?.code === "payment.idempotency_key_conflict") {
                toast.error("Something went wrong with this payment. Please refresh and try again.");
                queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
                queryClient.invalidateQueries({ queryKey: ["order", businessId] });
            } else {
                const msg = error.response?.data?.message || "Failed to record payment";
                toast.error(msg);
            }
        }
    });

    const refundPaymentMutation = useMutation({
        mutationFn: ({ orderId, paymentId, data }: { orderId: string, paymentId: string, data?: { reason?: string } }) =>
            refundPaymentApiCall(businessId, orderId, paymentId, data),
        onSuccess: () => {
            toast.success("Payment refunded successfully");
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
            queryClient.invalidateQueries({ queryKey: ["order", businessId] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Failed to refund payment";
            toast.error(msg);
        }
    });

    const transferOrderMutation = useMutation({
        mutationFn: ({ orderId, data }: { orderId: string, data: { tableId: string } }) =>
            transferOrderApiCall(businessId, orderId, data),
        onSuccess: () => {
            toast.success("Table transferred successfully");
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] });
            queryClient.invalidateQueries({ queryKey: ["tables", businessId] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Failed to transfer table";
            toast.error(msg);
        }
    });

    const updateOrderItemMutation = useMutation({
        mutationFn: ({ orderId, itemId, data }: { orderId: string, itemId: string, data: { variantId?: string | null; quantity?: number; modifiers?: any[]; notes?: string } }) =>
            updateOrderItemApiCall(businessId, orderId, itemId, data),
        onSuccess: () => {
            toast.success("Item updated successfully");
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
            queryClient.invalidateQueries({ queryKey: ["order", businessId] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Failed to update item";
            toast.error(msg);
        }
    });

    const voidOrderItemMutation = useMutation({
        mutationFn: ({ orderId, itemId }: { orderId: string, itemId: string }) =>
            voidOrderItemApiCall(businessId, orderId, itemId),
        onSuccess: () => {
            toast.success("Item voided successfully");
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
            queryClient.invalidateQueries({ queryKey: ["order", businessId] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Failed to void item";
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
        acceptOrder: acceptOrderMutation.mutate,
        isAcceptingOrder: acceptOrderMutation.isPending,
        rejectOrder: rejectOrderMutation.mutate,
        isRejectingOrder: rejectOrderMutation.isPending,
        prepareOrder: prepareOrderMutation.mutate,
        isPreparingOrder: prepareOrderMutation.isPending,
        readyOrder: readyOrderMutation.mutate,
        isMarkingReady: readyOrderMutation.isPending,
        completeOrder: completeOrderMutation.mutate,
        isCompletingOrder: completeOrderMutation.isPending,
        cancelOrder: cancelOrderMutation.mutate,
        isCancellingOrder: cancelOrderMutation.isPending,
        createPayment: createPaymentMutation.mutateAsync,
        isCreatingPayment: createPaymentMutation.isPending,
        refundPayment: refundPaymentMutation.mutate,
        isRefundingPayment: refundPaymentMutation.isPending,
        transferOrder: transferOrderMutation.mutate,
        isTransferringOrder: transferOrderMutation.isPending,
        updateOrderItem: updateOrderItemMutation.mutate,
        isUpdatingOrderItem: updateOrderItemMutation.isPending,
        voidOrderItem: voidOrderItemMutation.mutate,
        isVoidingOrderItem: voidOrderItemMutation.isPending,
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
