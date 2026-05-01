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
import { LeaveType, LEAVE_TYPE_LABELS } from "@/models/business/shift/TimeOffRequest";

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
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const { businessBasicDetails } = useBusinessBasicDetails(businessId as string);
    const businessTz = businessBasicDetails?.timezone || 'UTC';

    const { submitRequest, isSubmitting } = useTimeOff(businessId as string, employmentId);

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
                    <DialogTitle>Request Time Off</DialogTitle>
                    <DialogDescription>
                        Submit a request for time off. Your manager will review it.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Start Date</Label>
                            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">End Date</Label>
                            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Leave Type</Label>
                        <Select value={leaveType} onValueChange={(v) => setLeaveType(v as LeaveType)} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select leave type" />
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
                        <Label>Reason</Label>
                        <Textarea
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="e.g. Family vacation, medical appointment"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Document URL (Optional)</Label>
                        <Input
                            value={documentUrl}
                            onChange={e => setDocumentUrl(e.target.value)}
                            placeholder="e.g. https://storage.com/medical-cert.pdf"
                        />
                        <p className="text-[10px] text-muted-foreground">Link to medical certificates or other supporting documents.</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting || !startDate || !endDate || !leaveType}>
                            {isSubmitting ? "Submitting..." : "Submit Request"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
