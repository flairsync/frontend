import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShiftSwaps } from "@/features/shifts/useShiftSwaps";
import { useBusinessEmployees } from "@/features/business/employment/useBusinessEmployees";
import { useUpcomingShifts } from "@/features/shifts/useShifts";
import { usePageContext } from "vike-react/usePageContext";
import { useBusinessBasicDetails } from "@/features/business/useBusinessBasicDetails";
import { formatInBusinessTimezone, formatTimeInBusinessTimezone } from "@/utils/date-utils";
import dayjs from "@/utils/date-utils";
import { ShiftStatus } from "@/models/business/shift/Shift";
import { useTranslation } from "react-i18next";

interface RequestShiftSwapModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentEmploymentId: string;
    initialShiftId?: string | null;
}

export const RequestShiftSwapModal: React.FC<RequestShiftSwapModalProps> = ({ 
    open, 
    onOpenChange, 
    currentEmploymentId,
    initialShiftId
}) => {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const { businessBasicDetails } = useBusinessBasicDetails(businessId as string);
    const businessTz = businessBasicDetails?.timezone || 'UTC';

    const { employees, isPending: fetchingEmployees } = useBusinessEmployees(businessId, { enabled: open, limit: 100 });
    const startDate = dayjs().tz(businessTz).format('YYYY-MM-DD');
    const endDate = dayjs().tz(businessTz).add(30, 'day').format('YYYY-MM-DD');
    const { data: shiftsData, isFetching: fetchingShifts } = useUpcomingShifts({ businessId, startDate, endDate, enabled: open });
    const shifts = Array.isArray(shiftsData) ? shiftsData : (shiftsData?.data || []);
    const { requestSwap, isRequesting } = useShiftSwaps(businessId as string, currentEmploymentId, { enabled: open });

    const [shiftId, setShiftId] = useState<string>("");
    const [toEmploymentId, setToEmploymentId] = useState<string>("");
    const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setShiftId(initialShiftId || "");
            setToEmploymentId("");
        }
    }, [open, initialShiftId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shiftId || !toEmploymentId) return;

        setIsLocalSubmitting(true);
        requestSwap({
            shiftId,
            fromEmploymentId: currentEmploymentId,
            toEmploymentId
        }, {
            onSuccess: () => onOpenChange(false),
            onSettled: () => setIsLocalSubmitting(false)
        });
    };

    const myShifts = (shifts || []).filter(s => s.employmentId === currentEmploymentId && s.isPublished && s.status === ShiftStatus.SCHEDULED);
    const otherEmployees = (employees || []).filter(e => e.id !== currentEmploymentId && e.status === 'ACTIVE');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("schedule_modals.request_shift_swap.title")}</DialogTitle>
                    <DialogDescription>
                        {t("schedule_modals.request_shift_swap.description")}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>{t("schedule_modals.request_shift_swap.select_shift_label")}</Label>
                        <Select value={shiftId} onValueChange={setShiftId}>
                            <SelectTrigger>
                                <SelectValue placeholder={fetchingShifts ? t("schedule_modals.request_shift_swap.loading_shifts") : t("schedule_modals.request_shift_swap.choose_shift_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                {myShifts.map(shift => (
                                    <SelectItem key={shift.id} value={shift.id}>
                                        {formatInBusinessTimezone(shift.startTime, businessTz, 'ddd, MMM D')}: {formatTimeInBusinessTimezone(shift.startTime, businessTz)} - {formatTimeInBusinessTimezone(shift.endTime, businessTz)}
                                    </SelectItem>
                                ))}
                                {myShifts.length === 0 && !fetchingShifts && (
                                    <SelectItem value="none" disabled>{t("schedule_modals.request_shift_swap.no_upcoming_shifts")}</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>{t("schedule_modals.request_shift_swap.swap_with_label")}</Label>
                        <Select value={toEmploymentId} onValueChange={setToEmploymentId}>
                            <SelectTrigger>
                                <SelectValue placeholder={fetchingEmployees ? t("schedule_modals.request_shift_swap.loading_employees") : t("schedule_modals.request_shift_swap.choose_staff_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                {otherEmployees.map(emp => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                        {emp.professionalProfile?.displayName || emp.professionalProfile?.firstName || t("schedule_modals.request_shift_swap.unnamed_staff")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>{t("schedule_modals.request_shift_swap.cancel")}</Button>
                        <Button type="submit" disabled={isRequesting || isLocalSubmitting || !shiftId || !toEmploymentId}>
                            {isRequesting || isLocalSubmitting ? t("schedule_modals.request_shift_swap.submitting") : t("schedule_modals.request_shift_swap.send_swap_request")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
