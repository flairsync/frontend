export interface OrderItemPayload {
    menuItemId: string;
    variantId?: string;
    quantity: number;
    modifiers?: { modifierItemId: string }[];
    notes?: string;
}

export interface AddItemsToOrderPayload {
    items: OrderItemPayload[];
}

export interface PlaceDineInOrderPayload {
    type: "dine_in";
    tableId: string;
    reservationId?: string;
    items: OrderItemPayload[];
}
