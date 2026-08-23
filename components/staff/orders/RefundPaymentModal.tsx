import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Order } from "@/features/orders/service";
import { useOrders } from "@/features/orders/useOrders";
import { useBusinessBasicDetails } from "@/features/business/useBusinessBasicDetails";
import { getCurrencySymbol } from "@/utils/currency";

interface RefundPaymentModalProps {
    open: boolean;
    onClose: () => void;
    businessId: string;
    order: Order | null;
    paymentId: string | null;
}

export const RefundPaymentModal: React.FC<RefundPaymentModalProps> = ({ open, onClose, businessId, order, paymentId }) => {
    const { t } = useTranslation("management");
    const { refundPayment, isRefundingPayment } = useOrders(businessId);
    const { businessBasicDetails } = useBusinessBasicDetails(businessId);
    const currencySymbol = getCurrencySymbol(businessBasicDetails?.currency);
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
                    <DialogTitle className="text-destructive">{t("refund_payment_modal.title")}</DialogTitle>
                    <DialogDescription>
                        {t("refund_payment_modal.confirm_prefix")} <strong>{targetPayment?.method ? t(`payment_modal.methods.${targetPayment.method}`) : ""}</strong> {t("refund_payment_modal.confirm_suffix")}
                        {" "}{t("refund_payment_modal.deduct_prefix")} <strong>{currencySymbol}{Number(targetPayment?.amount || 0).toFixed(2)}</strong> {t("refund_payment_modal.deduct_suffix")}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="refundReason">{t("refund_payment_modal.reason_label")}</Label>
                    <Input
                        id="refundReason"
                        placeholder={t("refund_payment_modal.reason_placeholder")}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isRefundingPayment}>{t("refund_payment_modal.cancel")}</Button>
                    <Button variant="destructive" onClick={handleRefund} disabled={isRefundingPayment || !paymentId}>
                        {t("refund_payment_modal.confirm_refund")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
