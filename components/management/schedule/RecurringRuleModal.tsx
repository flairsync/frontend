import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { useMutation } from "@tanstack/react-query";
import { generateDraftApiCall } from "@/features/shifts/service";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { Trash } from "lucide-react";

interface RecurringRuleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rule?: RecurringShiftRule | null;
}

export const RecurringRuleModal: React.FC<RecurringRuleModalProps> = ({
    open,
    onOpenChange,
    rule
}) => {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const DAYS = [
        { value: 0, label: t("schedule_modals.recurring_rule.days.sunday") },
        { value: 1, label: t("schedule_modals.recurring_rule.days.monday") },
        { value: 2, label: t("schedule_modals.recurring_rule.days.tuesday") },
        { value: 3, label: t("schedule_modals.recurring_rule.days.wednesday") },
        { value: 4, label: t("schedule_modals.recurring_rule.days.thursday") },
        { value: 5, label: t("schedule_modals.recurring_rule.days.friday") },
        { value: 6, label: t("schedule_modals.recurring_rule.days.saturday") },
    ];

    const { employees, isPending: fetchingEmployees } = useBusinessEmployees(businessId, { limit: 100 });
    const { createRule, updateRule, isCreatingRule, isUpdatingRule } = useRecurringRules(businessId);

    const generateDraftMutation = useMutation({
        mutationFn: ({ startDate, endDate, empId }: { startDate: string; endDate: string; empId: string }) =>
            generateDraftApiCall(businessId as string, startDate, endDate, empId),
    });

    const [employmentId, setEmploymentId] = useState<string>("");
    const [dayOfWeek, setDayOfWeek] = useState<number>(1);
    const [startTime, setStartTime] = useState<string>("09:00");
    const [endTime, setEndTime] = useState<string>("17:00");
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState<string>("");
    const [isActive, setIsActive] = useState<boolean>(true);
    const [interval, setIntervalValue] = useState<number>(1);
    const [exceptionDates, setExceptionDates] = useState<string[]>([]);
    const [newExceptionDate, setNewExceptionDate] = useState<string>("");

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
                setExceptionDates(rule.exceptionDates || []);
            } else {
                setEmploymentId("");
                setDayOfWeek(1);
                setStartTime("09:00");
                setEndTime("17:00");
                setStartDate(new Date().toISOString().split('T')[0]);
                setEndDate("");
                setIsActive(true);
                setIntervalValue(1);
                setExceptionDates([]);
            }
            setNewExceptionDate("");
        }
    }, [open, rule]);

    const handleAddExceptionDate = () => {
        if (!newExceptionDate || exceptionDates.includes(newExceptionDate)) return;
        setExceptionDates(prev => [...prev, newExceptionDate].sort());
        setNewExceptionDate("");
    };

    const handleRemoveExceptionDate = (date: string) => {
        setExceptionDates(prev => prev.filter(d => d !== date));
    };

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
            interval,
            exceptionDates
        };

        const triggerDraft = (empId: string) => {
            const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
            const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
            generateDraftMutation.mutate({
                startDate: format(weekStart, 'yyyy-MM-dd'),
                endDate: format(weekEnd, 'yyyy-MM-dd'),
                empId,
            });
        };

        if (rule) {
            updateRule({ ruleId: rule.id, data: payload }, {
                onSuccess: () => {
                    triggerDraft(employmentId);
                    onOpenChange(false);
                }
            });
        } else {
            createRule(payload, {
                onSuccess: () => {
                    triggerDraft(employmentId);
                    onOpenChange(false);
                }
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{rule ? t("schedule_modals.recurring_rule.edit_title") : t("schedule_modals.recurring_rule.create_title")}</DialogTitle>
                    <DialogDescription>
                        {t("schedule_modals.recurring_rule.description")}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>{t("schedule_modals.recurring_rule.employee_label")}</Label>
                        <Select value={employmentId} onValueChange={setEmploymentId} disabled={!!rule}>
                            <SelectTrigger>
                                <SelectValue placeholder={fetchingEmployees ? t("schedule_modals.recurring_rule.loading_employees") : t("schedule_modals.recurring_rule.choose_employee")} />
                            </SelectTrigger>
                            <SelectContent>
                                {employees?.map(emp => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                        {emp.professionalProfile?.displayName || emp.professionalProfile?.firstName || t("schedule_modals.recurring_rule.unnamed_staff")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>{t("schedule_modals.recurring_rule.day_of_week_label")}</Label>
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
                            <Label className="text-xs text-muted-foreground">{t("schedule_modals.recurring_rule.start_time_label")}</Label>
                            <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">{t("schedule_modals.recurring_rule.end_time_label")}</Label>
                            <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">{t("schedule_modals.recurring_rule.effective_start_date_label")}</Label>
                            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">{t("schedule_modals.recurring_rule.end_date_label")}</Label>
                            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="space-y-0.5">
                            <Label>{t("schedule_modals.recurring_rule.active_label")}</Label>
                            <p className="text-[12px] text-muted-foreground">{t("schedule_modals.recurring_rule.active_hint")}</p>
                        </div>
                        <Switch checked={isActive} onCheckedChange={setIsActive} />
                    </div>

                    <div className="space-y-2 border-t pt-2">
                        <Label>{t("schedule_modals.recurring_rule.repetition_interval_label")}</Label>
                        <Select value={interval.toString()} onValueChange={(val) => setIntervalValue(parseInt(val))}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">{t("schedule_modals.recurring_rule.interval_weekly")}</SelectItem>
                                <SelectItem value="2">{t("schedule_modals.recurring_rule.interval_biweekly")}</SelectItem>
                                <SelectItem value="4">{t("schedule_modals.recurring_rule.interval_monthly")}</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-[11px] text-muted-foreground">{t("schedule_modals.recurring_rule.interval_hint")}</p>
                    </div>

                    <div className="space-y-2 border-t pt-2">
                        <Label>{t("schedule_modals.recurring_rule.exception_dates_label")}</Label>
                        <p className="text-[11px] text-muted-foreground">{t("schedule_modals.recurring_rule.exception_dates_hint")}</p>
                        <div className="flex gap-2">
                            <Input type="date" value={newExceptionDate} onChange={e => setNewExceptionDate(e.target.value)} />
                            <Button type="button" variant="outline" onClick={handleAddExceptionDate} disabled={!newExceptionDate}>{t("schedule_modals.recurring_rule.add")}</Button>
                        </div>
                        {exceptionDates.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                                {exceptionDates.map(d => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => handleRemoveExceptionDate(d)}
                                        className="flex items-center gap-1 bg-secondary hover:bg-destructive/10 hover:text-destructive text-secondary-foreground px-2 py-0.5 rounded text-xs transition-colors"
                                    >
                                        {d}
                                        <Trash className="w-2.5 h-2.5" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>{t("schedule_modals.recurring_rule.cancel")}</Button>
                        <Button type="submit" disabled={isCreatingRule || isUpdatingRule || !employmentId}>
                            {isCreatingRule || isUpdatingRule ? t("schedule_modals.recurring_rule.saving") : rule ? t("schedule_modals.recurring_rule.update_rule") : t("schedule_modals.recurring_rule.create_rule")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
