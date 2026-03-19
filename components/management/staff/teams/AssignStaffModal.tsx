import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BusinessEmployee } from "@/models/business/BusinessEmployee";

interface AssignStaffModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    staffList: BusinessEmployee[];
    assignedStaffIds: string[];
    onAssign: (selectedIds: string[]) => void;
    isAssigning: boolean;
}

export const AssignStaffModal: React.FC<AssignStaffModalProps> = ({
    open,
    onOpenChange,
    staffList,
    assignedStaffIds,
    onAssign,
    isAssigning,
}) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Filter out already assigned staff
    const availableStaff = staffList.filter((s) => !assignedStaffIds.includes(s.id));

    const handleToggle = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedIds);
        if (checked) newSelected.add(id);
        else newSelected.delete(id);
        setSelectedIds(newSelected);
    };

    const handleSubmit = () => {
        onAssign(Array.from(selectedIds));
        setSelectedIds(new Set()); // Reset after assignment
    };

    return (
        <Dialog open={open} onOpenChange={(v) => {
            onOpenChange(v);
            if (!v) setSelectedIds(new Set());
        }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Staff to Team</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    {availableStaff.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No staff available to assign. All staff might already be in this team.
                        </div>
                    ) : (
                        <ScrollArea className="h-64 border rounded-md p-2">
                            <div className="space-y-2">
                                {availableStaff.map((staff) => (
                                    <div key={staff.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-sm">
                                        <Checkbox
                                            id={`staff-${staff.id}`}
                                            checked={selectedIds.has(staff.id)}
                                            onCheckedChange={(checked) => handleToggle(staff.id, checked === true)}
                                        />
                                        <label
                                            htmlFor={`staff-${staff.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                        >
                                            {staff.professionalProfile?.displayName || staff.professionalProfile?.workEmail || 'Unknown User'}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAssigning}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={selectedIds.size === 0 || isAssigning}
                        >
                            {isAssigning ? "Assigning..." : `Assign ${selectedIds.size > 0 ? `(${selectedIds.size})` : ""}`}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
