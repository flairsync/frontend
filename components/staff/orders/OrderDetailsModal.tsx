import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Order } from "@/features/orders/service";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Banknote, CalendarClock, Ban, CheckCircle, Undo, Pencil, Trash2 } from "lucide-react";
import { RefundPaymentModal } from "@/components/staff/orders/RefundPaymentModal";
import { ManageOrderItemModal } from "@/components/staff/orders/ManageOrderItemModal";

import { useOrders, useOrderDetails } from "@/features/orders/useOrders";

interface OrderDetailsModalProps {
    businessId: string;
    order: Order | null;
    open: boolean;
    onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ businessId, order, open, onClose }) => {
    const { data: fullOrder } = useOrderDetails(businessId, order?.id || "");
    const { voidOrderItem, isVoidingOrderItem } = useOrders(businessId);
    const displayOrder = fullOrder || order;

    const [refundPaymentId, setRefundPaymentId] = useState<string | null>(null);
    const [manageItemId, setManageItemId] = useState<string | null>(null);

    if (!displayOrder) return null;

    const handleVoidItem = (itemId: string, itemName: string) => {
        if (window.confirm(`Are you sure you want to void '${itemName}'?\nThis will remove it from the total and refund inventory if it was sent to the kitchen.`)) {
            voidOrderItem({ orderId: displayOrder.id, itemId });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open": return "bg-blue-100 text-blue-800 border-blue-200";
            case "sent": return "bg-amber-100 text-amber-800 border-amber-200";
            case "served": return "bg-green-100 text-green-800 border-green-200";
            case "closed": return "bg-gray-100 text-gray-800 border-gray-200";
            case "cancelled": return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden bg-background max-h-[90vh] flex flex-col">
                <DialogHeader className="p-6 pb-4 border-b bg-muted/10">
                    <div className="flex items-center justify-between mb-2">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            Order #{displayOrder.id.split('-')[0]}
                            <Badge variant="outline" className={getStatusColor(displayOrder.status)}>
                                {displayOrder.status.toUpperCase()}
                            </Badge>
                        </DialogTitle>
                        <span className="text-sm text-muted-foreground">
                            {format(new Date(displayOrder.createdAt), "MMM d, h:mm a")}
                        </span>
                    </div>
                    <DialogDescription className="text-sm">
                        <div className="flex gap-4 mt-2">
                            <div>
                                <span className="text-muted-foreground font-semibold uppercase text-xs">Type</span>
                                <p className="font-medium capitalize">{displayOrder.type.replace("_", " ")}</p>
                            </div>
                            {displayOrder.table && (
                                <div>
                                    <span className="text-muted-foreground font-semibold uppercase text-xs">Table</span>
                                    <p className="font-medium">{displayOrder.table.name}</p>
                                </div>
                            )}
                            <div>
                                <span className="text-muted-foreground font-semibold uppercase text-xs">Payment</span>
                                <p className="font-medium capitalize">{(displayOrder.paymentStatus || "pending").replace(/_/g, " ")}</p>
                            </div>
                            {displayOrder.cancellationReason && (
                                <div>
                                    <span className="text-muted-foreground font-semibold uppercase text-xs text-red-600">Cancel Reason</span>
                                    <p className="font-medium text-red-700 max-w-[200px] truncate" title={displayOrder.cancellationReason}>
                                        {displayOrder.cancellationReason}
                                    </p>
                                </div>
                            )}
                            {displayOrder.closingNotes && (
                                <div>
                                    <span className="text-muted-foreground font-semibold uppercase text-xs">Closing Notes</span>
                                    <p className="font-medium italic max-w-[200px] truncate" title={displayOrder.closingNotes}>
                                        {displayOrder.closingNotes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    <Tabs defaultValue="items" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="items">Order Items</TabsTrigger>
                            <TabsTrigger value="payments">Payments</TabsTrigger>
                        </TabsList>

                        <TabsContent value="items" className="mt-0">
                            <div className="space-y-4">
                                {displayOrder.items?.length > 0 ? (
                                    displayOrder.items.map((item, idx) => {
                                        const basePrice = Number(item.basePriceSnapshot || item.price || 0);
                                        const modifiersTotal = (item.selectedModifiers || []).reduce((sum: number, mod: any) => sum + Number(mod.price || 0), 0);
                                        const unitPrice = basePrice + modifiersTotal;
                                        const totalItemPrice = unitPrice * item.quantity;

                                        return (
                                            <div key={item.id || idx} className={`flex justify-between p-3 rounded-lg border bg-card ${item.status === 'voided' ? 'opacity-50' : ''}`}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium flex items-center gap-2">
                                                        {item.quantity}x {item.nameSnapshot || "Unknown Item"}
                                                        {item.status === 'voided' && (
                                                            <Badge variant="destructive" className="h-4 text-[10px] px-1.5">Voided</Badge>
                                                        )}
                                                    </span>
                                                    {item.notes && (
                                                        <span className="text-xs text-muted-foreground italic mt-1">Note: {item.notes}</span>
                                                    )}
                                                    {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            <span className="font-semibold">Modifiers: </span>
                                                            {item.selectedModifiers.map(m => m.name).join(", ")}
                                                        </div>
                                                    )}
                                                    <span className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                                        ${unitPrice.toFixed(2)} each {modifiersTotal > 0 ? `(Base: $${basePrice.toFixed(2)} + Mods: $${modifiersTotal.toFixed(2)})` : ""}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="font-bold text-right">
                                                        {item.status === 'voided' ? <span className="line-through text-muted-foreground">${totalItemPrice.toFixed(2)}</span> : `$${totalItemPrice.toFixed(2)}`}
                                                    </div>
                                                    {item.status !== 'voided' && (displayOrder.status === 'open' || displayOrder.status === 'sent' || displayOrder.status === 'served') && (
                                                        <div className="flex items-center gap-1 mt-auto">
                                                            {(!item.status || item.status === 'pending') && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                                    onClick={() => setManageItemId(item.id)}
                                                                    title="Edit Item"
                                                                >
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                onClick={() => handleVoidItem(item.id, item.nameSnapshot || "Item")}
                                                                disabled={isVoidingOrderItem}
                                                                title="Void Item"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-muted-foreground italic">No items found for this order.</p>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="payments" className="mt-0">
                            <div className="space-y-4">
                                {displayOrder.payments && displayOrder.payments.length > 0 ? (
                                    displayOrder.payments.map((payment, idx) => (
                                        <div key={payment.id || idx} className="flex justify-between items-center p-4 rounded-lg border bg-card">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-muted rounded-full">
                                                    {payment.method === "card" || payment.method === "online" ? (
                                                        <CreditCard className="w-5 h-5 text-muted-foreground" />
                                                    ) : (
                                                        <Banknote className="w-5 h-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium capitalize text-sm">{payment.method} Payment</span>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                        <CalendarClock className="w-3 h-3" />
                                                        {format(new Date(payment.createdAt), "MMM d, h:mm a")}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="font-bold text-lg">
                                                    ${Number(payment.amount).toFixed(2)}
                                                    {payment.tipAmount && payment.tipAmount > 0 && (
                                                        <span className="text-xs text-muted-foreground ml-1 font-normal">(+${Number(payment.tipAmount).toFixed(2)} Tip)</span>
                                                    )}
                                                </span>
                                                <div className="flex gap-2 items-center">
                                                    {payment.status === "success" || payment.status === "paid" ? (
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] h-4">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Successful
                                                        </Badge>
                                                    ) : payment.status === "failed" ? (
                                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] h-4">
                                                            <Ban className="w-3 h-3 mr-1" />
                                                            Failed
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="capitalize text-[10px] h-4">
                                                            {payment.status}
                                                        </Badge>
                                                    )}

                                                    {(payment.status === "success" || payment.status === "paid") && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={(e: React.MouseEvent) => {
                                                                e.stopPropagation();
                                                                setRefundPaymentId(payment.id);
                                                            }}
                                                            title="Refund Payment"
                                                        >
                                                            <Undo className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center p-8 border border-dashed rounded-lg bg-muted/20">
                                        <Banknote className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                                        <p className="text-muted-foreground font-medium">No payments recorded</p>
                                        <p className="text-xs text-muted-foreground mt-1">Payments made for this order will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </ScrollArea>

                <div className="p-6 border-t bg-muted/10 grid grid-cols-2">
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-muted-foreground uppercase">Paid Details</span>
                        <div className="flex gap-4 mt-1">
                            <div><span className="text-xs text-muted-foreground mr-1">Paid:</span><span className="font-medium text-sm">${Number(displayOrder.totalPaid || 0).toFixed(2)}</span></div>
                            {displayOrder.totalTip && displayOrder.totalTip > 0 ? (
                                <div><span className="text-xs text-muted-foreground mr-1">Tip:</span><span className="font-medium text-sm text-green-600">${Number(displayOrder.totalTip).toFixed(2)}</span></div>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex flex-col items-end justify-center">
                        <span className="text-lg font-bold text-muted-foreground">Total Options</span>
                        <span className="text-2xl font-bold">${Number(displayOrder.totalAmount || 0).toFixed(2)}</span>
                    </div>
                </div>
            </DialogContent>

            {/* Nested Refund Modal */}
            <RefundPaymentModal
                open={!!refundPaymentId}
                onClose={() => setRefundPaymentId(null)}
                businessId={businessId}
                order={displayOrder}
                paymentId={refundPaymentId}
            />

            {/* Nested Manage Item Modal */}
            <ManageOrderItemModal
                open={!!manageItemId}
                onClose={() => setManageItemId(null)}
                businessId={businessId}
                orderId={displayOrder.id}
                item={displayOrder.items?.find((i: any) => i.id === manageItemId) || null}
            />
        </Dialog>
    );
};
