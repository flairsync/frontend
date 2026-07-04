import React, { useCallback, useState } from 'react';
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
import GuestEmailPrompt from '@/components/diner-mode/GuestEmailPrompt';
import { getEmailPromptSeenOrderId, setEmailPromptSeenOrderId } from '@/utils/cookies';

export default function DinerOrderPage() {
    const pageContext = usePageContext();
    const businessId = pageContext.routeParams?.businessId as string;
    const isLoggedIn = !!pageContext.user;

    const { data: profile } = useDiscoveryProfile(businessId);
    const { data: reservation } = useBusinessSeatedReservation(businessId);
    const { data: myOrderSummary } = useActiveDineInOrder(businessId);
    const { cart, clearCart, removeFromCart, scannedTableId, guestOrderId } = useDinerModeStore();
    // Logged-in diners are looked up via their account; guests track the order
    // id they were handed at checkout time (held in a cookie-backed store).
    const activeOrderId = isLoggedIn ? myOrderSummary?.id : (guestOrderId ?? undefined);
    const {
        data: activeOrder,
        refetch: refetchActiveOrder,
        isFetching: isRefreshingOrder,
        dataUpdatedAt: orderUpdatedAt,
    } = useActiveOrderDetail(businessId, activeOrderId);

    const placeDineInOrder = usePlaceDineInOrder(businessId);
    const addItemsToOrder = useAddItemsToOrder(businessId, activeOrderId ?? '');

    // Ask guests for an email only after they've placed an order — never
    // before, and never at all if they're already logged in (we have theirs).
    // The dismissal is cookie-backed and keyed to the order id, so a refresh
    // doesn't show it again for the same order, but a new order gets asked again.
    const [emailPromptSeenId, setEmailPromptSeenId] = useState<string | null>(
        () => getEmailPromptSeenOrderId()
    );
    const showEmailPrompt =
        !isLoggedIn &&
        !!activeOrder &&
        !activeOrder.guestEmail &&
        activeOrderId !== undefined &&
        activeOrderId !== emailPromptSeenId;

    const dismissEmailPrompt = useCallback(() => {
        if (activeOrderId) {
            setEmailPromptSeenOrderId(activeOrderId);
            setEmailPromptSeenId(activeOrderId);
        }
    }, [activeOrderId]);

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
        <>
            <DinerMyOrderTab
                businessId={businessId}
                activeOrder={activeOrder ?? null}
                cart={cart}
                canOrder={profile?.allowTableOrdering ?? false}
                isSubmitting={isSubmitting}
                onPlaceOrder={handlePlaceOrder}
                onRemoveCartItem={removeFromCart}
                onRefresh={() => refetchActiveOrder()}
                isRefreshing={isRefreshingOrder}
                lastUpdatedAt={orderUpdatedAt}
            />
            {activeOrderId && (
                <GuestEmailPrompt
                    businessId={businessId}
                    orderId={activeOrderId}
                    open={showEmailPrompt}
                    onClose={dismissEmailPrompt}
                />
            )}
        </>
    );
}
