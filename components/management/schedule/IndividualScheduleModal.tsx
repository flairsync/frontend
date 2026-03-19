import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShifts } from "@/features/shifts/useShifts";
import { useBusinessEmployees } from "@/features/business/employment/useBusinessEmployees";
import { useBusinessRoles } from "@/features/business/roles/useBusinessRoles";
import { usePageContext } from "vike-react/usePageContext";
import { parse, isValid, format, parseISO } from "date-fns";

import { Shift } from "@/models/business/shift/Shift";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface IndividualScheduleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultEmploymentId?: string | null;
    defaultDate?: string; // format YYYY-MM-DD
    shift?: Shift | null;
}

export const IndividualScheduleModal: React.FC<IndividualScheduleModalProps> = ({ 
    open, 
    onOpenChange, 
    defaultEmploymentId, 
    defaultDate,
    shift
}) => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id as string;

    const { employees: allEmployees, isPending: fetchingEmployees } = useBusinessEmployees(businessId);
    const employees = allEmployees?.filter(emp => emp.type !== 'OWNER') || [];
    
    const { businessRoles, loadingBusinessRoles } = useBusinessRoles(businessId);

    // We only need the mutations here, so we don't pass dates to avoid unnecessary (and infinite) fetches
    const { 
        createIndividualShift, 
        isCreatingIndividualShift,
        updateShift,
        isUpdatingShift
    } = useShifts(businessId);

    const [employmentId, setEmploymentId] = useState<string>("");
    const [dateInput, setDateInput] = useState<string>("");
    const [startTime, setStartTime] = useState<string>("09:00");
    const [endTime, setEndTime] = useState<string>("17:00");
    const [notes, setNotes] = useState<string>("");
    const [requiredRoleId, setRequiredRoleId] = useState<string>("none");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            if (shift) {
                setEmploymentId(shift.employmentId || "");
                setDateInput(format(parseISO(shift.startTime), 'yyyy-MM-dd'));
                setStartTime(format(parseISO(shift.startTime), "HH:mm"));
                setEndTime(format(parseISO(shift.endTime), "HH:mm"));
                setNotes(shift.notes || "");
                setRequiredRoleId(shift.requiredRoleId || "none");
            } else {
                setEmploymentId(defaultEmploymentId || "");
                setDateInput(defaultDate || format(new Date(), "yyyy-MM-dd"));
                setStartTime("09:00");
                setEndTime("17:00");
                setNotes("");
                setRequiredRoleId("none");
            }
            setErrorMessage(null);
        }
    }, [open, defaultEmploymentId, defaultDate, shift]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employmentId || !dateInput || !startTime || !endTime) return;

        const newStart = `${dateInput}T${startTime}:00`; 
        
        let endDateInput = dateInput;
        const startParsed = parse(startTime, "HH:mm", new Date());
        const endParsed = parse(endTime, "HH:mm", new Date());
        
        if (isValid(startParsed) && isValid(endParsed)) {
             if (endParsed < startParsed) {
                 const d = parse(dateInput, "yyyy-MM-dd", new Date());
                 d.setDate(d.getDate() + 1);
                 endDateInput = format(d, "yyyy-MM-dd");
             }
        }
        
        const newEnd = `${endDateInput}T${endTime}:00`;

        const payload: any = {
            startTime: newStart,
            endTime: newEnd,
            notes,
            requiredRoleId: requiredRoleId === "none" ? undefined : requiredRoleId
        };

        if (shift) {
            updateShift({
                shiftId: shift.id,
                data: payload
            }, {
                onSuccess: () => onOpenChange(false),
                onError: (error: any) => {
                    const msg = error.response?.data?.message || "Failed to update shift";
                    setErrorMessage(msg);
                }
            });
        } else {
            createIndividualShift({
                ...payload,
                employmentId,
            }, {
                onSuccess: () => onOpenChange(false),
                onError: (error: any) => {
                    const msg = error.response?.data?.message || "Failed to create shift";
                    setErrorMessage(msg);
                }
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{shift ? "Edit Employee Shift" : "Schedule Employee Shift"}</DialogTitle>
                    <DialogDescription>
                        {shift ? "Update details for this shift." : "Assign a shift to an individual employee."}
                    </DialogDescription>
                </DialogHeader>

                {errorMessage && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Select Employee</Label>
                        <Select value={employmentId} onValueChange={setEmploymentId}>
                            <SelectTrigger>
                                <SelectValue placeholder={fetchingEmployees ? "Loading employees..." : "Choose an employee"} />
                            </SelectTrigger>
                            <SelectContent>
                                {employees?.map(emp => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                        {emp.professionalProfile?.displayName || emp.professionalProfile?.firstName || 'Unnamed Staff'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Input 
                            type="date" 
                            value={dateInput} 
                            onChange={e => setDateInput(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Start Time</Label>
                            <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">End Time</Label>
                            <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Required Role (Optional)</Label>
                        <Select value={requiredRoleId} onValueChange={setRequiredRoleId}>
                            <SelectTrigger>
                                <SelectValue placeholder={loadingBusinessRoles ? "Loading roles..." : "Choose a required role"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No specific role required</SelectItem>
                                {businessRoles?.map(role => (
                                    <SelectItem key={role.id} value={role.id}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-[10px] text-muted-foreground">If set, the system will verify the employee has this role.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Notes (Optional)</Label>
                        <Input 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)} 
                            placeholder="e.g. Front desk duty"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isCreatingIndividualShift || isUpdatingShift || !employmentId || !dateInput}>
                            {isCreatingIndividualShift || isUpdatingShift ? "Saving..." : shift ? "Update Shift" : "Schedule Employee"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
