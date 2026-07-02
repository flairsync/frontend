
import React, { useEffect, useState } from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, ClipboardList, Star, X, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDiscoveryProfile } from '@/features/discovery/useDiscovery';
import {
    useBusinessSeatedReservation,
    useActiveDineInOrder,
    ACTIVE_ORDER_STATUSES,
} from '@/features/diner-mode/useDinerMode';
import { useDinerModeStore } from '@/features/diner-mode/DinerModeStore';
import DinerModeHeader from '@/components/diner-mode/DinerModeHeader';
import DinerCallWaiterButton from '@/components/diner-mode/DinerCallWaiterButton';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getTableCookie } from '@/utils/cookies';

const DinerLayout = ({ children }: { children: React.ReactNode }) => {
    const pageContext = usePageContext();
    const businessId = pageContext.routeParams?.businessId as string;
    const currentPath = pageContext.urlPathname;

    const { data: profile, isLoading } = useDiscoveryProfile(businessId);
    const { data: reservation } = useBusinessSeatedReservation(businessId);
    const { data: activeOrderSummary } = useActiveDineInOrder(businessId);
    const { cart, orderReadyId, setOrderReadyId, scannedTableId, setScannedTableId } = useDinerModeStore();

    const [entryVisible, setEntryVisible] = useState(true);
    const [exitVisible, setExitVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setEntryVisible(false), 3000);
        return () => clearTimeout(t);
    }, []);

    // Hydrate from the cookie dropped by /tbl/{businessId}/{tableId} — only trust it
    // for the business it was actually scanned for.
    useEffect(() => {
        const scanned = getTableCookie();
        setScannedTableId(scanned?.businessId === businessId ? scanned.tableId : null);
    }, [businessId, setScannedTableId]);

    const hasSeatedReservation = !!reservation;
    const hasActiveOrder =
        !!activeOrderSummary &&
        ACTIVE_ORDER_STATUSES.includes(activeOrderSummary.status as any);
    const hasScannedTable = !!scannedTableId;

    useEffect(() => {
        if (!isLoading && !hasSeatedReservation && !hasActiveOrder && !hasScannedTable && cart.length === 0) {
            setExitVisible(true);
        }
    }, [hasSeatedReservation, hasActiveOrder, hasScannedTable, isLoading, cart.length]);

    // Auto-dismiss the order-ready banner when the order moves to completed
    useEffect(() => {
        if (
            orderReadyId &&
            activeOrderSummary?.id === orderReadyId &&
            activeOrderSummary?.status === 'completed'
        ) {
            setOrderReadyId(null);
        }
    }, [activeOrderSummary?.status, activeOrderSummary?.id, orderReadyId, setOrderReadyId]);

    const showOrderReadyBanner =
        !!orderReadyId && activeOrderSummary?.id === orderReadyId;

    useEffect(() => {
        if (exitVisible) {
            const t = setTimeout(() => { window.location.href = '/'; }, 3500);
            return () => clearTimeout(t);
        }
    }, [exitVisible]);

    const orderBadgeCount =
        (activeOrderSummary?.items?.length ?? 0) + cart.reduce((s, i) => s + i.quantity, 0);

    const isMenuActive =
        currentPath === `/diner/${businessId}` ||
        currentPath === `/diner/${businessId}/menu`;
    const isOrderActive = currentPath === `/diner/${businessId}/order`;

    if (isLoading) {
        return (
            <div className="flex flex-col h-dvh bg-background">
                <div className="h-14 border-b flex items-center px-4 gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex-1 p-4 space-y-4">
                    <Skeleton className="h-8 w-48 rounded-full" />
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="flex flex-col h-dvh bg-background overflow-hidden">
            <AnimatePresence>
                {entryVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none"
                    >
                        <div className="mt-4 bg-primary text-primary-foreground rounded-full px-5 py-2 text-sm font-semibold shadow-xl">
                            You&apos;re seated at {profile.name}
                        </div>
                    </motion.div>
                )}

                {exitVisible && (
                    <motion.div
                        key="exit"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm px-6"
                    >
                        <div className="bg-card border rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                <Star className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Thanks for dining with us!</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Your session has ended. We hope you enjoyed your meal!
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full rounded-full"
                                onClick={() => { window.location.href = `/business/${businessId}#reviews`; }}
                            >
                                Leave a Review
                            </Button>
                            <p className="text-xs text-muted-foreground">Redirecting you home…</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showOrderReadyBanner && (
                    <motion.div
                        key="order-ready"
                        initial={{ opacity: 0, y: -40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ duration: 0.3 }}
                        className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-3 pointer-events-none"
                    >
                        <div className="pointer-events-auto flex items-center gap-3 bg-emerald-500 text-white rounded-2xl px-5 py-3 shadow-2xl max-w-sm w-full">
                            <PartyPopper className="w-5 h-5 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm leading-tight">Your order is ready!</p>
                                <p className="text-xs opacity-90">Your order is ready to be served. Enjoy your meal!</p>
                            </div>
                            <button
                                onClick={() => setOrderReadyId(null)}
                                className="shrink-0 opacity-80 hover:opacity-100 transition-opacity p-1"
                                aria-label="Dismiss"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <DinerModeHeader
                profile={profile}
                tableId={reservation?.tableId ?? activeOrderSummary?.tableId ?? scannedTableId ?? null}
                onExit={() => { window.location.href = '/'; }}
            />

            <main className="flex-1 overflow-hidden flex flex-col">
                {children}
            </main>

            <nav className="shrink-0 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <div className="flex items-center h-16">
                    <a
                        href={`/diner/${businessId}/menu`}
                        className={cn(
                            "flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors",
                            isMenuActive
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <UtensilsCrossed className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Menu</span>
                    </a>

                    <a
                        href={`/diner/${businessId}/order`}
                        className={cn(
                            "flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors relative",
                            isOrderActive
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <div className="relative">
                            <ClipboardList className="w-5 h-5" />
                            {orderBadgeCount > 0 && (
                                <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground rounded-full min-w-[16px] h-4 text-[10px] font-bold flex items-center justify-center px-0.5 leading-none">
                                    {orderBadgeCount > 99 ? '99+' : orderBadgeCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium">My Order</span>
                    </a>

                    <div className="flex-1 flex items-center justify-center px-3">
                        {(hasSeatedReservation || hasActiveOrder || hasScannedTable) && (
                            <DinerCallWaiterButton
                                businessId={businessId}
                                tableId={reservation?.tableId ?? activeOrderSummary?.tableId ?? scannedTableId ?? undefined}
                                reservationId={reservation?.id}
                            />
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default DinerLayout;
