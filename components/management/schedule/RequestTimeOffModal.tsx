import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTimeOff } from "@/features/shifts/useTimeOff";
import { usePageContext } from "vike-react/usePageContext";
import { useBusinessBasicDetails } from "@/features/business/useBusinessBasicDetails";
import dayjs from "@/utils/date-utils";

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
    const [reason, setReason] = useState<string>("");
    const [documentUrl, setDocumentUrl] = useState<string>("");

    useEffect(() => {
        if (open) {
            setStartDate(dayjs().tz(businessTz).format('YYYY-MM-DD'));
            setEndDate(dayjs().tz(businessTz).format('YYYY-MM-DD'));
            setReason("");
            setDocumentUrl("");
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate || !endDate || !reason) return;

        submitRequest({
            employmentId,
            startDate,
            endDate,
            reason,
            documentUrl: documentUrl || undefined
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
                        <Label>Reason</Label>
                        <Textarea 
                            value={reason} 
                            onChange={e => setReason(e.target.value)} 
                            placeholder="e.g. Family vacation, medical appointment"
                            required
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
                        <Button type="submit" disabled={isSubmitting || !startDate || !endDate || !reason}>
                            {isSubmitting ? "Submitting..." : "Submit Request"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
