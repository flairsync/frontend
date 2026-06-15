import React from 'react';
import {
    Loader2,
    CheckCircle2,
    ChefHat,
    PartyPopper,
    XCircle,
    ShoppingCart,
    Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { DinerOrder } from '@/features/diner-mode/useDinerMode';
import { CartItem } from '@/features/diner-mode/DinerModeStore';

interface DinerMyOrderTabProps {
    businessId: string;
    activeOrder: DinerOrder | null;
    cart: CartItem[];
    allowOrders: boolean;
    isSubmitting: boolean;
    onPlaceOrder: () => void;
    onRemoveCartItem: (index: number) => void;
}

const STATUS_CONFIG: Record<
    string,
    { label: string; icon: React.ReactNode; color: string; pulse?: boolean }
> = {
    created: {
        label: 'Order received',
        icon: <Loader2 className="w-5 h-5 animate-spin" />,
        color: 'text-blue-500',
    },
    accepted: {
        label: 'Order confirmed',
        icon: <CheckCircle2 className="w-5 h-5" />,
        color: 'text-green-500',
    },
    preparing: {
        label: 'Being prepared',
        icon: <ChefHat className="w-5 h-5" />,
        color: 'text-orange-500',
    },
    ready: {
        label: 'Ready to serve!',
        icon: <PartyPopper className="w-5 h-5" />,
        color: 'text-emerald-500',
        pulse: true,
    },
    completed: {
        label: 'Enjoy your meal!',
        icon: <CheckCircle2 className="w-5 h-5" />,
        color: 'text-muted-foreground',
    },
    canceled: {
        label: 'Order cancelled',
        icon: <XCircle className="w-5 h-5" />,
        color: 'text-destructive',
    },
    rejected: {
        label: 'Order cancelled',
        icon: <XCircle className="w-5 h-5" />,
        color: 'text-destructive',
    },
};

const ORDER_EDITABLE_STATUSES = ['created', 'accepted'];

function getItemName(item: DinerOrder['items'][number]): string {
    return item.nameSnapshot || item.name || 'Item';
}

function getItemTotal(item: DinerOrder['items'][number]): number {
    const raw = item.totalPrice ?? item.price ?? item.unitPrice ?? 0;
    return Number(raw);
}

export default function DinerMyOrderTab({
    businessId,
    activeOrder,
    cart,
    allowOrders,
    isSubmitting,
    onPlaceOrder,
    onRemoveCartItem,
}: DinerMyOrderTabProps) {
    const menuHref = `/diner/${businessId}/menu`;
    const statusConfig = activeOrder ? STATUS_CONFIG[activeOrder.status] : null;
    const isEditable = activeOrder && ORDER_EDITABLE_STATUSES.includes(activeOrder.status);

    if (!activeOrder && cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full px-8 pb-24 text-center">
                <ShoppingCart className="w-12 h-12 text-muted-foreground/40 mb-3" />
                <p className="font-semibold text-base">Your order is empty</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Browse the menu and add items to get started.
                </p>
                {allowOrders && (
                    <Button
                        variant="outline"
                        className="mt-4 rounded-full"
                        onClick={() => { window.location.href = menuHref; }}
                    >
                        Browse Menu
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto pb-32 px-4 py-4 space-y-5">
            {activeOrder && statusConfig && (
                <div
                    className={cn(
                        "rounded-2xl border p-4 flex items-center gap-3",
                        statusConfig.pulse && "ring-2 ring-emerald-400/60 animate-pulse"
                    )}
                >
                    <span className={statusConfig.color}>{statusConfig.icon}</span>
                    <div>
                        <p className="font-semibold text-sm">{statusConfig.label}</p>
                        {activeOrder.paymentStatus === 'unpaid' && (
                            <p className="text-xs text-muted-foreground">Payment pending</p>
                        )}
                    </div>
                    <span className="ml-auto text-sm font-bold">
                        ${Number(activeOrder.totalAmount).toFixed(2)}
                    </span>
                </div>
            )}

            {activeOrder && (
                <div className="rounded-2xl border bg-card overflow-hidden">
                    <div className="px-4 py-3 border-b flex items-center justify-between">
                        <p className="text-sm font-semibold">Your order</p>
                        {isEditable && allowOrders && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7 rounded-full gap-1"
                                onClick={() => { window.location.href = menuHref; }}
                            >
                                <Plus className="w-3 h-3" />
                                Add more
                            </Button>
                        )}
                    </div>
                    <div className="divide-y">
                        {activeOrder.items.map((item) => (
                            <div key={item.id} className="px-4 py-3 flex justify-between items-start gap-2">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">
                                        {item.quantity}× {getItemName(item)}
                                    </p>
                                    {item.variantName && (
                                        <p className="text-xs text-muted-foreground">{item.variantName}</p>
                                    )}
                                    {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            + {item.selectedModifiers.map((m) => m.name).join(', ')}
                                        </p>
                                    )}
                                    {item.notes && (
                                        <p className="text-xs text-muted-foreground italic">{item.notes}</p>
                                    )}
                                </div>
                                <span className="text-sm font-medium shrink-0">
                                    ${getItemTotal(item).toFixed(2)}
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
                            {activeOrder ? 'Items to add' : 'New order'}
                        </p>
                        <Badge variant="secondary">{cart.reduce((s, i) => s + i.quantity, 0)} items</Badge>
                    </div>
                    <div className="divide-y">
                        {cart.map((item, index) => (
                            <div key={index} className="px-4 py-3 flex justify-between items-start gap-2">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">
                                        {item.quantity}× {item.name}
                                    </p>
                                    {item.variantName && (
                                        <p className="text-xs text-muted-foreground">{item.variantName}</p>
                                    )}
                                    {item.modifiers.length > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            + {item.modifiers.map((m) => m.name).join(', ')}
                                        </p>
                                    )}
                                    {item.notes && (
                                        <p className="text-xs text-muted-foreground italic">{item.notes}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-sm font-medium">${item.lineTotal.toFixed(2)}</span>
                                    <button
                                        onClick={() => onRemoveCartItem(index)}
                                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                    >
                                        <XCircle className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Separator />

                    <div className="px-4 py-3 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Subtotal</span>
                        <span className="text-sm font-bold">
                            ${cart.reduce((s, i) => s + i.lineTotal, 0).toFixed(2)}
                        </span>
                    </div>

                    <div className="px-4 pb-4">
                        <Button
                            className="w-full rounded-full font-semibold"
                            onClick={onPlaceOrder}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Placing order…
                                </>
                            ) : activeOrder ? (
                                <>
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add to existing order
                                </>
                            ) : (
                                'Place order'
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
