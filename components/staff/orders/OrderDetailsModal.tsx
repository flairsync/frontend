import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Order } from "@/features/orders/service";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { formatTime } from "@/lib/dateUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Banknote, CalendarClock, Ban, CheckCircle, Undo, Pencil, ChevronRight, Flame } from "lucide-react";
import { RefundPaymentModal } from "@/components/staff/orders/RefundPaymentModal";
import { ManageOrderItemModal } from "@/components/staff/orders/ManageOrderItemModal";

import { useOrders, useOrderDetails } from "@/features/orders/useOrders";
import { useBusinessEmployment } from "@/features/business/employment/useBusinessEmployment";
import { useBusinessBasicDetails } from "@/features/business/useBusinessBasicDetails";
import { getCurrencySymbol } from "@/utils/currency";
import { Input } from "@/components/ui/input";
import { Tag } from "lucide-react";
import { useTranslation } from "react-i18next";

interface OrderDetailsModalProps {
    businessId: string;
    order: Order | null;
    open: boolean;
    onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ businessId, order, open, onClose }) => {
    const { t } = useTranslation("management");
    const { data: fullOrder } = useOrderDetails(businessId, order?.id || "");
    const { voidOrderItem, isVoidingOrderItem, advanceOrderItem, isAdvancingOrderItem, firePending, isFiringPending, updateOrderDiscountAsync, isUpdatingDiscount } = useOrders(businessId);
    const { businessEmployees } = useBusinessEmployment(businessId);
    const { businessBasicDetails } = useBusinessBasicDetails(businessId);
    const currencySymbol = getCurrencySymbol(businessBasicDetails?.currency);
    const displayOrder = fullOrder || order;

    const resolveEmployeeName = (employmentId: string): string => {
        const emp = businessEmployees?.find(e => e.id === employmentId);
        if (!emp?.professionalProfile) return `#${employmentId.slice(0, 8)}`;
        const p = emp.professionalProfile;
        return p.displayName || [p.firstName, p.lastName].filter(Boolean).join(' ') || `#${employmentId.slice(0, 8)}`;
    };

    const [refundPaymentId, setRefundPaymentId] = useState<string | null>(null);
    const [manageItemId, setManageItemId] = useState<string | null>(null);
    const [voidingItem, setVoidingItem] = useState<{ id: string; name: string } | null>(null);
    const [voidReason, setVoidReason] = useState("");
    const [editingDiscount, setEditingDiscount] = useState(false);
    const [discountInput, setDiscountInput] = useState("");

    if (!displayOrder) return null;

    const getItemStatusBadgeClass = (status: string) => {
        switch (status) {
            case "pending":   return "bg-amber-100 text-amber-700 border-amber-200";
            case "sent":      return "bg-blue-100 text-blue-700 border-blue-200";
            case "ready":     return "bg-green-100 text-green-700 border-green-200";
            case "served":    return "bg-gray-100 text-gray-600 border-gray-200";
            case "voided":    return "bg-red-100 text-red-600 border-red-200";
            case "cancelled": return "bg-red-100 text-red-600 border-red-200";
            default:          return "bg-gray-100 text-gray-600 border-gray-200";
        }
    };

    const getAdvanceLabel = (status: string) => {
        if (status === "pending") return t("staff_orders.order_details_modal.fire_to_kitchen");
        if (status === "sent")    return t("staff_orders.order_details_modal.mark_ready");
        if (status === "ready")   return t("staff_orders.order_details_modal.mark_served");
        return null;
    };

    const handleAdvanceItem = (itemId: string) => {
        advanceOrderItem({
            orderId: displayOrder.id,
            itemId,
            tableName: displayOrder.table?.name,
        });
    };

    const handleRemovePending = (itemId: string) => {
        voidOrderItem({ orderId: displayOrder.id, itemId });
    };

    const handleOpenVoidModal = (itemId: string, itemName: string) => {
        setVoidReason("");
        setVoidingItem({ id: itemId, name: itemName });
    };

    const handleConfirmVoid = () => {
        if (!voidingItem) return;
        voidOrderItem(
            { orderId: displayOrder.id, itemId: voidingItem.id, reason: voidReason.trim() || undefined },
            { onSuccess: () => setVoidingItem(null) }
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "created": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "accepted": return "bg-blue-100 text-blue-800 border-blue-200";
            case "preparing": return "bg-orange-100 text-orange-800 border-orange-200";
            case "ready": return "bg-green-100 text-green-800 border-green-200";
            case "served": return "bg-teal-100 text-teal-800 border-teal-200";
            case "completed": return "bg-gray-100 text-gray-800 border-gray-200";
            case "rejected": return "bg-red-100 text-red-800 border-red-200";
            case "canceled": return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "created": return t("staff_orders.status_labels.pending");
            case "accepted": return t("staff_orders.status_labels.accepted");
            case "preparing": return t("staff_orders.status_labels.preparing");
            case "ready": return t("staff_orders.status_labels.ready");
            case "served": return t("staff_orders.status_labels.served");
            case "completed": return t("staff_orders.status_labels.completed");
            case "rejected": return t("staff_orders.status_labels.rejected");
            case "canceled": return t("staff_orders.status_labels.canceled");
            default: return status.toUpperCase();
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden bg-background max-h-[90vh] flex flex-col">
                <DialogHeader className="p-6 pb-4 border-b bg-muted/10">
                    <div className="flex items-center justify-between mb-2">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            {t("staff_orders.order_details_modal.order_hash", { id: displayOrder.id.split('-')[0] })}
                            <Badge variant="outline" className={getStatusColor(displayOrder.status)}>
                                {getStatusLabel(displayOrder.status || "")}
                            </Badge>
                        </DialogTitle>
                        <span className="text-sm text-muted-foreground">
                            {format(new Date(displayOrder.createdAt), "MMM d")}, {formatTime(displayOrder.createdAt)}
                        </span>
                    </div>
                    <DialogDescription className="text-sm">
                        <div className="flex gap-4 mt-2">
                            <div>
                                <span className="text-muted-foreground font-semibold uppercase text-xs">{t("staff_orders.order_details_modal.type_label")}</span>
                                <p className="font-medium capitalize">{displayOrder.type.replace("_", " ")}</p>
                            </div>
                            {displayOrder.table && (
                                <div>
                                    <span className="text-muted-foreground font-semibold uppercase text-xs">{t("staff_orders.order_details_modal.table_label")}</span>
                                    <p className="font-medium">{displayOrder.table.name}</p>
                                </div>
                            )}
                            <div>
                                <span className="text-muted-foreground font-semibold uppercase text-xs">{t("staff_orders.order_details_modal.payment_label")}</span>
                                <p className="font-medium capitalize">{(displayOrder.paymentStatus || "pending").replace(/_/g, " ")}</p>
                            </div>
                            {displayOrder.cancellationReason && (
                                <div>
                                    <span className="font-semibold uppercase text-xs text-red-600">{t("staff_orders.order_details_modal.cancel_reason_label")}</span>
                                    <p className="font-medium text-red-700 max-w-[200px] truncate" title={displayOrder.cancellationReason}>
                                        {displayOrder.cancellationReason}
                                    </p>
                                </div>
                            )}
                            {displayOrder.rejectionReason && (
                                <div>
                                    <span className="font-semibold uppercase text-xs text-red-600">{t("staff_orders.order_details_modal.rejection_reason_label")}</span>
                                    <p className="font-medium text-red-700 max-w-[200px] truncate" title={displayOrder.rejectionReason}>
                                        {displayOrder.rejectionReason}
                                    </p>
                                </div>
                            )}
                            {displayOrder.closingNotes && (
                                <div>
                                    <span className="text-muted-foreground font-semibold uppercase text-xs">{t("staff_orders.order_details_modal.closing_notes_label")}</span>
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
                            <TabsTrigger value="items">{t("staff_orders.order_details_modal.tab_items")}</TabsTrigger>
                            <TabsTrigger value="payments">{t("staff_orders.order_details_modal.tab_payments")}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="items" className="mt-0">
                            <div className="space-y-4">
                                {displayOrder.items?.length > 0 ? (
                                    displayOrder.items.map((item, idx) => {
                                        const basePrice = Number(item.basePriceSnapshot || item.price || 0);
                                        const modifiersTotal = (item.selectedModifiers || []).reduce((sum: number, mod: any) => sum + Number(mod.price || 0), 0);
                                        const unitPrice = basePrice + modifiersTotal;
                                        const totalItemPrice = unitPrice * item.quantity;

                                        const itemStatus = item.status || "pending";
                                        const isTerminalItemStatus = ["voided", "cancelled"].includes(itemStatus);
                                        const advanceLabel = getAdvanceLabel(itemStatus);

                                        const isVoided = itemStatus === 'voided';

                                        return (
                                            <div key={item.id || idx} className="flex justify-between p-3 rounded-lg border bg-card">
                                                <div className="flex flex-col flex-1">
                                                    <span className={`font-medium flex items-center gap-2 flex-wrap ${isVoided ? 'line-through text-muted-foreground' : ''}`}>
                                                        {item.quantity}x {item.nameSnapshot || t("staff_orders.order_details_modal.unknown_item")}
                                                        <Badge variant="outline" className={`h-4 text-[10px] px-1.5 ${getItemStatusBadgeClass(itemStatus)}`}>
                                                            {isVoided ? t("staff_orders.order_details_modal.voided_badge") : <span className="capitalize">{itemStatus}</span>}
                                                        </Badge>
                                                    </span>
                                                    {isVoided && item.voidReason && (
                                                        <span className="text-xs text-red-500 mt-1 italic">{item.voidReason}</span>
                                                    )}
                                                    {isVoided && (item.voidedBy || item.voidedAt) && (
                                                        <span className="text-xs text-muted-foreground mt-0.5">
                                                            {item.voidedBy ? t("staff_orders.order_details_modal.voided_by", { name: resolveEmployeeName(item.voidedBy) }) : t("staff_orders.order_details_modal.voided")}
                                                            {item.voidedAt && ` · ${format(new Date(item.voidedAt), "MMM d")}, ${formatTime(item.voidedAt)}`}
                                                        </span>
                                                    )}
                                                    {item.notes && (
                                                        <span className="text-xs text-muted-foreground italic mt-1">{t("staff_orders.order_details_modal.note_prefix")} {item.notes}</span>
                                                    )}
                                                    {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            <span className="font-semibold">{t("staff_orders.order_details_modal.modifiers_label")} </span>
                                                            {item.selectedModifiers.map(m => m.name).join(", ")}
                                                        </div>
                                                    )}
                                                    <span className="text-xs text-muted-foreground mt-1">
                                                        {currencySymbol}{unitPrice.toFixed(2)} {t("staff_orders.order_details_modal.each_suffix")} {modifiersTotal > 0 ? t("staff_orders.order_details_modal.base_mods_breakdown", { base: `${currencySymbol}${basePrice.toFixed(2)}`, mods: `${currencySymbol}${modifiersTotal.toFixed(2)}` }) : ""}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end gap-2 ml-3">
                                                    <div className="font-bold text-right">
                                                        {isTerminalItemStatus ? <span className="line-through text-muted-foreground">{currencySymbol}{totalItemPrice.toFixed(2)}</span> : `${currencySymbol}${totalItemPrice.toFixed(2)}`}
                                                    </div>
                                                    {!isTerminalItemStatus && (
                                                        <div className="flex items-center gap-1 mt-auto">
                                                            {advanceLabel && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-7 text-[11px] px-2 gap-1"
                                                                    onClick={() => handleAdvanceItem(item.id)}
                                                                    disabled={isAdvancingOrderItem}
                                                                    title={advanceLabel}
                                                                >
                                                                    {itemStatus === "pending"
                                                                        ? <Flame className="w-3 h-3" />
                                                                        : <ChevronRight className="w-3 h-3" />}
                                                                    {advanceLabel}
                                                                </Button>
                                                            )}
                                                            {itemStatus === 'pending' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                                    onClick={() => setManageItemId(item.id)}
                                                                    title={t("staff_orders.order_details_modal.edit_item_title")}
                                                                >
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </Button>
                                                            )}
                                                            {itemStatus === 'pending' ? (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                                                                    onClick={() => handleRemovePending(item.id)}
                                                                    disabled={isVoidingOrderItem}
                                                                >
                                                                    {t("staff_orders.order_details_modal.remove")}
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-7 text-[11px] px-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                                                                    onClick={() => handleOpenVoidModal(item.id, item.nameSnapshot || "Item")}
                                                                    disabled={isVoidingOrderItem}
                                                                >
                                                                    {t("staff_orders.order_details_modal.void")}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-muted-foreground italic">{t("staff_orders.order_details_modal.no_items_found")}</p>
                                )}
                            </div>

                            {(() => {
                                const pendingCount = displayOrder.items?.filter((i: any) => (i.status || "pending") === "pending").length || 0;
                                if (pendingCount === 0) return null;
                                return (
                                    <div className="mt-4 pt-4 border-t">
                                        <Button
                                            className="w-full gap-2"
                                            onClick={() => firePending({ orderId: displayOrder.id, tableName: displayOrder.table?.name })}
                                            disabled={isFiringPending}
                                        >
                                            <Flame className="w-4 h-4" />
                                            {t("staff_orders.order_details_modal.send_to_kitchen", { count: pendingCount, plural: pendingCount !== 1 ? "s" : "" })}
                                        </Button>
                                    </div>
                                );
                            })()}
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
                                                    <span className="font-medium capitalize text-sm">{payment.method} {t("staff_orders.order_details_modal.payment_method_suffix")}</span>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                        <CalendarClock className="w-3 h-3" />
                                                        {format(new Date(payment.createdAt), "MMM d")}, {formatTime(payment.createdAt)}
                                                    </div>
                                                    {payment.status === "refunded" && payment.refundedBy && (
                                                        <div className="flex items-center gap-1 text-xs text-amber-600 mt-0.5">
                                                            <Undo className="w-3 h-3" />
                                                            {t("staff_orders.order_details_modal.refunded_by", { name: resolveEmployeeName(payment.refundedBy) })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="font-bold text-lg">
                                                    {currencySymbol}{Number(payment.amount).toFixed(2)}
                                                    {payment.tipAmount && payment.tipAmount > 0 && (
                                                        <span className="text-xs text-muted-foreground ml-1 font-normal">(+{currencySymbol}{Number(payment.tipAmount).toFixed(2)} {t("staff_orders.order_details_modal.tip_suffix")})</span>
                                                    )}
                                                </span>
                                                <div className="flex gap-2 items-center">
                                                    {payment.status === "success" || payment.status === "paid" ? (
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] h-4">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            {t("staff_orders.order_details_modal.successful")}
                                                        </Badge>
                                                    ) : payment.status === "failed" ? (
                                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] h-4">
                                                            <Ban className="w-3 h-3 mr-1" />
                                                            {t("staff_orders.order_details_modal.failed")}
                                                        </Badge>
                                                    ) : payment.status === "refunded" ? (
                                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] h-4">
                                                            <Undo className="w-3 h-3 mr-1" />
                                                            {t("staff_orders.order_details_modal.refunded")}
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
                                                            title={t("staff_orders.order_details_modal.refund_payment_title")}
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
                                        <p className="text-muted-foreground font-medium">{t("staff_orders.order_details_modal.no_payments_recorded")}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{t("staff_orders.order_details_modal.payments_will_appear")}</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </ScrollArea>

                <div className="p-6 border-t bg-muted/10 space-y-3">
                    <div className="grid grid-cols-2">
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-muted-foreground uppercase">{t("staff_orders.order_details_modal.paid_details_label")}</span>
                            <div className="flex gap-4 mt-1">
                                <div><span className="text-xs text-muted-foreground mr-1">{t("staff_orders.order_details_modal.paid_label")}</span><span className="font-medium text-sm">{currencySymbol}{Number(displayOrder.totalPaid || 0).toFixed(2)}</span></div>
                                {displayOrder.totalTip && displayOrder.totalTip > 0 ? (
                                    <div><span className="text-xs text-muted-foreground mr-1">{t("staff_orders.order_details_modal.tip_label")}</span><span className="font-medium text-sm text-green-600">{currencySymbol}{Number(displayOrder.totalTip).toFixed(2)}</span></div>
                                ) : null}
                                {Number(displayOrder.discountAmount || 0) > 0 && (
                                    <div><span className="text-xs text-muted-foreground mr-1">{t("staff_orders.order_details_modal.discount_label")}</span><span className="font-medium text-sm text-primary">−{currencySymbol}{Number(displayOrder.discountAmount).toFixed(2)}</span></div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end justify-center">
                            <span className="text-xs font-bold text-muted-foreground uppercase">{t("staff_orders.order_details_modal.total_label")}</span>
                            <span className="text-2xl font-bold">{currencySymbol}{Number(displayOrder.totalAmount || 0).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Edit Discount — hidden for terminal statuses */}
                    {!["completed", "rejected", "canceled"].includes(displayOrder.status) && (
                        <>
                            {editingDiscount ? (
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <Input
                                        type="number"
                                        placeholder={t("staff_orders.order_details_modal.discount_amount_placeholder")}
                                        value={discountInput}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            if (v === "" || parseFloat(v) >= 0) setDiscountInput(v);
                                        }}
                                        min={0}
                                        step={0.01}
                                        className="h-8 text-sm flex-1"
                                        autoFocus
                                    />
                                    <Button
                                        size="sm"
                                        className="h-8"
                                        disabled={isUpdatingDiscount}
                                        onClick={async () => {
                                            const amt = parseFloat(discountInput) || 0;
                                            try {
                                                await updateOrderDiscountAsync({ orderId: displayOrder.id, discountAmount: amt });
                                                setEditingDiscount(false);
                                                setDiscountInput("");
                                            } catch { /* error handled in hook */ }
                                        }}
                                    >
                                        {t("staff_orders.order_details_modal.save")}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8"
                                        onClick={() => { setEditingDiscount(false); setDiscountInput(""); }}
                                    >
                                        {t("staff_orders.order_details_modal.cancel")}
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 h-8 text-xs"
                                    onClick={() => {
                                        setDiscountInput(String(Number(displayOrder.discountAmount || 0)));
                                        setEditingDiscount(true);
                                    }}
                                >
                                    <Tag className="w-3.5 h-3.5" />
                                    {Number(displayOrder.discountAmount || 0) > 0
                                        ? t("staff_orders.order_details_modal.edit_discount")
                                        : t("staff_orders.order_details_modal.add_discount")}
                                </Button>
                            )}
                        </>
                    )}
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

            {/* Void Reason Modal */}
            <Dialog open={!!voidingItem} onOpenChange={(open) => !open && setVoidingItem(null)}>
                <DialogContent className="sm:max-w-[380px]">
                    <DialogHeader>
                        <DialogTitle>{t("staff_orders.order_details_modal.void_item_title", { name: voidingItem?.name })}</DialogTitle>
                        <DialogDescription>
                            {t("staff_orders.order_details_modal.void_item_description")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-1">
                        <Label htmlFor="void-reason">{t("staff_orders.order_details_modal.reason_optional_label")}</Label>
                        <Textarea
                            id="void-reason"
                            placeholder={t("staff_orders.order_details_modal.void_reason_placeholder")}
                            value={voidReason}
                            onChange={(e) => setVoidReason(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setVoidingItem(null)}>{t("staff_orders.order_details_modal.cancel")}</Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmVoid}
                            disabled={isVoidingOrderItem}
                        >
                            {t("staff_orders.order_details_modal.void_item_button")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
};
