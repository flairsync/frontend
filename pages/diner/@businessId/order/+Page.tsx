import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import { useDiscoveryProfile } from '@/features/discovery/useDiscovery';
import {
    useBusinessSeatedReservation,
    useActiveDineInOrder,
    useActiveOrderDetail,
    useActiveOrderForTable,
    usePlaceDineInOrder,
    useAddItemsToOrder,
} from '@/features/diner-mode/useDinerMode';
import { useDinerModeStore } from '@/features/diner-mode/DinerModeStore';
import { PlaceDineInOrderPayload, AddItemsToOrderPayload } from '@/features/diner-mode/diner-mode.api';
import DinerMyOrderTab from '@/components/diner-mode/DinerMyOrderTab';
import GuestEmailPrompt from '@/components/diner-mode/GuestEmailPrompt';
import FeedbackPrompt from '@/components/diner-mode/FeedbackPrompt';
import {
    getEmailPromptSeenOrderId,
    setEmailPromptSeenOrderId,
    getFeedbackPromptSeenOrderId,
    setFeedbackPromptSeenOrderId,
    setGuestOrderCookie,
} from '@/utils/cookies';

export default function DinerOrderPage() {
    const pageContext = usePageContext();
    const businessId = pageContext.routeParams?.businessId as string;
    const isLoggedIn = !!pageContext.user;

    const { data: profile } = useDiscoveryProfile(businessId);
    const { data: reservation } = useBusinessSeatedReservation(businessId);
    const { data: myOrderSummary } = useActiveDineInOrder(businessId);
    const { cart, clearCart, removeFromCart, updateCartItemQuantity, scannedTableId, scannedTableToken, guestOrderId, setGuestOrderId } = useDinerModeStore();
    // Logged-in diners are looked up via their account; guests track the order
    // id they were handed at checkout time (held in a cookie-backed store).
    const activeOrderId = isLoggedIn ? myOrderSummary?.id : (guestOrderId ?? undefined);
    const {
        data: activeOrder,
        refetch: refetchActiveOrder,
        isFetching: isRefreshingOrder,
        dataUpdatedAt: orderUpdatedAt,
    } = useActiveOrderDetail(businessId, activeOrderId);

    // A guest who scans this table's QR on their own phone, with another guest's
    // order already open on it, has no guestOrderId cookie of their own yet — find
    // and join the table's existing order instead of only discovering it via a
    // table.not_available error on their first attempt to place one.
    const { data: tableActiveOrder } = useActiveOrderForTable(businessId, scannedTableId, scannedTableToken);
    useEffect(() => {
        if (!isLoggedIn && !guestOrderId && tableActiveOrder?.id) {
            setGuestOrderCookie(businessId, tableActiveOrder.id);
            setGuestOrderId(tableActiveOrder.id);
        }
    }, [isLoggedIn, guestOrderId, tableActiveOrder, businessId, setGuestOrderId]);

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

    // Shown to anyone (guest or logged-in) the moment their order completes,
    // as long as they're still on this page — the delayed feedback-request
    // email (see FeedbackService) covers guests who've already left.
    const [feedbackPromptSeenId, setFeedbackPromptSeenId] = useState<string | null>(
        () => getFeedbackPromptSeenOrderId()
    );
    const showFeedbackPrompt =
        !!activeOrder &&
        activeOrder.status === 'completed' &&
        !activeOrder.feedbackSubmitted &&
        activeOrderId !== undefined &&
        activeOrderId !== feedbackPromptSeenId;

    const dismissFeedbackPrompt = useCallback(() => {
        if (activeOrderId) {
            setFeedbackPromptSeenOrderId(activeOrderId);
            setFeedbackPromptSeenId(activeOrderId);
        }
    }, [activeOrderId]);

    // Idempotency key for the in-progress "place order" attempt — stable across
    // retries (a timeout, a dropped connection, an impatient re-tap after an
    // error all reuse the same id, so the backend recognizes a retry instead of
    // creating a second order) but dropped once an order actually becomes active,
    // so the next genuinely new order gets its own fresh id.
    const pendingOrderIdRef = useRef<string | null>(null);
    useEffect(() => {
        if (activeOrderId) pendingOrderIdRef.current = null;
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
            const tableId = reservation?.tableId ?? activeOrder?.tableId ?? scannedTableId ?? '';
            if (!pendingOrderIdRef.current) pendingOrderIdRef.current = crypto.randomUUID();
            const payload: PlaceDineInOrderPayload = {
                id: pendingOrderIdRef.current,
                type: 'dine_in',
                tableId,
                reservationId: reservation?.id,
                // Only carries a token when tableId is actually the scanned one — the
                // reservation/active-order cases prove table access a different way
                // (a verified seated reservation), which the backend checks itself
                // rather than trusting a token here that wouldn't apply to them.
                tableToken: tableId === scannedTableId ? (scannedTableToken ?? undefined) : undefined,
                items,
            };
            placeDineInOrder.mutate(payload, { onSuccess: () => clearCart() });
        }
    }, [cart, activeOrderId, activeOrder, reservation, scannedTableId, scannedTableToken, addItemsToOrder, placeDineInOrder, clearCart]);

    const isSubmitting = placeDineInOrder.isPending || addItemsToOrder.isPending;

    return (
        <>
            <DinerMyOrderTab
                businessId={businessId}
                activeOrder={activeOrder ?? null}
                cart={cart}
                canOrder={(profile?.allowOrders && profile?.allowTableOrdering) ?? false}
                isSubmitting={isSubmitting}
                onPlaceOrder={handlePlaceOrder}
                onRemoveCartItem={removeFromCart}
                onUpdateCartItemQuantity={updateCartItemQuantity}
                onRefresh={() => refetchActiveOrder()}
                isRefreshing={isRefreshingOrder}
                lastUpdatedAt={orderUpdatedAt}
                currency={profile?.currency || 'EUR'}
            />
            {activeOrderId && (
                <GuestEmailPrompt
                    businessId={businessId}
                    orderId={activeOrderId}
                    open={showEmailPrompt}
                    onClose={dismissEmailPrompt}
                />
            )}
            {activeOrderId && (
                <FeedbackPrompt
                    businessId={businessId}
                    orderId={activeOrderId}
                    open={showFeedbackPrompt}
                    onClose={dismissFeedbackPrompt}
                />
            )}
        </>
    );
}
