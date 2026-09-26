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
    // Proves tableId was actually scanned off that table's QR (the `qt` param on
    // its /tbl/... link — see the cookie it's read from in utils/cookies.ts).
    // Omit when tableId instead came from a verified seated reservation; the
    // backend accepts either as proof (see DiscoveryController.createOrder).
    tableToken?: string;
    items: OrderItemPayload[];
}
