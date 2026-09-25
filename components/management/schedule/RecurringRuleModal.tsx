import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRecurringRules } from "@/features/shifts/useRecurringRules";
import { ShiftPresetPicker } from "./ShiftPresetPicker";
import { useBusinessEmployees } from "@/features/business/employment/useBusinessEmployees";
import { useBusinessTeams } from "@/features/business/team/useBusinessTeams";
import { usePageContext } from "vike-react/usePageContext";
import { RecurringShiftRule } from "@/models/business/shift/RecurringShiftRule";
import { useMutation } from "@tanstack/react-query";
import { generateDraftApiCall } from "@/features/shifts/service";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { Trash, Users } from "lucide-react";

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

    // Rotas are read Monday-first here, but the stored values stay 0=Sunday to match
    // Date.getDay() on both sides of the API.
    const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
    const WEEKDAYS = [1, 2, 3, 4, 5];
    const WEEKEND = [6, 0];

    const { employees, isPending: fetchingEmployees } = useBusinessEmployees(businessId, { limit: 100 });
    const { teams, loadingTeams } = useBusinessTeams(businessId as string);
    const { createRule, updateRule, isCreatingRule, isUpdatingRule } = useRecurringRules(businessId);

    const generateDraftMutation = useMutation({
        mutationFn: ({ startDate, endDate, ruleId }: { startDate: string; endDate: string; ruleId: string }) =>
            generateDraftApiCall(businessId as string, startDate, endDate, undefined, ruleId),
    });

    const [targetMode, setTargetMode] = useState<"staff" | "team">("staff");
    const [employmentIds, setEmploymentIds] = useState<string[]>([]);
    const [teamId, setTeamId] = useState<string>("");
    const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1]);
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
                setTargetMode(rule.teamId ? "team" : "staff");
                setEmploymentIds(rule.employmentIds ?? []);
                setTeamId(rule.teamId ?? "");
                setDaysOfWeek(rule.daysOfWeek ?? []);
                setStartTime(rule.startTime);
                setEndTime(rule.endTime);
                setStartDate(rule.startDate);
                setEndDate(rule.endDate || "");
                setIsActive(rule.isActive);
                setIntervalValue(rule.interval || 1);
                setExceptionDates(rule.exceptionDates || []);
            } else {
                setTargetMode("staff");
                setEmploymentIds([]);
                setTeamId("");
                setDaysOfWeek([1]);
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

    const toggleDay = (day: number) => {
        setDaysOfWeek(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort((a, b) => a - b));
    };

    const toggleEmployment = (id: string) => {
        setEmploymentIds(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
    };

    const allEmploymentIds = employees?.map(e => e.id) ?? [];
    const allStaffSelected = allEmploymentIds.length > 0 && allEmploymentIds.every(id => employmentIds.includes(id));

    // The rule has to name somebody, and it has to name a day — the API rejects either
    // being empty, so the submit button says so before the round trip.
    const hasTarget = targetMode === "team" ? !!teamId : employmentIds.length > 0;
    const canSubmit = hasTarget && daysOfWeek.length > 0 && !!startTime && !!endTime && !!startDate;

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
        if (!canSubmit) return;

        // Only one targeting mode is submitted, and the other is explicitly cleared —
        // switching an existing rule from a team to named staff has to actually stop the
        // team being scheduled, which needs teamId: null rather than an omitted field.
        const payload = {
            employmentIds: targetMode === "staff" ? employmentIds : [],
            teamId: targetMode === "team" ? teamId : null,
            daysOfWeek,
            startTime,
            endTime,
            startDate,
            endDate: endDate || null,
            isActive,
            interval,
            exceptionDates
        };

        const triggerDraft = (ruleId: string) => {
            const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
            const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
            generateDraftMutation.mutate({
                startDate: format(weekStart, 'yyyy-MM-dd'),
                endDate: format(weekEnd, 'yyyy-MM-dd'),
                ruleId,
            });
        };

        if (rule) {
            updateRule({ ruleId: rule.id, data: payload }, {
                onSuccess: () => {
                    triggerDraft(rule.id);
                    onOpenChange(false);
                }
            });
        } else {
            createRule(payload as any, {
                onSuccess: (created: any) => {
                    if (created?.id) triggerDraft(created.id);
                    onOpenChange(false);
                }
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{rule ? t("schedule_modals.recurring_rule.edit_title") : t("schedule_modals.recurring_rule.create_title")}</DialogTitle>
                    <DialogDescription>
                        {t("schedule_modals.recurring_rule.description")}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>{t("schedule_modals.recurring_rule.who_label")}</Label>
                        <Tabs value={targetMode} onValueChange={(v) => setTargetMode(v as "staff" | "team")}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="staff">{t("schedule_modals.recurring_rule.target_staff")}</TabsTrigger>
                                <TabsTrigger value="team">{t("schedule_modals.recurring_rule.target_team")}</TabsTrigger>
                            </TabsList>

                            <TabsContent value="staff" className="mt-2 space-y-2">
                                {fetchingEmployees ? (
                                    <p className="text-xs text-muted-foreground">{t("schedule_modals.recurring_rule.loading_employees")}</p>
                                ) : !employees?.length ? (
                                    <p className="text-xs text-muted-foreground">{t("schedule_modals.recurring_rule.no_employees")}</p>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[11px] text-muted-foreground">
                                                {t("schedule_modals.recurring_rule.staff_selected_count", { count: employmentIds.length })}
                                            </p>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2 text-[11px]"
                                                onClick={() => setEmploymentIds(allStaffSelected ? [] : allEmploymentIds)}
                                            >
                                                {allStaffSelected ? t("schedule_modals.recurring_rule.clear_all") : t("schedule_modals.recurring_rule.select_all")}
                                            </Button>
                                        </div>
                                        <ScrollArea className="h-40 rounded-md border">
                                            <div className="p-2 space-y-1">
                                                {employees.map(emp => (
                                                    <label
                                                        key={emp.id}
                                                        className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50 cursor-pointer"
                                                    >
                                                        <Checkbox
                                                            checked={employmentIds.includes(emp.id)}
                                                            onCheckedChange={() => toggleEmployment(emp.id)}
                                                        />
                                                        <span>
                                                            {emp.professionalProfile?.displayName || emp.professionalProfile?.firstName || t("schedule_modals.recurring_rule.unnamed_staff")}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </>
                                )}
                            </TabsContent>

                            <TabsContent value="team" className="mt-2 space-y-2">
                                <Select value={teamId} onValueChange={setTeamId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={loadingTeams ? t("schedule_modals.recurring_rule.loading_teams") : t("schedule_modals.recurring_rule.choose_team")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teams?.map(team => (
                                            <SelectItem key={team.id} value={team.id}>
                                                {team.name} ({t("schedule_modals.recurring_rule.member_count", { count: team.members?.length ?? 0 })})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {/* A team rule follows the team, not a snapshot of it. Worth saying
                                    outright: it is the difference between this and ticking the same
                                    people by hand on the Staff tab. */}
                                <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                                    <Users className="w-3 h-3 mt-0.5 shrink-0" />
                                    {t("schedule_modals.recurring_rule.team_hint")}
                                </p>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="space-y-2">
                        <Label>{t("schedule_modals.recurring_rule.days_of_week_label")}</Label>
                        <div className="flex flex-wrap gap-1.5">
                            {DAY_ORDER.map(value => {
                                const selected = daysOfWeek.includes(value);
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => toggleDay(value)}
                                        aria-pressed={selected}
                                        className={`min-w-[44px] rounded-md border px-2 py-1.5 text-xs transition-colors ${selected
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "bg-background hover:bg-muted"}`}
                                    >
                                        {DAYS[value].label.slice(0, 3)}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            <Button type="button" variant="outline" size="sm" className="h-6 px-2 text-[11px]" onClick={() => setDaysOfWeek(WEEKDAYS)}>
                                {t("schedule_modals.recurring_rule.preset_weekdays")}
                            </Button>
                            <Button type="button" variant="outline" size="sm" className="h-6 px-2 text-[11px]" onClick={() => setDaysOfWeek(WEEKEND)}>
                                {t("schedule_modals.recurring_rule.preset_weekend")}
                            </Button>
                            <Button type="button" variant="outline" size="sm" className="h-6 px-2 text-[11px]" onClick={() => setDaysOfWeek([0, 1, 2, 3, 4, 5, 6])}>
                                {t("schedule_modals.recurring_rule.preset_every_day")}
                            </Button>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{t("schedule_modals.recurring_rule.days_of_week_hint")}</p>
                    </div>

                    <ShiftPresetPicker
                        businessId={businessId as string}
                        onApply={(start, end) => {
                            setStartTime(start);
                            setEndTime(end);
                        }}
                    />

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

                    {/* Saving quietly kicks off generateDraft for the current week (see
                        triggerDraft). Without saying so, the draft shifts that appear on the
                        rota look like they came from nowhere. */}
                    <div className="rounded-md border border-dashed bg-muted/20 p-3 text-[11px] text-muted-foreground">
                        {t("schedule_modals.recurring_rule.generates_draft_note")}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>{t("schedule_modals.recurring_rule.cancel")}</Button>
                        <Button type="submit" disabled={isCreatingRule || isUpdatingRule || !canSubmit}>
                            {isCreatingRule || isUpdatingRule ? t("schedule_modals.recurring_rule.saving") : rule ? t("schedule_modals.recurring_rule.update_rule") : t("schedule_modals.recurring_rule.create_rule")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
