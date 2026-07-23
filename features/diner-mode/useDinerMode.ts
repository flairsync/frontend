import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchAllMyReservationsApiCall,
    fetchMyOrdersApiCall,
    fetchSingleOrderApiCall,
    submitOrderApiCall,
    addItemsToOrderApiCall,
    setGuestOrderEmailApiCall,
    submitOrderFeedbackApiCall,
    SubmitOrderFeedbackPayload,
} from "@/features/discovery/discovery.api";
import { AddItemsToOrderPayload, PlaceDineInOrderPayload } from "./diner-mode.api";
import { toast } from "sonner";
import { usePageContext } from "vike-react/usePageContext";
import { useDinerModeStore } from "./DinerModeStore";
import { setGuestOrderCookie } from "@/utils/cookies";

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
    guestEmail?: string | null;
    feedbackSubmitted?: boolean;
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
    const pageContext = usePageContext();
    const isLoggedIn = !!pageContext.user;

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
        // "mine" endpoint requires a logged-in user — guests get their table
        // context from the scanned-table cookie instead, never from this query.
        enabled: !!businessId && isLoggedIn,
        refetchInterval: 5 * 60_000,
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
        refetchInterval: 5 * 60_000,
    });
};

export const useActiveDineInOrder = (businessId: string | undefined) => {
    const pageContext = usePageContext();
    const isLoggedIn = !!pageContext.user;

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
        // "mine" endpoint requires a logged-in user — guests track their own
        // order via the guest-order cookie + useActiveOrderDetail instead.
        enabled: !!businessId && isLoggedIn,
        refetchInterval: 5 * 60_000,
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
        // Polls every 15s while the tab is visible (TanStack pauses this
        // automatically when the page is hidden/unfocused) so diners see
        // status changes without a manual refresh; stops once terminal.
        refetchInterval: (query) => {
            const status: string | undefined = (query.state.data as any)?.status;
            if (status && TERMINAL_ORDER_STATUSES.includes(status as any)) return false;
            return 15_000;
        },
    });
};

export const usePlaceDineInOrder = (businessId: string) => {
    const queryClient = useQueryClient();
    const pageContext = usePageContext();
    const isLoggedIn = !!pageContext.user;
    const setGuestOrderId = useDinerModeStore((s) => s.setGuestOrderId);

    return useMutation({
        mutationFn: async (payload: PlaceDineInOrderPayload) => {
            const res = await submitOrderApiCall(businessId, payload);
            return res.data.data ?? res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["diner_active_order", businessId] });
            // Guests have no account to look their order up by later — the
            // cookie + store are the only record that this order is "theirs".
            if (!isLoggedIn && data?.id) {
                setGuestOrderCookie(businessId, data.id);
                setGuestOrderId(data.id);
            }
        },
        onError: (error: any) => {
            const msg =
                error.response?.data?.message ?? "Failed to place order. Please try again.";
            toast.error(msg);
        },
    });
};

export const useSetGuestOrderEmail = (businessId: string) => {
    return useMutation({
        mutationFn: async ({ orderId, email }: { orderId: string; email: string }) => {
            const res = await setGuestOrderEmailApiCall(businessId, orderId, email);
            return res.data.data ?? res.data;
        },
        onError: (error: any) => {
            const msg =
                error.response?.data?.message ?? "Failed to save your email. Please try again.";
            toast.error(msg);
        },
    });
};

export const useSubmitFeedback = (businessId: string, orderId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: SubmitOrderFeedbackPayload) => {
            const res = await submitOrderFeedbackApiCall(businessId, orderId, payload);
            return res.data.data ?? res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["diner_order_detail", businessId, orderId] });
        },
        onError: (error: any) => {
            const msg =
                error.response?.data?.message ?? "Failed to submit feedback. Please try again.";
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
