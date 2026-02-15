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
        quantity: number;
        notes?: string;
    }[];
    reservationId?: string;
}

export interface UpdateOrderDto {
    status?: "pending" | "preparing" | "ready" | "served" | "completed" | "cancelled";
    items?: {
        menuItemId: string;
        quantity: number;
        notes?: string;
    }[];
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
