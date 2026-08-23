import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation("management");
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
                    <DialogTitle>{t("cancel_order_modal.title")}</DialogTitle>
                    <DialogDescription>
                        {t("cancel_order_modal.description")}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {requiresReason && (
                        <div className="space-y-2">
                            <Label htmlFor="reason">{t("cancel_order_modal.reason_required_label")} <span className="text-destructive">*</span></Label>
                            <Input
                                id="reason"
                                placeholder={t("cancel_order_modal.reason_placeholder")}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">{t("cancel_order_modal.reason_required_hint")}</p>
                        </div>
                    )}
                    {!requiresReason && (
                        <div className="space-y-2">
                            <Label htmlFor="reason">{t("cancel_order_modal.reason_optional_label")}</Label>
                            <Input
                                id="reason"
                                placeholder={t("cancel_order_modal.reason_optional_placeholder")}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isCancellingOrder}>{t("cancel_order_modal.keep_order")}</Button>
                    <Button variant="destructive" onClick={handleCancel} disabled={isCancellingOrder || (requiresReason && !reason.trim())}>
                        {t("cancel_order_modal.confirm_cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
