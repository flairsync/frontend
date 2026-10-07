import React, { useEffect, useState } from 'react';
import {
    Loader2,
    CheckCircle2,
    ChefHat,
    XCircle,
    ShoppingCart,
    Plus,
    Minus,
    RefreshCw,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { clientOnly } from 'vike-react/clientOnly';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { DinerOrder } from '@/features/diner-mode/useDinerMode';
import { CartItem } from '@/features/diner-mode/DinerModeStore';
import { formatCurrency } from '@/lib/formatCurrency';
import celebratePopAnimation from '@/components/tutorials/animations/celebrate-pop.json';

const LottiePlayer = clientOnly(() => import('@/components/shared/LottiePlayer'));

interface DinerMyOrderTabProps {
    businessId: string;
    activeOrder: DinerOrder | null;
    cart: CartItem[];
    canOrder: boolean;
    isSubmitting: boolean;
    onPlaceOrder: () => void;
    onRemoveCartItem: (index: number) => void;
    onUpdateCartItemQuantity: (index: number, delta: number) => void;
    onRefresh: () => void;
    isRefreshing: boolean;
    lastUpdatedAt: number;
    currency: string;
}

// Ticks once a second so the "updated Xs ago" text stays live without polling.
function useElapsedSeconds(since: number): number {
    const [, tick] = useState(0);
    useEffect(() => {
        if (!since) return;
        const id = setInterval(() => tick((n) => n + 1), 1000);
        return () => clearInterval(id);
    }, [since]);
    return since ? Math.max(0, Math.floor((Date.now() - since) / 1000)) : 0;
}

function formatUpdatedAgo(t: (key: string, opts?: any) => string, seconds: number): string {
    if (seconds < 5) return t('my_order_tab.updated_just_now');
    if (seconds < 60) return t('my_order_tab.updated_seconds_ago', { count: seconds });
    return t('my_order_tab.updated_minutes_ago', { count: Math.floor(seconds / 60) });
}

function getStatusConfig(
    t: (key: string) => string
): Record<string, { label: string; description?: string; icon: React.ReactNode; color: string; pulse?: boolean }> {
    return {
        created: {
            label: t('my_order_tab.status.created'),
            description: t('my_order_tab.status_description.created'),
            icon: <Loader2 className="w-5 h-5 animate-spin" />,
            color: 'text-blue-500',
        },
        accepted: {
            label: t('my_order_tab.status.accepted'),
            description: t('my_order_tab.status_description.accepted'),
            icon: <CheckCircle2 className="w-5 h-5" />,
            color: 'text-green-500',
        },
        preparing: {
            label: t('my_order_tab.status.preparing'),
            description: t('my_order_tab.status_description.preparing'),
            icon: <ChefHat className="w-5 h-5" />,
            color: 'text-orange-500',
        },
        ready: {
            label: t('my_order_tab.status.ready'),
            icon: (
                <span className="w-6 h-6 -m-0.5 inline-block">
                    <LottiePlayer animationData={celebratePopAnimation} className="w-full h-full" />
                </span>
            ),
            color: 'text-emerald-500',
            pulse: true,
        },
        completed: {
            label: t('my_order_tab.status.completed'),
            icon: <CheckCircle2 className="w-5 h-5" />,
            color: 'text-muted-foreground',
        },
        canceled: {
            label: t('my_order_tab.status.canceled'),
            icon: <XCircle className="w-5 h-5" />,
            color: 'text-destructive',
        },
        rejected: {
            label: t('my_order_tab.status.rejected'),
            icon: <XCircle className="w-5 h-5" />,
            color: 'text-destructive',
        },
    };
}

const ORDER_EDITABLE_STATUSES = ['created', 'accepted'];

function getItemName(item: DinerOrder['items'][number], fallback: string): string {
    return item.nameSnapshot || item.name || fallback;
}

function getItemTotal(item: DinerOrder['items'][number]): number {
    const raw = item.totalPrice ?? item.price ?? item.unitPrice ?? 0;
    return Number(raw);
}

export default function DinerMyOrderTab({
    businessId,
    activeOrder,
    cart,
    canOrder,
    isSubmitting,
    onPlaceOrder,
    onRemoveCartItem,
    onUpdateCartItemQuantity,
    onRefresh,
    isRefreshing,
    lastUpdatedAt,
    currency,
}: DinerMyOrderTabProps) {
    const { t } = useTranslation('diner');
    const menuHref = `/diner/${businessId}/menu`;
    const statusConfig = activeOrder ? getStatusConfig(t)[activeOrder.status] : null;
    const isEditable = activeOrder && ORDER_EDITABLE_STATUSES.includes(activeOrder.status);
    const elapsedSeconds = useElapsedSeconds(lastUpdatedAt);

    if (!activeOrder && cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full px-8 pb-24 text-center">
                <ShoppingCart className="w-12 h-12 text-muted-foreground/40 mb-3" />
                <p className="font-semibold text-base">{t('my_order_tab.empty_title')}</p>
                <p className="text-sm text-muted-foreground mt-1">
                    {t('my_order_tab.empty_description')}
                </p>
                {canOrder ? (
                    <Button
                        variant="outline"
                        className="mt-4 rounded-full"
                        onClick={() => { window.location.href = menuHref; }}
                    >
                        {t('my_order_tab.browse_menu')}
                    </Button>
                ) : (
                    <p className="text-xs text-muted-foreground mt-4 max-w-xs">
                        {t('menu_tab.ordering_unavailable_description')}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto pb-32 px-4 py-4 space-y-5">
            {activeOrder && (
                <div className="flex items-center justify-between px-1">
                    <p className="text-xs text-muted-foreground">
                        {formatUpdatedAgo(t, elapsedSeconds)}
                    </p>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 rounded-full gap-1 -mr-2"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={cn('w-3 h-3', isRefreshing && 'animate-spin')} />
                        {t('my_order_tab.refresh')}
                    </Button>
                </div>
            )}

            {activeOrder && statusConfig && (
                <div
                    className={cn(
                        "rounded-2xl border p-4 flex items-center gap-3",
                        statusConfig.pulse && "ring-2 ring-emerald-400/60 animate-pulse"
                    )}
                >
                    <span className={statusConfig.color}>{statusConfig.icon}</span>
                    <div>
                        <p className="font-semibold text-base">{statusConfig.label}</p>
                        {statusConfig.description && (
                            <p className="text-sm text-muted-foreground">{statusConfig.description}</p>
                        )}
                        {activeOrder.status === 'completed' && activeOrder.paymentStatus === 'unpaid' && (
                            <p className="text-sm text-muted-foreground">{t('my_order_tab.payment_pending')}</p>
                        )}
                    </div>
                    <span className="ml-auto text-base font-bold">
                        {formatCurrency(Number(activeOrder.totalAmount), currency)}
                    </span>
                </div>
            )}

            {activeOrder && (
                <div className="rounded-2xl border bg-card overflow-hidden">
                    <div className="px-4 py-3 border-b flex items-center justify-between">
                        <p className="text-base font-semibold">{t('my_order_tab.your_order_heading')}</p>
                        {isEditable && canOrder && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7 rounded-full gap-1"
                                onClick={() => { window.location.href = menuHref; }}
                            >
                                <Plus className="w-3 h-3" />
                                {t('my_order_tab.add_more')}
                            </Button>
                        )}
                    </div>
                    <div className="divide-y">
                        {activeOrder.items.map((item) => (
                            <div key={item.id} className="px-4 py-3 flex justify-between items-start gap-2">
                                <div className="min-w-0 flex-1">
                                    <p className="text-base font-medium">
                                        {item.quantity}× {getItemName(item, t('my_order_tab.unnamed_item'))}
                                    </p>
                                    {item.variantName && (
                                        <p className="text-sm text-muted-foreground">{item.variantName}</p>
                                    )}
                                    {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            + {item.selectedModifiers.map((m) => m.name).join(', ')}
                                        </p>
                                    )}
                                    {item.notes && (
                                        <p className="text-sm text-muted-foreground italic">{item.notes}</p>
                                    )}
                                </div>
                                <span className="text-base font-medium shrink-0">
                                    {formatCurrency(getItemTotal(item), currency)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {cart.length > 0 && (
                <div className="rounded-2xl border bg-card overflow-hidden">
                    <div className="px-4 py-3 border-b flex items-center justify-between">
                        <p className="text-sm font-semibold">
                            {activeOrder ? t('my_order_tab.items_to_add_heading') : t('my_order_tab.new_order_heading')}
                        </p>
                        <Badge variant="secondary">
                            {t('my_order_tab.items_count', { count: cart.reduce((s, i) => s + i.quantity, 0) })}
                        </Badge>
                    </div>
                    <div className="divide-y">
                        {cart.map((item, index) => (
                            <div key={index} className="px-4 py-3 flex justify-between items-start gap-2">
                                <div className="min-w-0 flex-1">
                                    <p className="text-base font-medium">{item.name}</p>
                                    {item.variantName && (
                                        <p className="text-sm text-muted-foreground">{item.variantName}</p>
                                    )}
                                    {item.modifiers.length > 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            + {item.modifiers.map((m) => m.name).join(', ')}
                                        </p>
                                    )}
                                    {item.notes && (
                                        <p className="text-sm text-muted-foreground italic">{item.notes}</p>
                                    )}
                                    <div className="flex items-center gap-1.5 mt-2 border rounded-full w-fit px-1">
                                        <button
                                            onClick={() => onUpdateCartItemQuantity(index, -1)}
                                            disabled={item.quantity <= 1}
                                            className="w-10 h-10 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => onUpdateCartItemQuantity(index, 1)}
                                            className="w-10 h-10 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <span className="text-base font-medium">{formatCurrency(item.lineTotal, currency)}</span>
                                    <button
                                        onClick={() => onRemoveCartItem(index)}
                                        className="text-muted-foreground hover:text-destructive transition-colors p-2 -m-2"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Separator />

                    <div className="px-4 py-3 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('my_order_tab.subtotal')}</span>
                        <span className="text-sm font-bold">
                            {formatCurrency(cart.reduce((s, i) => s + i.lineTotal, 0), currency)}
                        </span>
                    </div>

                    <div className="px-4 pb-4">
                        <Button
                            className="w-full rounded-full h-12 text-base font-semibold"
                            onClick={onPlaceOrder}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    {t('my_order_tab.placing_order')}
                                </>
                            ) : activeOrder ? (
                                <>
                                    <Plus className="w-4 h-4 mr-1" />
                                    {t('my_order_tab.add_to_existing_order')}
                                </>
                            ) : (
                                t('my_order_tab.place_order')
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
