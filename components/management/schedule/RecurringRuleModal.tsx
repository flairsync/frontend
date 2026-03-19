import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useRecurringRules } from "@/features/shifts/useRecurringRules";
import { useBusinessEmployees } from "@/features/business/employment/useBusinessEmployees";
import { usePageContext } from "vike-react/usePageContext";
import { RecurringShiftRule } from "@/models/business/shift/RecurringShiftRule";

interface RecurringRuleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rule?: RecurringShiftRule | null;
}

const DAYS = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
];

export const RecurringRuleModal: React.FC<RecurringRuleModalProps> = ({ 
    open, 
    onOpenChange, 
    rule 
}) => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const { employees, isPending: fetchingEmployees } = useBusinessEmployees(businessId);
    const { createRule, updateRule, isCreatingRule, isUpdatingRule } = useRecurringRules(businessId);

    const [employmentId, setEmploymentId] = useState<string>("");
    const [dayOfWeek, setDayOfWeek] = useState<number>(1);
    const [startTime, setStartTime] = useState<string>("09:00");
    const [endTime, setEndTime] = useState<string>("17:00");
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState<string>("");
    const [isActive, setIsActive] = useState<boolean>(true);
    const [interval, setIntervalValue] = useState<number>(1);

    useEffect(() => {
        if (open) {
            if (rule) {
                setEmploymentId(rule.employmentId);
                setDayOfWeek(rule.dayOfWeek);
                setStartTime(rule.startTime);
                setEndTime(rule.endTime);
                setStartDate(rule.startDate);
                setEndDate(rule.endDate || "");
                setIsActive(rule.isActive);
                setIntervalValue(rule.interval || 1);
            } else {
                setEmploymentId("");
                setDayOfWeek(1);
                setStartTime("09:00");
                setEndTime("17:00");
                setStartDate(new Date().toISOString().split('T')[0]);
                setEndDate("");
                setIsActive(true);
                setIntervalValue(1);
            }
        }
    }, [open, rule]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employmentId || !startTime || !endTime || !startDate) return;

        const payload = {
            employmentId,
            dayOfWeek,
            startTime,
            endTime,
            startDate,
            endDate: endDate || null,
            isActive,
            interval
        };

        if (rule) {
            updateRule({ ruleId: rule.id, data: payload }, {
                onSuccess: () => onOpenChange(false)
            });
        } else {
            createRule(payload, {
                onSuccess: () => onOpenChange(false)
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{rule ? "Edit Recurring Rule" : "Create Recurring Rule"}</DialogTitle>
                    <DialogDescription>
                        Define a shift pattern that repeats every week.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Employee</Label>
                        <Select value={employmentId} onValueChange={setEmploymentId} disabled={!!rule}>
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
                        <Label>Day of Week</Label>
                        <Select value={dayOfWeek.toString()} onValueChange={(val) => setDayOfWeek(parseInt(val))}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {DAYS.map(day => (
                                    <SelectItem key={day.value} value={day.value.toString()}>{day.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Effective Start Date</Label>
                            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">End Date (Optional)</Label>
                            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="space-y-0.5">
                            <Label>Active</Label>
                            <p className="text-[12px] text-muted-foreground">Determines if this rule is used during draft generation.</p>
                        </div>
                        <Switch checked={isActive} onCheckedChange={setIsActive} />
                    </div>

                    <div className="space-y-2 border-t pt-2">
                        <Label>Repetition Interval</Label>
                        <Select value={interval.toString()} onValueChange={(val) => setIntervalValue(parseInt(val))}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Every week</SelectItem>
                                <SelectItem value="2">Every 2 weeks (Bi-weekly)</SelectItem>
                                <SelectItem value="4">Every 4 weeks (Monthly)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-[11px] text-muted-foreground">Bi-weekly and Monthly intervals only generate shifts on weeks that match the start date's modulo.</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isCreatingRule || isUpdatingRule || !employmentId}>
                            {isCreatingRule || isUpdatingRule ? "Saving..." : rule ? "Update Rule" : "Create Rule"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
