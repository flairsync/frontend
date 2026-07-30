import React from 'react';
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
import { useMyMarketplaceOrders, useCancelMarketplaceOrder } from '@/features/marketplace/useMarketplace';

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

export function MyOrdersTable({ businessId }: { businessId: string }) {
    const { data, isLoading } = useMyMarketplaceOrders(businessId);
    const cancel = useCancelMarketplaceOrder(businessId);
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
                <p className="text-muted-foreground text-sm">This business hasn't ordered anything from the marketplace yet.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-white/5 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-secondary/10 hover:bg-secondary/10">
                        <TableHead>Item</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order: any) => (
                        <TableRow key={order.id}>
                            <TableCell className="text-sm font-medium">{order.itemNameSnapshot}</TableCell>
                            <TableCell className="text-sm">{order.quantity}</TableCell>
                            <TableCell className="text-sm">{formatPrice(order.totalAmount, order.currencySnapshot)}</TableCell>
                            <TableCell>
                                <Badge variant={STATUS_VARIANT[order.status] ?? 'secondary'} className="text-[10px]">
                                    {order.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {order.status === 'PENDING' && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-destructive hover:text-destructive"
                                        disabled={cancel.isPending}
                                        onClick={() => cancel.mutate(order.id)}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
