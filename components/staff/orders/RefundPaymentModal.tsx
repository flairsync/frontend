import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Order } from "@/features/orders/service";
import { useOrders } from "@/features/orders/useOrders";

interface RefundPaymentModalProps {
    open: boolean;
    onClose: () => void;
    businessId: string;
    order: Order | null;
    paymentId: string | null;
}

export const RefundPaymentModal: React.FC<RefundPaymentModalProps> = ({ open, onClose, businessId, order, paymentId }) => {
    const { refundPayment, isRefundingPayment } = useOrders(businessId);
    const [reason, setReason] = useState("");

    const handleRefund = () => {
        if (!order || !paymentId) return;

        refundPayment({
            orderId: order.id,
            paymentId,
            data: { reason: reason.trim() || undefined }
        }, {
            onSuccess: () => {
                setReason("");
                onClose();
            }
        });
    };

    const targetPayment = order?.payments?.find(p => p.id === paymentId);

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-destructive">Refund Payment</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to refund this <strong className="capitalize">{targetPayment?.method}</strong> payment?
                        This action will deduct <strong>${Number(targetPayment?.amount || 0).toFixed(2)}</strong> from the order's total paid amount and recalculate its status.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="refundReason">Refund Reason (Optional)</Label>
                    <Input
                        id="refundReason"
                        placeholder="Why is this payment being refunded?"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isRefundingPayment}>Cancel</Button>
                    <Button variant="destructive" onClick={handleRefund} disabled={isRefundingPayment || !paymentId}>
                        Confirm Refund
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
