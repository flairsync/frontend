import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Order } from "@/features/orders/service";
import { useOrders } from "@/features/orders/useOrders";

interface ForceCloseOrderModalProps {
    open: boolean;
    onClose: () => void;
    businessId: string;
    order: Order | null;
}

export const ForceCloseOrderModal: React.FC<ForceCloseOrderModalProps> = ({ open, onClose, businessId, order }) => {
    const { completeOrder, isCompletingOrder } = useOrders(businessId);
    const [notes, setNotes] = useState("");

    const handleComplete = () => {
        if (!order) return;
        if (!notes.trim()) return;

        completeOrder({ orderId: order.id, data: { force: true, notes: notes.trim() } }, {
            onSuccess: () => {
                setNotes("");
                onClose();
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Force Complete Order</DialogTitle>
                    <DialogDescription>
                        This order is not fully paid. Force-completing it will mark it as completed, but a reason is required.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="notes">Closing Notes <span className="text-destructive">*</span></Label>
                    <Input
                        id="notes"
                        placeholder="Explain why this underpaid order is being completed..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isCompletingOrder}>Cancel</Button>
                    <Button variant="destructive" onClick={handleComplete} disabled={isCompletingOrder || !notes.trim()}>
                        Force Complete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
