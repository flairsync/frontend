import flairapi from "@/lib/flairapi";

export type DiscountType = "PERCENTAGE" | "FIXED";

export interface Discount {
    id: string;
    businessId: string;
    name: string;
    code: string | null;
    type: DiscountType;
    value: number;
    minOrderAmount: number | null;
    isActive: boolean;
    expiresAt: string | null;
    createdAt: string;
}

export interface CreateDiscountPayload {
    name: string;
    code?: string | null;
    type: DiscountType;
    value: number;
    minOrderAmount?: number | null;
    isActive?: boolean;
    expiresAt?: string | null;
}

export interface ApplyDiscountPayload {
    discountId?: string;
    code?: string;
    manualAmount?: number;
    reason?: string;
}

const getUrl = (businessId: string) =>
    `${import.meta.env.BASE_URL}/businesses/${businessId}/discounts`;

const getOrderUrl = (businessId: string, orderId: string) =>
    `${import.meta.env.BASE_URL}/businesses/${businessId}/orders/${orderId}/discount`;

export const discountsApi = {
    list: (businessId: string) =>
        flairapi.get(getUrl(businessId)).then((r) => r.data.data as Discount[]),

    create: (businessId: string, payload: CreateDiscountPayload) =>
        flairapi.post(getUrl(businessId), payload).then((r) => r.data.data as Discount),

    update: (businessId: string, id: string, payload: Partial<CreateDiscountPayload>) =>
        flairapi.patch(`${getUrl(businessId)}/${id}`, payload).then((r) => r.data.data as Discount),

    remove: (businessId: string, id: string) =>
        flairapi.delete(`${getUrl(businessId)}/${id}`),

    applyToOrder: (businessId: string, orderId: string, payload: ApplyDiscountPayload) =>
        flairapi.post(getOrderUrl(businessId, orderId), payload).then((r) => r.data.data),

    removeFromOrder: (businessId: string, orderId: string) =>
        flairapi.delete(getOrderUrl(businessId, orderId)).then((r) => r.data.data),
};
