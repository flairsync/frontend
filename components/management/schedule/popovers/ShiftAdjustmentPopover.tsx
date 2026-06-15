import React, { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShifts } from "@/features/shifts/useShifts";
import { usePageContext } from "vike-react/usePageContext";
import { Shift, ShiftStatus } from "@/models/business/shift/Shift";
import { parseISO, format } from "date-fns";
import { Trash } from "lucide-react";

interface ShiftAdjustmentPopoverProps {
    shift: Shift;
    children: React.ReactNode;
    disabled?: boolean;
}

export const ShiftAdjustmentPopover: React.FC<ShiftAdjustmentPopoverProps> = ({ shift, children, disabled }) => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;
    const { updateShift, deleteShift, isUpdatingShift, isDeletingShift } = useShifts(businessId);
    
    const [open, setOpen] = useState(false);
    
    // We just handle the time portion for local adjustments easily
    const shiftStartDate = parseISO(shift.startTime);
    const shiftEndDate = parseISO(shift.endTime);
    
    const [startTime, setStartTime] = useState(format(shiftStartDate, "HH:mm"));
    const [endTime, setEndTime] = useState(format(shiftEndDate, "HH:mm"));
    const [status, setStatus] = useState<ShiftStatus>(shift.status);
    const [notes, setNotes] = useState(shift.notes || "");

    useEffect(() => {
        if (open) {
            setStartTime(format(parseISO(shift.startTime), "HH:mm"));
            setEndTime(format(parseISO(shift.endTime), "HH:mm"));
            setStatus(shift.status);
            setNotes(shift.notes || "");
        }
    }, [open, shift]);

    const handleSave = () => {
        // Construct full ISO datetime strings retaining the original dates
        // This is a simplified approach, handling date crossings accurately would require more logic
        const newStartObj = new Date(shift.startTime);
        const [startH, startM] = startTime.split(':').map(Number);
        newStartObj.setHours(startH, startM, 0, 0);

        const newEndObj = new Date(shift.endTime);
        const [endH, endM] = endTime.split(':').map(Number);
        newEndObj.setHours(endH, endM, 0, 0);

        updateShift({
            shiftId: shift.id,
            data: {
                startTime: newStartObj.toISOString(),
                endTime: newEndObj.toISOString(),
                status,
                notes
            }
        }, {
            onSuccess: () => setOpen(false)
        });
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this shift?")) {
            deleteShift(shift.id, {
                onSuccess: () => setOpen(false)
            });
        }
    };

    return (
        <Popover open={disabled ? false : open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
                <div className="space-y-4">
                    <h4 className="font-medium leading-none">Adjust Shift</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Start Time</Label>
                            <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">End Time</Label>
                            <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs">Status</Label>
                        <Select value={status} onValueChange={(val: ShiftStatus) => setStatus(val)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(ShiftStatus).map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs">Notes</Label>
                        <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Assigned to front desk" />
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <Button variant="ghost" size="sm" className="text-destructive px-2" onClick={handleDelete} disabled={isDeletingShift}>
                            <Trash className="w-4 h-4 mr-1" />
                            Delete
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button size="sm" onClick={handleSave} disabled={isUpdatingShift}>Save</Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};
