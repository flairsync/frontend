import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { differenceInMinutes } from "date-fns";
import { formatInTimezone, parseInTimezone } from "@/lib/dateUtils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReservations } from "@/features/reservations/useReservations";
import { useMyBusiness } from "@/features/business/useMyBusiness";
import { useTables } from "@/features/floor-plan/useFloorPlan";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditReservationModalProps {
    businessId: string;
    reservation: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const EditReservationModal: React.FC<EditReservationModalProps> = ({
    businessId,
    reservation,
    open,
    onOpenChange
}) => {
    const { t } = useTranslation("management");
    const { updateReservation, isUpdatingReservation, cancelReservation, isCancellingReservation, markNoShow, isMarkingNoShow } = useReservations(businessId);
    const { tables, fetchingTables } = useTables(businessId, true);
    const { myBusinessFullDetails } = useMyBusiness(businessId);

    const [cancelReason, setCancelReason] = useState("");
    const [showCancelReason, setShowCancelReason] = useState(false);

    const [formData, setFormData] = useState({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        date: "",
        time: "",
        guestCount: 1,
        tableId: "unassigned",
        status: "",
        notes: ""
    });

    useEffect(() => {
        if (reservation && open) {
            setFormData({
                customerName: reservation.customerName || "",
                customerEmail: reservation.customerEmail || "",
                customerPhone: reservation.customerPhone || "",
                date: formatInTimezone(reservation.reservationTime, "YYYY-MM-DD", myBusinessFullDetails?.timezone),
                time: formatInTimezone(reservation.reservationTime, "HH:mm", myBusinessFullDetails?.timezone),
                guestCount: reservation.guestCount || 1,
                tableId: reservation.tableId || "unassigned",
                status: reservation.status || "PENDING",
                notes: reservation.notes || ""
            });
            setCancelReason("");
            setShowCancelReason(false);
        }
    }, [reservation, open]);

    const handleSave = () => {
        const timestamp = `${formData.date}T${formData.time}`;

        let newTableId = formData.tableId === "unassigned" ? null : formData.tableId;
        // The API might expect tableId to be omitted if null, but setting it to undefined/null is fine for JSON.

        const payload: any = {
            customerName: formData.customerName,
            customerEmail: formData.customerEmail,
            customerPhone: formData.customerPhone,
            reservationTime: parseInTimezone(timestamp, myBusinessFullDetails?.timezone),
            guestCount: formData.guestCount,
            status: formData.status,
            notes: formData.notes
        };

        if (newTableId) {
            payload.tableId = newTableId;
        } else {
            // To unassign a table, we pass null. Backend should handle that.
            payload.tableId = null;
        }

        updateReservation({
            reservationId: reservation.id,
            data: payload
        }, {
            onSuccess: () => {
                onOpenChange(false);
            }
        });
    };

    const handleCancelReservation = () => {
        if (!showCancelReason) {
            setShowCancelReason(true);
            return;
        }
        cancelReservation(
            { reservationId: reservation.id, cancelReason: cancelReason || undefined },
            { onSuccess: () => onOpenChange(false) }
        );
    };

    const handleMarkNoShow = () => {
        markNoShow(reservation.id, { onSuccess: () => onOpenChange(false) });
    };

    if (!reservation) return null;

    const modificationLimit = myBusinessFullDetails?.reservationModificationLimit ?? 120;
    const minutesUntilReservation = reservation ? differenceInMinutes(new Date(reservation.reservationTime), new Date()) : 0;
    const isModificationAllowed = minutesUntilReservation >= modificationLimit;
    const isPastReservation = minutesUntilReservation < 0;

    const isCancelledOrNoShow = formData.status === "CANCELLED" || formData.status === "NO_SHOW" || formData.status === "EXPIRED";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("edit_reservation_modal.title")}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {!isModificationAllowed && !isPastReservation && !isCancelledOrNoShow && (
                        <div className="p-3 bg-yellow-500/15 border border-yellow-500/50 text-yellow-700 dark:text-yellow-400 rounded text-sm">
                            {t("edit_reservation_modal.restricted_notice", { minutes: modificationLimit })}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t("edit_reservation_modal.name_label")}</Label>
                            <Input
                                value={formData.customerName}
                                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("edit_reservation_modal.phone_label")}</Label>
                            <Input
                                value={formData.customerPhone}
                                onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t("edit_reservation_modal.date_label")}</Label>
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("edit_reservation_modal.time_label")}</Label>
                            <Input
                                type="time"
                                value={formData.time}
                                onChange={e => setFormData({ ...formData, time: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t("edit_reservation_modal.guest_count_label")}</Label>
                            <Input
                                type="number"
                                min={1}
                                value={formData.guestCount}
                                onChange={e => setFormData({ ...formData, guestCount: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("edit_reservation_modal.status_label")}</Label>
                            <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })} disabled={!isModificationAllowed || isCancelledOrNoShow}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">{t("edit_reservation_modal.status_options.PENDING")}</SelectItem>
                                    <SelectItem value="CONFIRMED">{t("edit_reservation_modal.status_options.CONFIRMED")}</SelectItem>
                                    <SelectItem value="WAITLIST">{t("edit_reservation_modal.status_options.WAITLIST")}</SelectItem>
                                    <SelectItem value="SEATED">{t("edit_reservation_modal.status_options.SEATED")}</SelectItem>
                                    <SelectItem value="COMPLETED">{t("edit_reservation_modal.status_options.COMPLETED")}</SelectItem>
                                    {isCancelledOrNoShow && (
                                        <>
                                            <SelectItem value="NO_SHOW">{t("edit_reservation_modal.status_options.NO_SHOW")}</SelectItem>
                                            <SelectItem value="CANCELLED">{t("edit_reservation_modal.status_options.CANCELLED")}</SelectItem>
                                            <SelectItem value="EXPIRED">{t("edit_reservation_modal.status_options.EXPIRED")}</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{t("edit_reservation_modal.assigned_table_label")}</Label>
                        <Select value={formData.tableId} onValueChange={(val) => setFormData({ ...formData, tableId: val })} disabled={!isModificationAllowed || isCancelledOrNoShow}>
                            <SelectTrigger disabled={fetchingTables || !isModificationAllowed || isCancelledOrNoShow}>
                                <SelectValue placeholder={t("edit_reservation_modal.select_table_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unassigned">{t("edit_reservation_modal.unassigned_waitlist")}</SelectItem>
                                {tables?.map((table: any) => (
                                    <SelectItem key={table.id} value={table.id}>
                                        {t("edit_reservation_modal.table_option", { name: table.name || t("edit_reservation_modal.table_fallback_name", { number: table.number || table.id.substring(0, 4) }), capacity: table.capacity })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t("edit_reservation_modal.table_conflict_hint")}
                        </p>
                    </div>

                    {showCancelReason && (
                        <div className="space-y-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                            <Label className="text-destructive">{t("edit_reservation_modal.cancel_reason_label")}</Label>
                            <Input
                                value={cancelReason}
                                onChange={e => setCancelReason(e.target.value)}
                                placeholder={t("edit_reservation_modal.cancel_reason_placeholder")}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between sm:justify-between w-full">
                    <div className="flex gap-2">
                        {!isCancelledOrNoShow && (
                            <>
                                <Button variant="destructive" size="sm" onClick={handleCancelReservation} disabled={isCancellingReservation}>
                                    {isCancellingReservation && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t("edit_reservation_modal.cancel")}
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleMarkNoShow} disabled={isMarkingNoShow || !isPastReservation}>
                                    {isMarkingNoShow && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t("edit_reservation_modal.status_options.NO_SHOW")}
                                </Button>
                            </>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>{t("edit_reservation_modal.close")}</Button>
                        <Button size="sm" onClick={handleSave} disabled={isUpdatingReservation || !isModificationAllowed || isCancelledOrNoShow}>
                            {isUpdatingReservation && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t("edit_reservation_modal.save")}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
