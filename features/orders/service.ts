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
        modifiers?: { modifierItemId: string; name: string; price: number }[];
    }[];
    reservationId?: string;
    paymentStatus?: "pending" | "paid" | "refunded" | "failed";
    paymentMethod?: "cash" | "card" | "online" | "other";
}

export interface UpdateOrderDto {
    status?: "pending" | "preparing" | "ready" | "served" | "completed" | "cancelled";
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
    status: "open" | "sent" | "served" | "closed" | "cancelled";
    tableId?: string;
    totalAmount: number;
    totalPaid?: number;
    items: {
        id: string;
        menuItemId: string;
        quantity: number;
        notes?: string;
        price: number;
        nameSnapshot?: string;
        basePriceSnapshot?: string | number;
        totalPrice?: string | number;
    }[];
    payments?: {
        id: string;
        amount: number;
        method: "cash" | "card" | "online" | "other";
        status: string;
        createdAt: string;
    }[];
    paymentStatus: "pending" | "partially_paid" | "paid" | "refunded" | "failed";
    paymentMethod?: "cash" | "card" | "online" | "other";
    createdAt: string;
    updatedAt: string;
}

export interface CreatePaymentDto {
    amount: number;
    method: "cash" | "card" | "online" | "other";
}

// API Calls
export const fetchOrdersApiCall = (businessId: string) => {
    return flairapi.get(getOrdersUrl(businessId));
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

export const sendOrderApiCall = (businessId: string, orderId: string) => {
    return flairapi.patch(`${getOrdersUrl(businessId)}/${orderId}/send`, {});
};

export const serveOrderApiCall = (businessId: string, orderId: string) => {
    return flairapi.patch(`${getOrdersUrl(businessId)}/${orderId}/serve`, {});
};

export const closeOrderApiCall = (businessId: string, orderId: string) => {
    return flairapi.patch(`${getOrdersUrl(businessId)}/${orderId}/close`, {});
};

export const createPaymentApiCall = (businessId: string, orderId: string, data: CreatePaymentDto) => {
    return flairapi.post(`${getOrdersUrl(businessId)}/${orderId}/payments`, data);
};
