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
    quickCompleteOrderApiCall,
    cancelOrderApiCall,
    createPaymentApiCall,
    refundPaymentApiCall,
    transferOrderApiCall,
    updateOrderItemApiCall,
    voidOrderItemApiCall,
    advanceOrderItemApiCall,
    firePendingItemsApiCall,
    updateOrderDiscountApiCall,
    batchUpdateOrdersApiCall,
    CreateOrderDto,
    UpdateOrderDto,
    CreatePaymentDto,
    BatchUpdateOrdersDto,
    BatchUpdateResult,
    Order,
    OrderStatus,
} from "./service";
import { PaginatedData } from "../shared/api-response";

export const useOrders = (
    businessId: string,
    status?: "ongoing" | "all" | OrderStatus,
    startDate?: string,
    endDate?: string,
    tableId?: string,
    customerName?: string,
    enabled: boolean = true,
    page: number = 1,
    limit?: number,
) => {
    const queryClient = useQueryClient();

    const { data: ordersResponse, isFetching: fetchingOrders, refetch } = useQuery<PaginatedData<Order>>({
        queryKey: ["orders", businessId, status || "ongoing", startDate, endDate, tableId, customerName, page, limit],
        queryFn: () => fetchOrdersApiCall(businessId, status, startDate, endDate, tableId, customerName, page, limit),
        enabled: !!businessId && enabled,
    });

    const orders = ordersResponse?.data;
    const totalPages = ordersResponse?.pages ?? 1;
    const currentPage = ordersResponse?.current ?? page;

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
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Failed to add items to order";
            toast.error(msg);
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

    const quickCompleteOrderMutation = useMutation({
        mutationFn: (orderId: string) => quickCompleteOrderApiCall(businessId, orderId),
        onSuccess: (order) => {
            toast.success(order.status === "completed" ? "Order completed" : "Order is ready — payment required to complete");
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
            queryClient.invalidateQueries({ queryKey: ["inventory_items", businessId] });
            queryClient.invalidateQueries({ queryKey: ["inventory_dashboard", businessId] });
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] });
            queryClient.invalidateQueries({ queryKey: ["tables", businessId] });
        },
        onError: (error: any) => {
            const code = error.response?.data?.code;
            if (code === "inventory.insufficient_stock") {
                const msg = error.response?.data?.message || "Insufficient stock to complete this order.";
                toast.error("Insufficient Stock", {
                    description: msg,
                    duration: 8000,
                });
                return;
            }
            handleInvalidTransition(error, () => queryClient.invalidateQueries({ queryKey: ["orders", businessId] }));
            if (code !== "order.invalid_transition") toast.error("Failed to quick complete order");
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
        onSuccess: (response, { orderId }) => {
            const updatedOrder = response.data?.data || response.data;
            toast.success("Item updated successfully");
            if (updatedOrder?.id) {
                queryClient.setQueryData(["order", businessId, orderId], (old: Order | undefined | null) =>
                    old ? { ...old, ...updatedOrder } : updatedOrder
                );
                queryClient.setQueryData(["orders", businessId], (old: Order[] | undefined) => {
                    if (!old) return old;
                    return old.map(o => o.id === orderId ? { ...o, ...updatedOrder } : o);
                });
            }
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
            queryClient.invalidateQueries({ queryKey: ["order", businessId, orderId] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Failed to update item";
            toast.error(msg);
        }
    });

    const voidOrderItemMutation = useMutation({
        mutationFn: ({ orderId, itemId, reason }: { orderId: string; itemId: string; reason?: string }) =>
            voidOrderItemApiCall(businessId, orderId, itemId, reason),
        onSuccess: (response, { orderId }) => {
            const updatedOrder = response.data?.data || response.data;
            toast.success("Item voided — bill updated");
            if (updatedOrder?.id) {
                queryClient.setQueryData(["order", businessId, orderId], (old: Order | undefined | null) =>
                    old ? { ...old, ...updatedOrder } : updatedOrder
                );
                queryClient.setQueryData(["orders", businessId], (old: Order[] | undefined) => {
                    if (!old) return old;
                    return old.map(o => o.id === orderId ? { ...o, ...updatedOrder } : o);
                });
            }
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
            queryClient.invalidateQueries({ queryKey: ["order", businessId, orderId] });
        },
        onError: (error: any) => {
            const code = error.response?.data?.code;
            if (code === "order_item.already_voided") {
                toast.error("This item is already voided.");
            } else {
                const msg = error.response?.data?.message || "Failed to void item";
                toast.error(msg);
            }
        }
    });

    const advanceOrderItemMutation = useMutation({
        mutationFn: ({ orderId, itemId }: { orderId: string; itemId: string; tableName?: string }) =>
            advanceOrderItemApiCall(businessId, orderId, itemId),
        onMutate: async ({ orderId, itemId }) => {
            await queryClient.cancelQueries({ queryKey: ["order", businessId, orderId] });
            const previousOrder = queryClient.getQueryData(["order", businessId, orderId]);
            queryClient.setQueryData(["order", businessId, orderId], (old: Order | undefined | null) => {
                if (!old) return old;
                return {
                    ...old,
                    items: old.items.map((item: any) => {
                        if (item.id !== itemId) return item;
                        const nextStatus = item.status === "pending" ? "sent" : item.status === "sent" ? "ready" : item.status === "ready" ? "served" : item.status;
                        return { ...item, status: nextStatus };
                    }),
                };
            });
            return { previousOrder, orderId };
        },
        onSuccess: (response, { orderId, tableName }) => {
            const data = response.data?.data || response.data;
            const { item, orderStatus, allItemsReady } = data;
            queryClient.setQueryData(["order", businessId, orderId], (old: Order | undefined | null) => {
                if (!old) return old;
                return {
                    ...old,
                    status: orderStatus ?? old.status,
                    items: old.items.map((i: any) => (i.id === item.id ? { ...i, ...item } : i)),
                };
            });
            if (allItemsReady) {
                toast.success(`All items ready${tableName ? ` for ${tableName}` : ""}!`);
            }
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
        },
        onError: (error: any, { orderId }, context) => {
            if (context?.previousOrder !== undefined) {
                queryClient.setQueryData(["order", businessId, orderId], context.previousOrder);
            }
            const msg = error.response?.data?.message || "Failed to advance item status";
            toast.error(msg);
        },
    });

    const firePendingMutation = useMutation({
        mutationFn: ({ orderId }: { orderId: string; tableName?: string }) =>
            firePendingItemsApiCall(businessId, orderId),
        onSuccess: (response, { orderId, tableName }) => {
            const data = response.data?.data || response.data;
            const { firedCount, orderStatus } = data;
            queryClient.setQueryData(["order", businessId, orderId], (old: Order | undefined | null) => {
                if (!old) return old;
                return {
                    ...old,
                    status: orderStatus ?? old.status,
                    items: old.items.map((i: any) =>
                        i.status === "pending" ? { ...i, status: "sent" } : i
                    ),
                };
            });
            toast.success(`${firedCount} item${firedCount !== 1 ? "s" : ""} sent to kitchen${tableName ? ` for ${tableName}` : ""}.`);
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
        },
        onError: (error: any) => {
            const code = error.response?.data?.code;
            if (code === "order.no_pending_items") {
                toast.error("There are no pending items to send to the kitchen.");
            } else {
                const msg = error.response?.data?.message || "Failed to fire pending items";
                toast.error(msg);
            }
        },
    });

    const batchUpdateMutation = useMutation({
        mutationFn: (dto: BatchUpdateOrdersDto) => batchUpdateOrdersApiCall(businessId, dto),
        onSuccess: (response) => {
            const result = response.data?.data as BatchUpdateResult;
            if (result.succeeded.length > 0) {
                toast.success(`${result.succeeded.length} order${result.succeeded.length > 1 ? 's' : ''} updated`);
            }
            if (result.failed.length > 0) {
                toast.error(`${result.failed.length} order${result.failed.length > 1 ? 's' : ''} could not be updated`);
            }
            queryClient.invalidateQueries({ queryKey: ['orders', businessId] });
            queryClient.invalidateQueries({ queryKey: ['floors', businessId] });
            queryClient.invalidateQueries({ queryKey: ['tables', businessId] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || 'Failed to update orders';
            toast.error(msg);
        },
    });

    const updateOrderDiscountMutation = useMutation({
        mutationFn: ({ orderId, discountAmount }: { orderId: string; discountAmount: number }) =>
            updateOrderDiscountApiCall(businessId, orderId, discountAmount),
        onSuccess: (_, { discountAmount }) => {
            toast.success(discountAmount === 0 ? "Discount removed" : "Discount updated");
            queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
            queryClient.invalidateQueries({ queryKey: ["order", businessId] });
        },
        onError: (error: any) => {
            if (
                error?.response?.status === 422 &&
                error?.response?.data?.code === "order.discount_exceeds_total"
            ) {
                toast.error("Discount cannot exceed the order total");
            } else {
                toast.error(error?.response?.data?.message ?? "Failed to update discount");
            }
        },
    });

    return {
        orders,
        totalPages,
        currentPage,
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
        quickCompleteOrder: quickCompleteOrderMutation.mutate,
        isQuickCompletingOrder: quickCompleteOrderMutation.isPending,
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
        advanceOrderItem: advanceOrderItemMutation.mutate,
        isAdvancingOrderItem: advanceOrderItemMutation.isPending,
        firePending: firePendingMutation.mutate,
        isFiringPending: firePendingMutation.isPending,
        updateOrderDiscount: updateOrderDiscountMutation.mutate,
        updateOrderDiscountAsync: updateOrderDiscountMutation.mutateAsync,
        isUpdatingDiscount: updateOrderDiscountMutation.isPending,
        batchUpdateOrders: batchUpdateMutation.mutate,
        isBatchUpdating: batchUpdateMutation.isPending,
    };
};

export const useOrderDetails = (businessId: string, orderId: string) => {
    return useQuery<Order | null>({
        queryKey: ["order", businessId, orderId],
        queryFn: async () => {
            return await fetchOrderDetailsApiCall(businessId, orderId) ?? null;
        },
        enabled: !!businessId && !!orderId,
    });
};
