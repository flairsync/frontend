import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    format,
} from "date-fns";
import { formatTimeInBusinessTimezone } from "@/utils/date-utils";
import { ShiftStatus } from "@/models/business/shift/Shift";
import { StaffCalendarShift } from "@/features/shifts/service";
import { cn } from "@/lib/utils";

const STATUS_DOT: Record<string, string> = {
    [ShiftStatus.SCHEDULED]: "bg-gray-400",
    [ShiftStatus.IN_PROGRESS]: "bg-green-500",
    [ShiftStatus.COMPLETED]: "bg-amber-500",
    [ShiftStatus.VALIDATED]: "bg-green-600",
    [ShiftStatus.CANCELLED]: "bg-muted-foreground/40",
    [ShiftStatus.SICK]: "bg-muted-foreground/40",
    [ShiftStatus.NO_SHOW]: "bg-red-500",
    [ShiftStatus.OPEN]: "bg-orange-500",
};

interface Props {
    currentMonth: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onToday: () => void;
    shifts: StaffCalendarShift[];
    fetching?: boolean;
    businessTz: string;
}

export function StaffShiftCalendarView({
    currentMonth,
    onPrevMonth,
    onNextMonth,
    onToday,
    shifts,
    fetching,
    businessTz,
}: Props) {
    const { t } = useTranslation("management");

    const days = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const gridStart = startOfWeek(monthStart);
        const gridEnd = endOfWeek(monthEnd);
        return eachDayOfInterval({ start: gridStart, end: gridEnd });
    }, [currentMonth]);

    const shiftsByDay = useMemo(() => {
        const map = new Map<string, StaffCalendarShift[]>();
        for (const shift of shifts) {
            const key = format(new Date(shift.startTime), "yyyy-MM-dd");
            const list = map.get(key) ?? [];
            list.push(shift);
            map.set(key, list);
        }
        for (const list of map.values()) {
            list.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        }
        return map;
    }, [shifts]);

    const weekDayLabels = useMemo(() => {
        const weekStart = startOfWeek(new Date());
        return Array.from({ length: 7 }, (_, i) => format(new Date(weekStart.getTime() + i * 86400000), "EEE"));
    }, []);

    const today = new Date();

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={onPrevMonth} title={t("shared.actions.previous")} aria-label={t("shared.actions.previous")}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-semibold w-32 text-center select-none">
                        {format(currentMonth, "MMMM yyyy")}
                    </span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={onNextMonth} title={t("shared.actions.next")} aria-label={t("shared.actions.next")}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-3">
                    {fetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    <Button variant="ghost" size="sm" onClick={onToday}>
                        {t("staff_shifts_page.calendar_tab.today_button")}
                    </Button>
                </div>
            </div>

            <div className="rounded-md border overflow-hidden">
                <div className="grid grid-cols-7 bg-muted/50 border-b">
                    {weekDayLabels.map((label) => (
                        <div key={label} className="p-2 text-center text-[10px] font-semibold uppercase text-muted-foreground">
                            {label}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {days.map((day) => {
                        const key = format(day, "yyyy-MM-dd");
                        const dayShifts = shiftsByDay.get(key) ?? [];
                        const inMonth = isSameMonth(day, currentMonth);
                        const isToday = isSameDay(day, today);

                        return (
                            <div
                                key={key}
                                className={cn(
                                    "min-h-[76px] sm:min-h-[92px] border-b border-r p-1.5 sm:p-2 flex flex-col gap-1",
                                    !inMonth && "bg-muted/20"
                                )}
                            >
                                <span
                                    className={cn(
                                        "text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full",
                                        !inMonth && "text-muted-foreground/40",
                                        isToday && "bg-primary text-primary-foreground font-bold"
                                    )}
                                >
                                    {format(day, "d")}
                                </span>
                                <div className="flex flex-col gap-0.5 overflow-hidden">
                                    {dayShifts.slice(0, 2).map((shift) => (
                                        <div
                                            key={shift.id}
                                            className="flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold bg-muted rounded px-1 py-0.5 truncate"
                                            title={`${formatTimeInBusinessTimezone(shift.startTime, businessTz)} - ${formatTimeInBusinessTimezone(shift.endTime, businessTz)}`}
                                        >
                                            <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", STATUS_DOT[shift.status] ?? "bg-muted-foreground")} />
                                            <span className="truncate">{formatTimeInBusinessTimezone(shift.startTime, businessTz)}</span>
                                        </div>
                                    ))}
                                    {dayShifts.length > 2 && (
                                        <span className="text-[9px] text-muted-foreground font-medium pl-1">
                                            {t("staff_shifts_page.calendar_tab.more_shifts", { count: dayShifts.length - 2 })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
