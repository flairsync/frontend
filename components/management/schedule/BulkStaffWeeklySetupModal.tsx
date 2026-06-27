import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBusinessEmployees } from "@/features/business/employment/useBusinessEmployees";
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

interface BulkStaffWeeklySetupModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const BulkStaffWeeklySetupModal: React.FC<BulkStaffWeeklySetupModalProps> = ({ open, onOpenChange }) => {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const { myBusinessFullDetails } = useMyBusiness(businessId);
    const businessTz = myBusinessFullDetails?.timezone || 'UTC';
    const { employees: allEmployees, isPending: fetchingEmployees } = useBusinessEmployees(businessId, { limit: 100 });
    const employees = allEmployees?.filter(emp => emp.type !== 'OWNER') || [];
    const { templates, fetchingTemplates } = useShiftTemplates(businessId);
    const { bulkStaffWeeklySetup, isBulkStaffScheduling } = useShifts(businessId, undefined, undefined, undefined, businessTz);

    const [employmentId, setEmploymentId] = useState<string>("");
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
        if (!employmentId || dates.length === 0) return;
        if (useTemplate && !templateId) return;

        bulkStaffWeeklySetup({
            employmentId,
            ...(useTemplate ? { templateId } : { startTime, endTime, unpaidBreakMinutes: unpaidBreakMinutes > 0 ? unpaidBreakMinutes : undefined }),
            dates: dates.map(d => ({ date: d }))
        }, {
            onSuccess: (data) => {
                if (data.conflicts.length === 0) {
                    onOpenChange(false);
                    setDates([]);
                    setDateRange(undefined);
                    setEmploymentId("");
                    setTemplateId("");
                    setErrorMessage(null);
                    setConflicts([]);
                } else {
                    setErrorMessage(null);
                    setConflicts(data.conflicts);
                }
            },
            onError: (error: any) => {
                const msg = error.response?.data?.message || t("schedule_modals.bulk_weekly_setup.error_default");
                setErrorMessage(formatShiftErrorMessage(msg, businessTz));
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("schedule_modals.bulk_weekly_setup.title")}</DialogTitle>
                    <DialogDescription>{t("schedule_modals.bulk_weekly_setup.description")}</DialogDescription>
                </DialogHeader>

                {errorMessage && (
                    <div className="mt-4 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm font-medium flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                        <span className="mt-0.5">⚠️</span>
                        <div>{errorMessage}</div>
                    </div>
                )}

                {conflicts.length > 0 && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-900 space-y-1.5">
                        <p className="font-medium">{t("schedule_modals.bulk_weekly_setup.conflicts_count", { count: conflicts.length })}</p>
                        <ul className="space-y-1 pl-4 list-disc">
                            {conflicts.map((c, i) => (
                                <li key={i}>
                                    {c.date}: {formatShiftErrorMessage(c.reason, businessTz)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>{t("schedule_modals.bulk_weekly_setup.select_staff_label")}</Label>
                        <Select value={employmentId} onValueChange={setEmploymentId}>
                            <SelectTrigger>
                                <SelectValue placeholder={fetchingEmployees ? t("schedule_modals.bulk_weekly_setup.loading_employees") : t("schedule_modals.bulk_weekly_setup.choose_employee")} />
                            </SelectTrigger>
                            <SelectContent>
                                {employees?.map(emp => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                         {emp.professionalProfile?.displayName || emp.professionalProfile?.firstName || t("schedule_modals.bulk_weekly_setup.unnamed_staff")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 border-t pt-2">
                        <Label>{t("schedule_modals.bulk_weekly_setup.shift_time_label")}</Label>
                        <div className="flex gap-4 mb-2">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    checked={useTemplate}
                                    onChange={() => setUseTemplate(true)}
                                />
                                {t("schedule_modals.bulk_weekly_setup.use_template")}
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    checked={!useTemplate}
                                    onChange={() => setUseTemplate(false)}
                                />
                                {t("schedule_modals.bulk_weekly_setup.custom_time")}
                            </label>
                        </div>

                        {useTemplate ? (
                            <Select value={templateId} onValueChange={setTemplateId}>
                                <SelectTrigger>
                                    <SelectValue placeholder={fetchingTemplates ? t("schedule_modals.bulk_weekly_setup.loading_templates") : t("schedule_modals.bulk_weekly_setup.choose_template")} />
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
                                        <Label className="text-xs text-muted-foreground">{t("schedule_modals.bulk_weekly_setup.start_label")}</Label>
                                        <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">{t("schedule_modals.bulk_weekly_setup.end_label")}</Label>
                                        <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">{t("schedule_modals.bulk_weekly_setup.unpaid_break_label")}</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="5"
                                        value={unpaidBreakMinutes}
                                        onChange={e => setUnpaidBreakMinutes(Number(e.target.value))}
                                        placeholder={t("schedule_modals.bulk_weekly_setup.unpaid_break_placeholder")}
                                    />
                                    <p className="text-[10px] text-muted-foreground">{t("schedule_modals.bulk_weekly_setup.unpaid_break_hint")}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 border-t pt-2">
                        <Label>{t("schedule_modals.bulk_weekly_setup.date_range_label")}</Label>
                        <DatePickerWithRange date={dateRange} setDate={handleDateRangeChange} />
                        {dates.length > 0 && (
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">{t("schedule_modals.bulk_weekly_setup.days_selected", { count: dates.length })}</p>
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
                        <Button variant="outline" type="button" onClick={() => { onOpenChange(false); setConflicts([]); }}>{t("schedule_modals.bulk_weekly_setup.cancel")}</Button>
                        <Button type="submit" disabled={isBulkStaffScheduling || !employmentId || dates.length === 0 || (useTemplate && !templateId)}>
                            {isBulkStaffScheduling ? t("schedule_modals.bulk_weekly_setup.scheduling") : t("schedule_modals.bulk_weekly_setup.schedule_staff")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
