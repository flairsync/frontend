import React from "react";
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
import { format } from "date-fns";

interface OrderDetailsModalProps {
    order: Order | null;
    open: boolean;
    onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, open, onClose }) => {
    if (!order) return null;

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
                            Order #{order.id.split('-')[0]}
                            <Badge variant="outline" className={getStatusColor(order.status)}>
                                {order.status.toUpperCase()}
                            </Badge>
                        </DialogTitle>
                        <span className="text-sm text-muted-foreground">
                            {format(new Date(order.createdAt), "MMM d, h:mm a")}
                        </span>
                    </div>
                    <DialogDescription className="text-sm">
                        <div className="flex gap-4 mt-2">
                            <div>
                                <span className="text-muted-foreground font-semibold uppercase text-xs">Type</span>
                                <p className="font-medium capitalize">{order.type.replace("_", " ")}</p>
                            </div>
                            {order.tableId && (
                                <div>
                                    <span className="text-muted-foreground font-semibold uppercase text-xs">Table</span>
                                    <p className="font-medium">Table ID: {order.tableId.substring(0, 8)}</p>
                                </div>
                            )}
                            <div>
                                <span className="text-muted-foreground font-semibold uppercase text-xs">Payment</span>
                                <p className="font-medium capitalize">{order.paymentStatus}</p>
                            </div>
                        </div>
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    <h3 className="font-semibold text-lg mb-4">Items Ordered</h3>
                    <div className="space-y-4">
                        {order.items?.length > 0 ? (
                            order.items.map((item, idx) => (
                                <div key={item.id || idx} className="flex justify-between p-3 rounded-lg border bg-card">
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {item.quantity}x {item.nameSnapshot || "Unknown Item"}
                                        </span>
                                        {item.notes && (
                                            <span className="text-xs text-muted-foreground italic mt-1">Note: {item.notes}</span>
                                        )}
                                        <span className="text-xs text-muted-foreground mt-1">
                                            ${Number(item.basePriceSnapshot || item.price || 0).toFixed(2)} each
                                        </span>
                                    </div>
                                    <div className="font-bold text-right">
                                        ${Number(item.totalPrice || ((Number(item.basePriceSnapshot || item.price || 0)) * item.quantity)).toFixed(2)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground italic">No items found for this order.</p>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-6 border-t bg-muted/10">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-muted-foreground">Total</span>
                        <span className="text-2xl font-bold">${Number(order.totalAmount || 0).toFixed(2)}</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
