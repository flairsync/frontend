import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Order } from "@/features/orders/service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrders } from "@/features/orders/useOrders";

interface PaymentModalProps {
    businessId: string;
    order: Order | null;
    open: boolean;
    onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ businessId, order, open, onClose }) => {
    const { createPayment, isCreatingPayment } = useOrders(businessId);

    const [amount, setAmount] = useState<string>("");
    const [method, setMethod] = useState<"cash" | "card" | "online" | "other">("cash");

    const totalAmount = Number(order?.totalAmount || 0);
    const totalPaid = Number(order?.totalPaid || 0);
    const remainingBalance = Math.max(totalAmount - totalPaid, 0);

    useEffect(() => {
        if (open && order) {
            setAmount(remainingBalance.toFixed(2));
            setMethod("cash");
        }
    }, [open, order, remainingBalance]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!order) return;

        const paymentAmount = Number(amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            return;
        }

        try {
            await createPayment({
                orderId: order.id,
                data: {
                    amount: paymentAmount,
                    method
                }
            });
            onClose();
        } catch (error) {
            // Error handling is managed by the mutation's onError toast
        }
    };

    if (!order) return null;

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Payment - Order #{order.id.substring(0, 8)}</DialogTitle>
                        <DialogDescription>
                            Record a payment for this order. It currently has a remaining balance of <strong>${remainingBalance.toFixed(2)}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Order Total</span>
                                <p className="text-lg font-semibold">${totalAmount.toFixed(2)}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Total Paid</span>
                                <p className="text-lg font-semibold text-green-600">${totalPaid.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="amount">Payment Amount ($)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                // allow overpaying just in case, or cap it at remainingBalance, but typically POS systems allow precise input
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="method">Payment Method</Label>
                            <Select value={method} onValueChange={(val: any) => setMethod(val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="card">Card</SelectItem>
                                    <SelectItem value="online">Online</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isCreatingPayment}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isCreatingPayment || Number(amount) <= 0}>
                            {isCreatingPayment ? "Processing..." : "Record Payment"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
