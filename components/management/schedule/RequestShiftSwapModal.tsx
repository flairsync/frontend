import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShiftSwaps } from "@/features/shifts/useShiftSwaps";
import { useBusinessEmployees } from "@/features/business/employment/useBusinessEmployees";
import { useShifts } from "@/features/shifts/useShifts";
import { usePageContext } from "vike-react/usePageContext";
import { format, parseISO } from "date-fns";

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
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const { employees, isPending: fetchingEmployees } = useBusinessEmployees(businessId);
    const { shifts, fetchingShifts } = useShifts(businessId, new Date(), format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), currentEmploymentId);
    const { requestSwap, isRequesting } = useShiftSwaps(businessId as string, currentEmploymentId);

    const [shiftId, setShiftId] = useState<string>("");
    const [toEmploymentId, setToEmploymentId] = useState<string>("");

    useEffect(() => {
        if (open) {
            setShiftId(initialShiftId || "");
            setToEmploymentId("");
        }
    }, [open, initialShiftId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shiftId || !toEmploymentId) return;

        requestSwap({
            shiftId,
            fromEmploymentId: currentEmploymentId,
            toEmploymentId
        }, {
            onSuccess: () => onOpenChange(false)
        });
    };

    const myShifts = (shifts || []).filter(s => s.employmentId === currentEmploymentId && s.isPublished);
    const otherEmployees = (employees || []).filter(e => e.id !== currentEmploymentId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Request Shift Swap</DialogTitle>
                    <DialogDescription>
                        Propose a shift swap with another staff member.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Select Your Shift</Label>
                        <Select value={shiftId} onValueChange={setShiftId}>
                            <SelectTrigger>
                                <SelectValue placeholder={fetchingShifts ? "Loading shifts..." : "Choose a shift"} />
                            </SelectTrigger>
                            <SelectContent>
                                {myShifts.map(shift => (
                                    <SelectItem key={shift.id} value={shift.id}>
                                        {format(parseISO(shift.startTime), 'EEE, MMM d: HH:mm')} - {format(parseISO(shift.endTime), 'HH:mm')}
                                    </SelectItem>
                                ))}
                                {myShifts.length === 0 && !fetchingShifts && (
                                    <SelectItem value="none" disabled>No upcoming shifts</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Swap With</Label>
                        <Select value={toEmploymentId} onValueChange={setToEmploymentId}>
                            <SelectTrigger>
                                <SelectValue placeholder={fetchingEmployees ? "Loading employees..." : "Choose a staff member"} />
                            </SelectTrigger>
                            <SelectContent>
                                {otherEmployees.map(emp => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                        {emp.professionalProfile?.displayName || emp.professionalProfile?.firstName || 'Unnamed Staff'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isRequesting || !shiftId || !toEmploymentId}>
                            {isRequesting ? "Submitting..." : "Send Swap Request"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
