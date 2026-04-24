import flairapi from "@/lib/flairapi";

const getOrdersUrl = (businessId: string) => {
    return `${import.meta.env.BASE_URL}/businesses/${businessId}/orders`;
};

// DTOs
export interface CreateOrderDto {
    type: "dine_in" | "takeaway" | "delivery";
    tableId?: string; // Required for dine_in
    items: {
        menuItemId: string;
        variantId?: string;
        quantity: number;
        notes?: string;
        modifiers?: { modifierItemId: string }[];
    }[];
    reservationId?: string;
    paymentStatus?: "pending" | "paid" | "refunded" | "failed";
    paymentMethod?: "cash" | "card" | "online" | "other";
    lat?: number;
    lng?: number;
}

export type OrderStatus =
    | 'created'
    | 'accepted'
    | 'preparing'
    | 'ready'
    | 'completed'
    | 'rejected'
    | 'canceled';

export const TERMINAL_STATUSES: OrderStatus[] = ['completed', 'rejected', 'canceled'];
export const ACTIVE_STATUSES: OrderStatus[] = ['created', 'accepted', 'preparing', 'ready'];

export interface UpdateOrderDto {
    status?: OrderStatus;
    items?: {
        menuItemId: string;
        quantity: number;
        notes?: string;
    }[];
    paymentStatus?: "pending" | "paid" | "refunded" | "failed";
    paymentMethod?: "cash" | "card" | "online" | "other";
}

export interface Order {
    id: string;
    businessId: string;
    type: "dine_in" | "takeaway" | "delivery";
    status: OrderStatus;
    tableId?: string;
    table?: { id: string; name: string; number?: number };
    totalAmount: number;
    totalPaid?: number;
    totalTip?: number;
    taxAmount?: string | number;
    discountAmount?: string | number;
    items: {
        id: string;
        menuItemId: string;
        variantId?: string;
        quantity: number;
        notes?: string;
        price: number;
        status?: string;
        nameSnapshot?: string;
        basePriceSnapshot?: string | number;
        totalPrice?: string | number;
        selectedModifiers?: { id?: string; name: string; price: number }[];
    }[];
    payments?: {
        id: string;
        amount: number;
        tipAmount?: number;
        method: "cash" | "card" | "online" | "other";
        status: string;
        idempotencyKey: string | null;
        createdAt: string;
    }[];
    paymentStatus: "pending" | "partially_paid" | "paid" | "refunded" | "failed";
    paymentMethod?: "cash" | "card" | "online" | "other";
    cancellationReason?: string;
    rejectionReason?: string | null;
    closingNotes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePaymentDto {
    amount: number;
    method: "cash" | "card" | "online" | "other";
    tipAmount?: number;
}

export const fetchOrdersApiCall = (
    businessId: string,
    status?: "ongoing" | "all" | OrderStatus,
    startDate?: string,
    endDate?: string
) => {
    const url = getOrdersUrl(businessId);
    const params = new URLSearchParams();

    if (status) params.append("status", status);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const qs = params.toString();
    return flairapi.get(qs ? `${url}?${qs}` : url);
};

export const createOrderApiCall = (businessId: string, data: CreateOrderDto) => {
    return flairapi.post(getOrdersUrl(businessId), data);
};

export const fetchOrderDetailsApiCall = (businessId: string, orderId: string) => {
    return flairapi.get(`${getOrdersUrl(businessId)}/${orderId}`);
};

export const updateOrderApiCall = (businessId: string, orderId: string, data: UpdateOrderDto) => {
    return flairapi.patch(`${getOrdersUrl(businessId)}/${orderId}`, data);
};

export const addItemsToOrderApiCall = (businessId: string, orderId: string, data: { items: any[] }) => {
    return flairapi.post(`${getOrdersUrl(businessId)}/${orderId}/items`, data);
};

export const acceptOrderApiCall = (businessId: string, orderId: string) => {
    return flairapi.patch(`${getOrdersUrl(businessId)}/${orderId}/accept`, {});
};

export const rejectOrderApiCall = (businessId: string, orderId: string, data?: { reason?: string }) => {
    return flairapi.patch(`${getOrdersUrl(businessId)}/${orderId}/reject`, data || {});
};

export const prepareOrderApiCall = (businessId: string, orderId: string) => {
    return flairapi.patch(`${getOrdersUrl(businessId)}/${orderId}/prepare`, {});
};

export const readyOrderApiCall = (businessId: string, orderId: string) => {
    return flairapi.patch(`${getOrdersUrl(businessId)}/${orderId}/ready`, {});
};

export const completeOrderApiCall = (businessId: string, orderId: string, data?: { force?: boolean; notes?: string }) => {
    return flairapi.patch(`${getOrdersUrl(businessId)}/${orderId}/complete`, data || {});
};

export const cancelOrderApiCall = (businessId: string, orderId: string, data?: { reason?: string }) => {
    return flairapi.patch(`${getOrdersUrl(businessId)}/${orderId}/cancel`, data || {});
};

export const createPaymentApiCall = (businessId: string, orderId: string, data: CreatePaymentDto, idempotencyKey?: string) => {
    return flairapi.post(
        `${getOrdersUrl(businessId)}/${orderId}/payments`,
        data,
        idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined
    );
};

export const refundPaymentApiCall = (businessId: string, orderId: string, paymentId: string, data?: { reason?: string }) => {
    return flairapi.post(`${getOrdersUrl(businessId)}/${orderId}/payments/${paymentId}/refund`, data || {});
};

export const transferOrderApiCall = (businessId: string, orderId: string, data: { tableId: string }) => {
    return flairapi.patch(`${getOrdersUrl(businessId)}/${orderId}/transfer`, data);
};

export const updateOrderItemApiCall = (businessId: string, orderId: string, itemId: string, data: { variantId?: string | null; quantity?: number; modifiers?: any[]; notes?: string }) => {
    return flairapi.patch(`${getOrdersUrl(businessId)}/${orderId}/items/${itemId}`, data);
};

export const voidOrderItemApiCall = (businessId: string, orderId: string, itemId: string) => {
    return flairapi.delete(`${getOrdersUrl(businessId)}/${orderId}/items/${itemId}`);
};
