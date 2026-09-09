import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { startOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, format } from "date-fns";
import { useMyEmployments } from "@/features/business/employment/useMyEmployments";
import { useBusinessBasicDetails } from "@/features/business/useBusinessBasicDetails";
import { useMyShiftCalendar } from "@/features/shifts/useShifts";
import { StaffShiftCalendarView } from "@/components/management/schedule/StaffShiftCalendarView";

export default function StaffCalendarPage() {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const { myEmployments } = useMyEmployments();
    const activeEmployment = myEmployments?.find(e => e.business?.id === businessId);
    const employmentId = activeEmployment?.id || "";

    const { businessBasicDetails } = useBusinessBasicDetails(businessId as string);
    const businessTz = businessBasicDetails?.timezone || 'UTC';

    const [calendarMonth, setCalendarMonth] = useState(() => startOfDay(new Date()));

    const { calendarRangeStart, calendarRangeEnd } = useMemo(() => ({
        calendarRangeStart: format(startOfWeek(startOfMonth(calendarMonth)), 'yyyy-MM-dd'),
        calendarRangeEnd: format(endOfWeek(endOfMonth(calendarMonth)), 'yyyy-MM-dd'),
    }), [calendarMonth]);

    const { calendarShifts, fetchingCalendarShifts } = useMyShiftCalendar(
        businessId as string,
        calendarRangeStart,
        calendarRangeEnd,
        !!employmentId,
    );

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{t("staff_sidebar.items.calendar")}</h1>
                <p className="text-muted-foreground">{t("staff_calendar_page.subtitle")}</p>
            </div>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>{t("staff_shifts_page.upcoming.title")}</CardTitle>
                    <CardDescription>{t("staff_shifts_page.upcoming.subtitle")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <StaffShiftCalendarView
                        currentMonth={calendarMonth}
                        onPrevMonth={() => setCalendarMonth(m => subMonths(m, 1))}
                        onNextMonth={() => setCalendarMonth(m => addMonths(m, 1))}
                        onToday={() => setCalendarMonth(startOfDay(new Date()))}
                        shifts={calendarShifts}
                        fetching={fetchingCalendarShifts}
                        businessTz={businessTz}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
