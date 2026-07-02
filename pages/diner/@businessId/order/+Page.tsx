import React, { useCallback } from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import { useDiscoveryProfile } from '@/features/discovery/useDiscovery';
import {
    useBusinessSeatedReservation,
    useActiveDineInOrder,
    useActiveOrderDetail,
    usePlaceDineInOrder,
    useAddItemsToOrder,
} from '@/features/diner-mode/useDinerMode';
import { useDinerModeStore } from '@/features/diner-mode/DinerModeStore';
import { PlaceDineInOrderPayload, AddItemsToOrderPayload } from '@/features/diner-mode/diner-mode.api';
import DinerMyOrderTab from '@/components/diner-mode/DinerMyOrderTab';

export default function DinerOrderPage() {
    const pageContext = usePageContext();
    const businessId = pageContext.routeParams?.businessId as string;

    const { data: profile } = useDiscoveryProfile(businessId);
    const { data: reservation } = useBusinessSeatedReservation(businessId);
    const { data: activeOrderSummary } = useActiveDineInOrder(businessId);
    const activeOrderId = activeOrderSummary?.id;
    const { data: activeOrder } = useActiveOrderDetail(businessId, activeOrderId);

    const placeDineInOrder = usePlaceDineInOrder(businessId);
    const addItemsToOrder = useAddItemsToOrder(businessId, activeOrderId ?? '');
    const { cart, clearCart, removeFromCart, scannedTableId } = useDinerModeStore();

    const handlePlaceOrder = useCallback(() => {
        if (cart.length === 0) return;

        const items: PlaceDineInOrderPayload['items'] = cart.map((ci) => ({
            menuItemId: ci.menuItemId,
            variantId: ci.variantId,
            quantity: ci.quantity,
            modifiers: ci.modifiers.map((m) => ({ modifierItemId: m.modifierItemId })),
            notes: ci.notes || undefined,
        }));

        if (activeOrderId && activeOrder && ['created', 'accepted'].includes(activeOrder.status)) {
            const payload: AddItemsToOrderPayload = { items };
            addItemsToOrder.mutate(payload, { onSuccess: () => clearCart() });
        } else {
            // Reservation/active-order data is live backend state and always wins;
            // the scanned-table cookie is only a fallback for walk-ins with neither.
            const payload: PlaceDineInOrderPayload = {
                type: 'dine_in',
                tableId: reservation?.tableId ?? activeOrder?.tableId ?? scannedTableId ?? '',
                reservationId: reservation?.id,
                items,
            };
            placeDineInOrder.mutate(payload, { onSuccess: () => clearCart() });
        }
    }, [cart, activeOrderId, activeOrder, reservation, scannedTableId, addItemsToOrder, placeDineInOrder, clearCart]);

    const isSubmitting = placeDineInOrder.isPending || addItemsToOrder.isPending;

    return (
        <DinerMyOrderTab
            businessId={businessId}
            activeOrder={activeOrder ?? null}
            cart={cart}
            allowOrders={profile?.allowOrders ?? false}
            isSubmitting={isSubmitting}
            onPlaceOrder={handlePlaceOrder}
            onRemoveCartItem={removeFromCart}
        />
    );
}
