import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Order } from "@/features/orders/service";
import { useOrders } from "@/features/orders/useOrders";

interface CancelOrderModalProps {
    open: boolean;
    onClose: () => void;
    businessId: string;
    order: Order | null;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({ open, onClose, businessId, order }) => {
    const { cancelOrder, isCancellingOrder } = useOrders(businessId);
    const [reason, setReason] = useState("");

    const requiresReason = order ? Number(order.totalPaid || 0) > 0 : false;

    const handleCancel = () => {
        if (!order) return;
        if (requiresReason && !reason.trim()) return;

        cancelOrder({ orderId: order.id, data: { reason: reason.trim() || undefined } }, {
            onSuccess: () => {
                setReason("");
                onClose();
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Cancel Order</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to cancel this order? This will automatically restore inventory for items already sent to the kitchen.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {requiresReason && (
                        <div className="space-y-2">
                            <Label htmlFor="reason">Cancellation Reason <span className="text-destructive">*</span></Label>
                            <Input
                                id="reason"
                                placeholder="Why is this order being cancelled?"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Since payments have been recorded, a reason is required.</p>
                        </div>
                    )}
                    {!requiresReason && (
                        <div className="space-y-2">
                            <Label htmlFor="reason">Cancellation Reason (Optional)</Label>
                            <Input
                                id="reason"
                                placeholder="Optional reason..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isCancellingOrder}>Keep Order</Button>
                    <Button variant="destructive" onClick={handleCancel} disabled={isCancellingOrder || (requiresReason && !reason.trim())}>
                        Confirm Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
