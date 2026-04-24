import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { BusinessEmployee } from "@/models/business/BusinessEmployee";

type Props = {
    staff: BusinessEmployee;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: (data: {maxWeeklyHours?: number; minGapBetweenShiftsHours?: number; splitShiftGapHours?: number}) => void;
};

export function EditStaffSettingsModal({
    staff,
    open,
    onOpenChange,
    onSave,
}: Props) {
    const { t } = useTranslation();

    const [maxWeeklyHours, setMaxWeeklyHours] = useState<number | undefined>(staff.maxWeeklyHours);
    const [minGapBetweenShiftsHours, setMinGapBetweenShiftsHours] = useState<number | undefined>(staff.minGapBetweenShiftsHours);
    const [splitShiftGapHours, setSplitShiftGapHours] = useState<number | undefined>(staff.splitShiftGapHours);

    useEffect(() => {
        if (open) {
            setMaxWeeklyHours(staff.maxWeeklyHours);
            setMinGapBetweenShiftsHours(staff.minGapBetweenShiftsHours);
            setSplitShiftGapHours(staff.splitShiftGapHours);
        }
    }, [open, staff]);

    const handleSave = () => {
        if (onSave) {
            onSave({ maxWeeklyHours, minGapBetweenShiftsHours, splitShiftGapHours });
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md flex flex-col">
                <DialogHeader>
                    <DialogTitle>Edit Staff Labor Settings</DialogTitle>
                </DialogHeader>

                {/* Staff summary */}
                <div className="border rounded-lg p-4 space-y-1 mb-4">
                    <p className="font-medium">{staff.professionalProfile?.displayName}</p>
                    <p className="text-sm text-muted-foreground">{staff.professionalProfile?.workEmail}</p>
                    <Badge variant="outline">{staff.status}</Badge>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <Label>Max Weekly Hours Override</Label>
                        <Input
                            type="number"
                            placeholder="e.g. 40"
                            value={maxWeeklyHours ?? ""}
                            onChange={(e) => setMaxWeeklyHours(e.target.value ? Number(e.target.value) : undefined)}
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <Label>Min Gap Between Shifts Override</Label>
                        <Input
                            type="number"
                            placeholder="e.g. 8"
                            value={minGapBetweenShiftsHours ?? ""}
                            onChange={(e) => setMinGapBetweenShiftsHours(e.target.value ? Number(e.target.value) : undefined)}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Split Shift Gap Override</Label>
                        <Input
                            type="number"
                            placeholder="e.g. 1"
                            value={splitShiftGapHours ?? ""}
                            onChange={(e) => setSplitShiftGapHours(e.target.value ? Number(e.target.value) : undefined)}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 border-t pt-4 mt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save changes</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
