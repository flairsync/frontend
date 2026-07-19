import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBusinessTeams } from "@/features/business/team/useBusinessTeams";
import { useShiftTemplates } from "@/features/shifts/useShiftTemplates";
import { useShifts } from "@/features/shifts/useShifts";
import { BulkShiftConflict } from "@/features/shifts/service";
import { usePageContext } from "vike-react/usePageContext";
import { Trash } from "lucide-react";
import { eachDayOfInterval, format } from "date-fns";
import dayjs from "@/utils/date-utils";
import { useMyBusiness } from "@/features/business/useMyBusiness";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";

const formatShiftErrorMessage = (msg: string, tz: string) =>
    msg.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/g, (iso) =>
        dayjs.utc(iso).tz(tz).format("MMM D, YYYY h:mm A")
    );

interface BulkScheduleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const BulkScheduleModal: React.FC<BulkScheduleModalProps> = ({ open, onOpenChange }) => {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const { myBusinessFullDetails } = useMyBusiness(businessId);
    const businessTz = myBusinessFullDetails?.timezone || 'UTC';
    const { teams, loadingTeams } = useBusinessTeams(businessId);
    const { templates, fetchingTemplates } = useShiftTemplates(businessId);
    const { bulkScheduleTeam, isBulkScheduling } = useShifts(businessId, undefined, undefined, undefined, businessTz);

    const [teamId, setTeamId] = useState<string>("");
    const [useTemplate, setUseTemplate] = useState<boolean>(true);
    const [templateId, setTemplateId] = useState<string>("");
    const [startTime, setStartTime] = useState<string>("09:00");
    const [endTime, setEndTime] = useState<string>("17:00");
    const [unpaidBreakMinutes, setUnpaidBreakMinutes] = useState<number>(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [conflicts, setConflicts] = useState<BulkShiftConflict[]>([]);

    // Dates
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [dates, setDates] = useState<string[]>([]);

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range);
        if (range?.from && range?.to) {
            setDates(eachDayOfInterval({ start: range.from, end: range.to }).map(d => format(d, 'yyyy-MM-dd')));
        } else {
            setDates([]);
        }
    };

    const handleRemoveDate = (d: string) => {
        setDates(prev => prev.filter(date => date !== d));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamId || dates.length === 0) return;
        if (useTemplate && !templateId) return;

        bulkScheduleTeam({
            teamId,
            ...(useTemplate ? { templateId } : { startTime, endTime, unpaidBreakMinutes: unpaidBreakMinutes > 0 ? unpaidBreakMinutes : undefined }),
            dates: dates.map(d => ({ date: d }))
        }, {
            onSuccess: (data) => {
                if (data.conflicts.length === 0) {
                    onOpenChange(false);
                    setDates([]);
                    setDateRange(undefined);
                    setTeamId("");
                    setTemplateId("");
                    setErrorMessage(null);
                    setConflicts([]);
                } else {
                    setErrorMessage(null);
                    setConflicts(data.conflicts);
                }
            },
            onError: (error: any) => {
                const msg = error.response?.data?.message || t("schedule_modals.bulk_schedule.error_default");
                setErrorMessage(formatShiftErrorMessage(msg, businessTz));
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("schedule_modals.bulk_schedule.title")}</DialogTitle>
                    <DialogDescription>{t("schedule_modals.bulk_schedule.description")}</DialogDescription>
                </DialogHeader>

                {errorMessage && (
                    <div className="mt-4 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm font-medium flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                        <span className="mt-0.5">⚠️</span>
                        <div>{errorMessage}</div>
                    </div>
                )}

                {conflicts.length > 0 && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-900 space-y-1.5">
                        <p className="font-medium">{t("schedule_modals.bulk_schedule.conflicts_count", { count: conflicts.length })}</p>
                        <ul className="space-y-1 pl-4 list-disc">
                            {conflicts.map((c, i) => (
                                <li key={i}>
                                    {t("schedule_modals.bulk_schedule.conflict_employee_line", { date: c.date, employmentId: c.employmentId.slice(0, 8) })}: {formatShiftErrorMessage(c.reason, businessTz)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>{t("schedule_modals.bulk_schedule.select_team_label")}</Label>
                        <Select value={teamId} onValueChange={setTeamId}>
                            <SelectTrigger>
                                <SelectValue placeholder={loadingTeams ? t("schedule_modals.bulk_schedule.loading_teams") : t("schedule_modals.bulk_schedule.choose_team")} />
                            </SelectTrigger>
                            <SelectContent>
                                {teams?.map(team => (
                                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 border-t pt-2">
                        <Label>{t("schedule_modals.bulk_schedule.shift_time_label")}</Label>
                        <div className="flex gap-4 mb-2">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    checked={useTemplate}
                                    onChange={() => setUseTemplate(true)}
                                />
                                {t("schedule_modals.bulk_schedule.use_template")}
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    checked={!useTemplate}
                                    onChange={() => setUseTemplate(false)}
                                />
                                {t("schedule_modals.bulk_schedule.custom_time")}
                            </label>
                        </div>

                        {useTemplate ? (
                            <Select value={templateId} onValueChange={setTemplateId}>
                                <SelectTrigger>
                                    <SelectValue placeholder={fetchingTemplates ? t("schedule_modals.bulk_schedule.loading_templates") : t("schedule_modals.bulk_schedule.choose_template")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates?.map(tpl => (
                                        <SelectItem key={tpl.id} value={tpl.id}>{tpl.name} ({tpl.startTime} - {tpl.endTime})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">{t("schedule_modals.bulk_schedule.start_label")}</Label>
                                        <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">{t("schedule_modals.bulk_schedule.end_label")}</Label>
                                        <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">{t("schedule_modals.bulk_schedule.unpaid_break_label")}</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="5"
                                        value={unpaidBreakMinutes}
                                        onChange={e => setUnpaidBreakMinutes(Number(e.target.value))}
                                        placeholder={t("schedule_modals.bulk_schedule.unpaid_break_placeholder")}
                                    />
                                    <p className="text-[10px] text-muted-foreground">{t("schedule_modals.bulk_schedule.unpaid_break_hint")}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 border-t pt-2">
                        <Label>{t("schedule_modals.bulk_schedule.date_range_label")}</Label>
                        <DatePickerWithRange date={dateRange} setDate={handleDateRangeChange} />
                        {dates.length > 0 && (
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">{t("schedule_modals.bulk_schedule.days_selected", { count: dates.length })}</p>
                                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                                    {dates.map(d => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() => handleRemoveDate(d)}
                                            className="flex items-center gap-1 bg-secondary hover:bg-destructive/10 hover:text-destructive text-secondary-foreground px-2 py-0.5 rounded text-xs transition-colors"
                                        >
                                            {d}
                                            <Trash className="w-2.5 h-2.5" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" type="button" onClick={() => { onOpenChange(false); setConflicts([]); }}>{t("schedule_modals.bulk_schedule.cancel")}</Button>
                        <Button type="submit" disabled={isBulkScheduling || !teamId || dates.length === 0 || (useTemplate && !templateId)}>
                            {isBulkScheduling ? t("schedule_modals.bulk_schedule.scheduling") : t("schedule_modals.bulk_schedule.schedule_team")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
