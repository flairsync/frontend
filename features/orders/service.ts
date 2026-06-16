import flairapi from "@/lib/flairapi";
import { unwrap } from "../shared/api-response";

const getOrdersUrl = (businessId: string) => {
    return `${import.meta.env.PUBLIC_ENV__BASE_URL}/businesses/${businessId}/orders`;
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
    kitchenNotes?: string;
    taxExempt?: boolean;
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
        voidReason?: string;
        voidedBy?: string | null;
        voidedAt?: string | null;
        selectedModifiers?: { id?: string; modifierItemId?: string; name: string; price: number }[];
    }[];
    payments?: {
        id: string;
        amount: number;
        tipAmount?: number;
        method: "cash" | "card" | "online" | "other";
        status: string;
        idempotencyKey: string | null;
        refundedBy?: string | null;
        createdAt: string;
    }[];
    paymentStatus: "pending" | "partially_paid" | "paid" | "refunded" | "failed";
    paymentMethod?: "cash" | "card" | "online" | "other";
    cancellationReason?: string;
    rejectionReason?: string | null;
    closingNotes?: string;
    kitchenNotes?: string;
    taxExempt?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePaymentDto {
    amount: number;
    method: "cash" | "card" | "online" | "other";
    tipAmount?: number;
    cashTendered?: number;
}

export const fetchOrdersApiCall = async (
    businessId: string,
    status?: "ongoing" | "all" | OrderStatus,
    startDate?: string,
    endDate?: string,
    tableId?: string,
    customerName?: string,
) => {
    const url = getOrdersUrl(businessId);
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (tableId) params.append("tableId", tableId);
    if (customerName) params.append("customerName", customerName);
    const qs = params.toString();
    return unwrap(await flairapi.get(qs ? `${url}?${qs}` : url));
};

export const createOrderApiCall = (businessId: string, data: CreateOrderDto) => {
    return flairapi.post(getOrdersUrl(businessId), data);
};

export const fetchOrderDetailsApiCall = async (businessId: string, orderId: string) =>
    unwrap(await flairapi.get(`${getOrdersUrl(businessId)}/${orderId}`));

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

export const voidOrderItemApiCall = (businessId: string, orderId: string, itemId: string, reason?: string) => {
    const config = reason ? { data: { reason } } : undefined;
    return flairapi.delete(`${getOrdersUrl(businessId)}/${orderId}/items/${itemId}`, config);
};

export const advanceOrderItemApiCall = (businessId: string, orderId: string, itemId: string) => {
    return flairapi.patch(`${getOrdersUrl(businessId)}/${orderId}/items/${itemId}/advance`, {});
};

export const firePendingItemsApiCall = (businessId: string, orderId: string) => {
    return flairapi.patch(`${getOrdersUrl(businessId)}/${orderId}/fire-pending`, {});
};

// ─── Receipt ──────────────────────────────────────────────────────────────────

export interface ReceiptTax {
    name: string;
    rate: number;
    included: boolean;
    amount: number;
}

/** @deprecated use ReceiptTax */
export interface ReceiptTaxLine {
    name: string;
    rate: number;
    amount: number;
    isInclusive: boolean;
}

export interface ReceiptItem {
    name: string;
    variantName: string | null;
    modifiers: Array<{ name: string; price: number }>;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface ReceiptPayment {
    id?: string;
    method: "cash" | "card" | "online" | "other";
    amount: number;
    tipAmount: number;
    cashTendered: number | null;
    changeGiven: number | null;
    status?: "success" | "failed" | "refunded";
}

export interface ReceiptData {
    receiptNumber: string;
    generatedAt: string;
    orderId: string;
    type: "dine_in" | "takeaway" | "delivery";
    status: string;
    paymentStatus: string;
    tableId: string | null;
    tableName: string | null;
    createdAt: string;
    closedAt: string | null;
    items: ReceiptItem[];
    subtotal: number;
    tax: ReceiptTax;
    discountAmount: number;
    totalAmount: number;
    payments: ReceiptPayment[];
    totalPaid: number;
    totalTip: number;
}

export const getReceiptApiCall = async (businessId: string, orderId: string) =>
    unwrap<ReceiptData>(await flairapi.get(`${getOrdersUrl(businessId)}/${orderId}/receipt`));

export const printReceiptApiCall = async (businessId: string, orderId: string): Promise<Blob> => {
    const response = await flairapi.post(
        `${getOrdersUrl(businessId)}/${orderId}/receipt/print`,
        {},
        { responseType: "blob" },
    );
    return response.data as Blob;
};

// ─── Split Bill ───────────────────────────────────────────────────────────────

export type SplitPaymentStatus = "unpaid" | "partially_paid" | "paid";

export interface OrderSplitItem {
    id: string;
    nameSnapshot?: string;
    quantity: number;
    totalPrice?: number;
}

export interface OrderSplit {
    id: string;
    orderId: string;
    label: string;
    totalAmount: number;
    totalPaid: number;
    paymentStatus: SplitPaymentStatus;
    items: OrderSplitItem[];
    createdAt: string;
}

export interface CreateSplitsPayload {
    splits: Array<{ label: string; itemIds: string[] }>;
}

export interface PaySplitPayload {
    amount: number;
    method: "cash" | "card" | "online" | "other";
    tipAmount?: number;
    cashTendered?: number;
}

export const splitsApi = {
    create: async (businessId: string, orderId: string, payload: CreateSplitsPayload) =>
        unwrap<OrderSplit[]>(await flairapi.post(`${getOrdersUrl(businessId)}/${orderId}/splits`, payload)),

    list: async (businessId: string, orderId: string) =>
        unwrap<OrderSplit[]>(await flairapi.get(`${getOrdersUrl(businessId)}/${orderId}/splits`)),

    remove: (businessId: string, orderId: string) =>
        flairapi.delete(`${getOrdersUrl(businessId)}/${orderId}/splits`),

    pay: async (
        businessId: string,
        orderId: string,
        splitId: string,
        payload: PaySplitPayload,
        idempotencyKey?: string,
    ) =>
        unwrap<{ split: OrderSplit; payment: any }>(await flairapi.post(
            `${getOrdersUrl(businessId)}/${orderId}/splits/${splitId}/payments`,
            payload,
            idempotencyKey ? { headers: { "Idempotency-Key": idempotencyKey } } : undefined,
        )),
};

export interface BatchUpdateOrdersDto {
    orderIds: string[];
    action: 'accept' | 'cancel' | 'reject';
    reason?: string;
}

export interface BatchUpdateResult {
    succeeded: string[];
    failed: { id: string; reason: string }[];
    total: number;
}

export const batchUpdateOrdersApiCall = (businessId: string, dto: BatchUpdateOrdersDto) =>
    flairapi.post(`${getOrdersUrl(businessId)}/batch-update`, dto);

export const updateOrderDiscountApiCall = (
    businessId: string,
    orderId: string,
    discountAmount: number,
) =>
    flairapi.patch(`${getOrdersUrl(businessId)}/${orderId}/discount`, { discountAmount });

export const reorderStationOrderApiCall = (
    orderId: string,
    data?: { type?: "dine_in" | "takeaway"; tableId?: string },
) =>
    import("@/features/station/station-api").then(({ staffApi }) =>
        staffApi.patch(`/station/orders/${orderId}/reorder`, data ?? {}),
    );
