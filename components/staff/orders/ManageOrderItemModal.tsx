import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Order } from "@/features/orders/service";
import { useOrders } from "@/features/orders/useOrders";
import { useBusinessMenus } from "@/features/business/menu/useBusinessMenus";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus } from "lucide-react";

interface ManageOrderItemModalProps {
    open: boolean;
    onClose: () => void;
    businessId: string;
    orderId: string;
    item: Order["items"][0] | null;
}

export const ManageOrderItemModal: React.FC<ManageOrderItemModalProps> = ({ open, onClose, businessId, orderId, item }) => {
    const { updateOrderItem, isUpdatingOrderItem } = useOrders(businessId);

    // We fetch the menus just in case we need modifier data later.
    const { businessAllCategories } = useBusinessMenus(businessId);

    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (open && item) {
            setQuantity(item.quantity || 1);
            setNotes(item.notes || "");
        }
    }, [open, item]);

    const handleSave = () => {
        if (!item || !orderId) return;

        updateOrderItem(
            { orderId, itemId: item.id, data: { quantity, notes } },
            {
                onSuccess: () => {
                    onClose();
                }
            }
        );
    };

    if (!item) return null;

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Item - {item.nameSnapshot}</DialogTitle>
                    <DialogDescription>
                        Modify details for this item in the order.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-2 space-y-4">
                    <div className="space-y-2">
                        <Label>Quantity</Label>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Special Notes / Requests</Label>
                        <Textarea
                            placeholder="e.g. No onions, extra spicy..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose} disabled={isUpdatingOrderItem}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isUpdatingOrderItem}>
                        {isUpdatingOrderItem ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
