import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, PackageOpen } from 'lucide-react';
import { useIncomingMarketplaceOrders, useResolveIncomingMarketplaceOrder } from '@/features/marketplace/useMarketplace';

function formatPrice(price: number, currency: string) {
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
    } catch {
        return `${currency} ${price.toFixed(2)}`;
    }
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
    PENDING: 'secondary',
    CONFIRMED: 'default',
    FULFILLED: 'default',
    CANCELLED: 'destructive',
};

function getStatusLabel(t: TFunction, status: string): string {
    switch (status) {
        case 'PENDING': return t('marketplace_management.order_status.pending');
        case 'CONFIRMED': return t('marketplace_management.order_status.confirmed');
        case 'FULFILLED': return t('marketplace_management.order_status.fulfilled');
        case 'CANCELLED': return t('marketplace_management.order_status.cancelled');
        default: return status;
    }
}

export function IncomingOrdersTable({ businessId }: { businessId: string }) {
    const { t } = useTranslation('management');
    const { data, isLoading } = useIncomingMarketplaceOrders(businessId);
    const resolve = useResolveIncomingMarketplaceOrder(businessId);
    const orders = data?.data ?? [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <PackageOpen className="w-10 h-10 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground text-sm">{t('marketplace_management.incoming_orders.empty')}</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-white/5 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-secondary/10 hover:bg-secondary/10">
                        <TableHead>{t('marketplace_management.incoming_orders.col_item')}</TableHead>
                        <TableHead>{t('marketplace_management.incoming_orders.col_buyer')}</TableHead>
                        <TableHead>{t('marketplace_management.incoming_orders.col_qty')}</TableHead>
                        <TableHead>{t('marketplace_management.incoming_orders.col_total')}</TableHead>
                        <TableHead>{t('marketplace_management.incoming_orders.col_ship_to')}</TableHead>
                        <TableHead>{t('marketplace_management.col_status')}</TableHead>
                        <TableHead className="text-right">{t('marketplace_management.col_actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order: any) => (
                        <TableRow key={order.id}>
                            <TableCell className="text-sm font-medium">{order.itemNameSnapshot}</TableCell>
                            <TableCell className="text-sm">{order.buyerBusiness?.name ?? '—'}</TableCell>
                            <TableCell className="text-sm">{order.quantity}</TableCell>
                            <TableCell className="text-sm">{formatPrice(order.totalAmount, order.currencySnapshot)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                                {order.shippingFullName} — {order.shippingAddress}, {order.shippingCityStateZip}
                            </TableCell>
                            <TableCell>
                                <Badge variant={STATUS_VARIANT[order.status] ?? 'secondary'} className="text-[10px]">
                                    {getStatusLabel(t, order.status)}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                    {order.status === 'PENDING' && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={resolve.isPending}
                                                onClick={() => resolve.mutate({ id: order.id, dto: { status: 'CONFIRMED' } })}
                                            >
                                                {t('marketplace_management.incoming_orders.confirm')}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-destructive hover:text-destructive"
                                                disabled={resolve.isPending}
                                                onClick={() => resolve.mutate({ id: order.id, dto: { status: 'CANCELLED' } })}
                                            >
                                                {t('marketplace_management.incoming_orders.cancel')}
                                            </Button>
                                        </>
                                    )}
                                    {order.status === 'CONFIRMED' && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={resolve.isPending}
                                                onClick={() => resolve.mutate({ id: order.id, dto: { status: 'FULFILLED' } })}
                                            >
                                                {t('marketplace_management.incoming_orders.mark_fulfilled')}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-destructive hover:text-destructive"
                                                disabled={resolve.isPending}
                                                onClick={() => resolve.mutate({ id: order.id, dto: { status: 'CANCELLED' } })}
                                            >
                                                {t('marketplace_management.incoming_orders.cancel')}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
