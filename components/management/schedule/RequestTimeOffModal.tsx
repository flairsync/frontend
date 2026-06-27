import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTimeOff } from "@/features/shifts/useTimeOff";
import { usePageContext } from "vike-react/usePageContext";
import { useBusinessBasicDetails } from "@/features/business/useBusinessBasicDetails";
import dayjs from "@/utils/date-utils";
import { LeaveType } from "@/models/business/shift/TimeOffRequest";
import { useTranslation } from "react-i18next";

const LEAVE_TYPE_OPTIONS: LeaveType[] = ['VACATION', 'SICK_LEAVE', 'PERSONAL', 'EMERGENCY', 'UNPAID_LEAVE'];

interface RequestTimeOffModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employmentId: string;
}

export const RequestTimeOffModal: React.FC<RequestTimeOffModalProps> = ({
    open,
    onOpenChange,
    employmentId
}) => {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
        VACATION: t("schedule_modals.request_time_off.leave_types.vacation"),
        SICK_LEAVE: t("schedule_modals.request_time_off.leave_types.sick_leave"),
        PERSONAL: t("schedule_modals.request_time_off.leave_types.personal"),
        EMERGENCY: t("schedule_modals.request_time_off.leave_types.emergency"),
        UNPAID_LEAVE: t("schedule_modals.request_time_off.leave_types.unpaid_leave"),
    };

    const { businessBasicDetails } = useBusinessBasicDetails(businessId as string);
    const businessTz = businessBasicDetails?.timezone || 'UTC';

    const { submitRequest, isSubmitting } = useTimeOff(businessId as string, employmentId, { enabled: open });

    const [startDate, setStartDate] = useState<string>(dayjs().tz(businessTz).format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState<string>(dayjs().tz(businessTz).format('YYYY-MM-DD'));
    const [leaveType, setLeaveType] = useState<LeaveType>('PERSONAL');
    const [reason, setReason] = useState<string>("");
    const [documentUrl, setDocumentUrl] = useState<string>("");

    useEffect(() => {
        if (open) {
            setStartDate(dayjs().tz(businessTz).format('YYYY-MM-DD'));
            setEndDate(dayjs().tz(businessTz).format('YYYY-MM-DD'));
            setLeaveType('PERSONAL');
            setReason("");
            setDocumentUrl("");
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate || !endDate || !leaveType) return;

        submitRequest({
            employmentId,
            startDate,
            endDate,
            leaveType,
            reason,
            reviewerId: null,
            documentUrl: documentUrl || null,
        }, {
            onSuccess: () => onOpenChange(false)
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("schedule_modals.request_time_off.title")}</DialogTitle>
                    <DialogDescription>
                        {t("schedule_modals.request_time_off.description")}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">{t("schedule_modals.request_time_off.start_date_label")}</Label>
                            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">{t("schedule_modals.request_time_off.end_date_label")}</Label>
                            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{t("schedule_modals.request_time_off.leave_type_label")}</Label>
                        <Select value={leaveType} onValueChange={(v) => setLeaveType(v as LeaveType)} required>
                            <SelectTrigger>
                                <SelectValue placeholder={t("schedule_modals.request_time_off.leave_type_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                {LEAVE_TYPE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt} value={opt}>
                                        {LEAVE_TYPE_LABELS[opt]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>{t("schedule_modals.request_time_off.reason_label")}</Label>
                        <Textarea
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder={t("schedule_modals.request_time_off.reason_placeholder")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>{t("schedule_modals.request_time_off.document_url_label")}</Label>
                        <Input
                            value={documentUrl}
                            onChange={e => setDocumentUrl(e.target.value)}
                            placeholder={t("schedule_modals.request_time_off.document_url_placeholder")}
                        />
                        <p className="text-[10px] text-muted-foreground">{t("schedule_modals.request_time_off.document_url_hint")}</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>{t("schedule_modals.request_time_off.cancel")}</Button>
                        <Button type="submit" disabled={isSubmitting || !startDate || !endDate || !leaveType}>
                            {isSubmitting ? t("schedule_modals.request_time_off.submitting") : t("schedule_modals.request_time_off.submit_request")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
