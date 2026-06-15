import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBusinessEmployees } from "@/features/business/employment/useBusinessEmployees";
import { useShiftTemplates } from "@/features/shifts/useShiftTemplates";
import { useShifts } from "@/features/shifts/useShifts";
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
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const { myBusinessFullDetails } = useMyBusiness(businessId);
    const businessTz = myBusinessFullDetails?.timezone || 'UTC';
    const { employees: allEmployees, isPending: fetchingEmployees } = useBusinessEmployees(businessId);
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
            onSuccess: () => {
                onOpenChange(false);
                setDates([]);
                setDateRange(undefined);
                setEmploymentId("");
                setTemplateId("");
                setErrorMessage(null);
            },
            onError: (error: any) => {
                const msg = error.response?.data?.message || "Failed to schedule staff shifts";
                setErrorMessage(formatShiftErrorMessage(msg, businessTz));
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Bulk Staff Shift Setup</DialogTitle>
                    <DialogDescription>Assign multiple shifts to a specific staff member across different dates.</DialogDescription>
                </DialogHeader>

                {errorMessage && (
                    <div className="mt-4 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm font-medium flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                        <span className="mt-0.5">⚠️</span>
                        <div>{errorMessage}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Select Staff Member</Label>
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

                    <div className="space-y-2 border-t pt-2">
                        <Label>Shift Time</Label>
                        <div className="flex gap-4 mb-2">
                            <label className="flex items-center gap-2 text-sm">
                                <input 
                                    type="radio" 
                                    checked={useTemplate} 
                                    onChange={() => setUseTemplate(true)} 
                                />
                                Use Template
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input 
                                    type="radio" 
                                    checked={!useTemplate} 
                                    onChange={() => setUseTemplate(false)} 
                                />
                                Custom Time
                            </label>
                        </div>
                        
                        {useTemplate ? (
                            <Select value={templateId} onValueChange={setTemplateId}>
                                <SelectTrigger>
                                    <SelectValue placeholder={fetchingTemplates ? "Loading templates..." : "Choose a template"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates?.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name} ({t.startTime} - {t.endTime})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Start</Label>
                                        <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">End</Label>
                                        <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Unpaid Break (Minutes)</Label>
                                    <Input 
                                        type="number"
                                        min="0"
                                        step="5"
                                        value={unpaidBreakMinutes} 
                                        onChange={e => setUnpaidBreakMinutes(Number(e.target.value))} 
                                        placeholder="e.g. 30"
                                    />
                                    <p className="text-[10px] text-muted-foreground">This time will be deducted from paid hours.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 border-t pt-2">
                        <Label>Date Range</Label>
                        <DatePickerWithRange date={dateRange} setDate={handleDateRangeChange} />
                        {dates.length > 0 && (
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">{dates.length} day{dates.length !== 1 ? 's' : ''} selected — click to remove</p>
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
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isBulkStaffScheduling || !employmentId || dates.length === 0 || (useTemplate && !templateId)}>
                            {isBulkStaffScheduling ? "Scheduling..." : "Schedule Staff"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
