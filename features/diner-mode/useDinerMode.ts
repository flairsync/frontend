import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchAllMyReservationsApiCall,
    fetchMyOrdersApiCall,
    fetchSingleOrderApiCall,
    submitOrderApiCall,
    addItemsToOrderApiCall,
} from "@/features/discovery/discovery.api";
import { AddItemsToOrderPayload, PlaceDineInOrderPayload } from "./diner-mode.api";
import { toast } from "sonner";
import { usePageContext } from "vike-react/usePageContext";

export const ACTIVE_ORDER_STATUSES = ['created', 'accepted', 'preparing', 'ready'] as const;
export const TERMINAL_ORDER_STATUSES = ['completed', 'canceled', 'rejected'] as const;
export type ActiveOrderStatus = typeof ACTIVE_ORDER_STATUSES[number];

export interface DinerReservation {
    id: string;
    businessId: string;
    status: string;
    tableId: string;
    reservationTime: string;
    guestCount: number;
}

export interface DinerOrder {
    id: string;
    status: string;
    type: string;
    tableId: string;
    items: DinerOrderItem[];
    totalAmount: number;
    paymentStatus: string;
}

export interface DinerOrderItem {
    id: string;
    menuItemId: string;
    nameSnapshot?: string;
    name?: string;
    quantity: number;
    unitPrice?: number;
    price?: number;
    totalPrice?: number;
    basePriceSnapshot?: string | number;
    variantId?: string;
    variantName?: string;
    notes?: string;
    selectedModifiers?: { id?: string; name: string; price: number }[];
}

export const useBusinessSeatedReservation = (businessId: string | undefined) => {
    return useQuery({
        queryKey: ["diner_seated_reservation", businessId],
        queryFn: async (): Promise<DinerReservation | null> => {
            if (!businessId) return null;
            const res = await fetchAllMyReservationsApiCall();
            return (
                res.data.find(
                    (r: any) => r.status === 'seated' && r.businessId === businessId
                ) ?? null
            );
        },
        enabled: !!businessId,
        refetchInterval: 60_000,
    });
};

export const useAllSeatedReservations = () => {
    const pageContext = usePageContext();
    const isLoggedIn = !!pageContext.user;

    return useQuery({
        queryKey: ["diner_all_seated"],
        queryFn: async (): Promise<DinerReservation[]> => {
            const res = await fetchAllMyReservationsApiCall();
            return res.data.filter((r: any) => r.status === 'seated');
        },
        enabled: isLoggedIn,
        refetchInterval: 60_000,
    });
};

export const useActiveDineInOrder = (businessId: string | undefined) => {
    return useQuery({
        queryKey: ["diner_active_order", businessId],
        queryFn: async (): Promise<DinerOrder | null> => {
            if (!businessId) return null;
            const res = await fetchMyOrdersApiCall(businessId);
            return (
                res.data.find(
                    (o: any) =>
                        o.type === 'dine_in' &&
                        ACTIVE_ORDER_STATUSES.includes(o.status as ActiveOrderStatus)
                ) ?? null
            );
        },
        enabled: !!businessId,
        refetchInterval: 30_000,
    });
};

export const useActiveOrderDetail = (
    businessId: string | undefined,
    orderId: string | undefined
) => {
    return useQuery({
        queryKey: ["diner_order_detail", businessId, orderId],
        queryFn: async (): Promise<DinerOrder | null> => {
            if (!businessId || !orderId) return null;
            return fetchSingleOrderApiCall(businessId, orderId);
        },
        enabled: !!businessId && !!orderId,
        refetchInterval: (query) => {
            const status: string | undefined = (query.state.data as any)?.status;
            if (status && TERMINAL_ORDER_STATUSES.includes(status as any)) return false;
            return 30_000;
        },
    });
};

export const usePlaceDineInOrder = (businessId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: PlaceDineInOrderPayload) => {
            const res = await submitOrderApiCall(businessId, payload);
            return res.data.data ?? res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["diner_active_order", businessId] });
        },
        onError: (error: any) => {
            const msg =
                error.response?.data?.message ?? "Failed to place order. Please try again.";
            toast.error(msg);
        },
    });
};

export const useAddItemsToOrder = (businessId: string, orderId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: AddItemsToOrderPayload) => {
            const res = await addItemsToOrderApiCall(businessId, orderId, payload);
            return res.data.data ?? res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["diner_order_detail", businessId, orderId] });
            queryClient.invalidateQueries({ queryKey: ["diner_active_order", businessId] });
        },
        onError: (error: any) => {
            const msg =
                error.response?.data?.message ?? "Failed to add items. Please try again.";
            toast.error(msg);
        },
    });
};
