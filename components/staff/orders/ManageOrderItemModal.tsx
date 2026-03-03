import React, { useMemo } from "react";
import { Order } from "@/features/orders/service";
import { useOrders } from "@/features/orders/useOrders";
import { useBusinessMenus } from "@/features/business/menu/useBusinessMenus";
import { OrderItemConfigModal } from "./OrderItemConfigModal";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ManageOrderItemModalProps {
    open: boolean;
    onClose: () => void;
    businessId: string;
    orderId: string;
    item: Order["items"][0] | null;
}

export const ManageOrderItemModal: React.FC<ManageOrderItemModalProps> = ({ open, onClose, businessId, orderId, item }) => {
    const { updateOrderItem } = useOrders(businessId);
    const { businessAllCategories } = useBusinessMenus(businessId);

    const fullMenuItem = useMemo(() => {
        if (!item || !businessAllCategories) return null;
        for (const cat of businessAllCategories) {
            const found = cat.items.find((i: any) => i.id === item.menuItemId);
            if (found) return found;
        }
        return null;
    }, [item, businessAllCategories]);

    if (!item || !open) return null;

    if (!fullMenuItem) {
        return (
            <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
                <DialogContent className="sm:max-w-[425px]">
                    <div className="p-4 text-center text-muted-foreground">Loading item details...</div>
                </DialogContent>
            </Dialog>
        );
    }

    const initialConfig = {
        quantity: item.quantity,
        notes: item.notes,
        variantId: item.variantId,
        modifiers: item.selectedModifiers?.map(m => ({
            modifierItemId: m.id || "",
            name: m.name,
            price: m.price
        })) || []
    };

    const handleSave = (config: any) => {
        if (!orderId) return;

        updateOrderItem(
            {
                orderId,
                itemId: item.id,
                data: {
                    quantity: config.quantity,
                    notes: config.notes,
                    variantId: config.variantId,
                    modifiers: config.modifiers?.map((m: any) => ({ modifierItemId: m.modifierItemId }))
                }
            },
            {
                onSuccess: () => {
                    onClose();
                }
            }
        );
    };

    return (
        <OrderItemConfigModal
            open={open}
            onClose={onClose}
            item={fullMenuItem}
            initialConfig={initialConfig}
            onSave={handleSave}
        />
    );
};
