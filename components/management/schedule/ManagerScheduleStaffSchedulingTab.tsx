import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Users, CalendarPlus, Wand2, Copy, Send, PlusCircle, CheckCircle2, Lock, ShieldCheck, Download, FileSpreadsheet, FileText, UserX, ClipboardCheck } from 'lucide-react'
import { toast } from 'sonner'
import { usePageContext } from 'vike-react/usePageContext'
import { useBusinessEmployees } from '@/features/business/employment/useBusinessEmployees'
import { useShifts } from '@/features/shifts/useShifts'
import { fetchShiftExportApiCall } from '@/features/shifts/service'
import { useTimeOff } from '@/features/shifts/useTimeOff'
import { useUnvalidatedSummary } from '@/features/shifts/useUnvalidatedSummary'
import { useManagerRoster } from '@/features/shifts/useShifts'
import { useMyBusiness } from '@/features/business/useMyBusiness'
import { usePermissions } from '@/features/auth/usePermissions'
import { getCurrencySymbol } from '@/utils/currency'
import { formatInBusinessTimezone } from '@/utils/date-utils'
import { BulkScheduleModal } from './BulkScheduleModal'
import { BulkStaffWeeklySetupModal } from './BulkStaffWeeklySetupModal'
import { IndividualScheduleModal } from './IndividualScheduleModal'
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
} from "@/components/ui/context-menu"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Shift } from '@/models/business/shift/Shift'
import { startOfWeek, endOfWeek, addDays, format, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, startOfDay, endOfDay, addMonths, isSameMonth } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ValidationModal } from './ValidationModal'
import { LogShiftWorkedModal } from './LogShiftWorkedModal'
import { ShiftStatus } from '@/models/business/shift/Shift'

const ManagerScheduleStaffSchedulingTab = () => {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    // View state
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week');
    const [filterStaffId, setFilterStaffId] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const dateStr = params.get("date");
            const view = params.get("view");
            const staffId = params.get("staffId");

            if (dateStr) {
                const parsedDate = new Date(dateStr);
                if (!isNaN(parsedDate.getTime())) {
                    setCurrentDate(parsedDate);
                }
            }
            if (view === "day" || view === "week" || view === "month") {
                setCalendarView(view);
            } else if (window.innerWidth < 768) {
                // A 7-day grid doesn't fit a phone screen — default mobile visitors to the day view.
                setCalendarView("day");
            }
            if (staffId) {
                setFilterStaffId(staffId === "all" ? null : staffId);
            }
            setIsInitialized(true);
        }
    }, []);

    useEffect(() => {
        if (isInitialized && typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("date", format(currentDate, "yyyy-MM-dd"));
            url.searchParams.set("view", calendarView);
            if (filterStaffId) url.searchParams.set("staffId", filterStaffId);
            else url.searchParams.delete("staffId");
            window.history.replaceState({}, "", url.toString());
        }
    }, [currentDate, calendarView, filterStaffId, isInitialized]);

    const { myBusinessFullDetails } = useMyBusiness(businessId as string);
    const businessTz = myBusinessFullDetails?.timezone || 'UTC';

    const getRange = (date: Date, view: 'day' | 'week' | 'month') => {
        if (view === 'day') return { start: startOfDay(date), end: endOfDay(date) };
        if (view === 'month') {
            const start = startOfMonth(date);
            const end = endOfMonth(date);
            return { 
                start: startOfWeek(start, { weekStartsOn: 1 }), 
                end: endOfWeek(end, { weekStartsOn: 1 }) 
            };
        }
        return { start: startOfWeek(date, { weekStartsOn: 1 }), end: endOfWeek(date, { weekStartsOn: 1 }) };
    };

    const { start: dateStart, end: dateEnd } = getRange(currentDate, calendarView);

    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isBulkStaffModalOpen, setIsBulkStaffModalOpen] = useState(false);
    
    // Individual Schedule State
    const [isIndividualModalOpen, setIsIndividualModalOpen] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
    
    // Validation State
    const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
    const [validationAttendanceId, setValidationAttendanceId] = useState("");
    const [validationInitialCheckIn, setValidationInitialCheckIn] = useState("");
    const [validationInitialCheckOut, setValidationInitialCheckOut] = useState("");

    // No-show resolution state
    const [isLogWorkedModalOpen, setIsLogWorkedModalOpen] = useState(false);
    const [logWorkedShift, setLogWorkedShift] = useState<Shift | null>(null);

    const { hasPermission } = usePermissions(businessId as string);
    const canLogNoShow = hasPermission('STAFF', 'update');

    // Data
    const { employees: allEmployees, isPending: fetchingEmployees } = useBusinessEmployees(businessId, { limit: 100 });
    const employees = allEmployees?.filter(emp => emp.type !== 'OWNER') || [];
    const {
        shifts,
        fetchingShifts,
        refetchShifts,
        generateDraft,
        isGeneratingDraft,
        publishWeeklySchedule,
        isPublishing,
        copyPreviousWeek,
        isCopyingWeek,
        deleteShift
    } = useShifts(
        businessId,
        dateStart,
        dateEnd,
        filterStaffId || undefined
    );

    const { requests: timeOffRequests } = useTimeOff(businessId);
    const { data: phantomSummary } = useUnvalidatedSummary(businessId);
    const { roster: managerRoster, fetchingRoster } = useManagerRoster(businessId, dateStart, dateEnd);

    const [viewMode, setViewMode] = useState<'all' | 'published' | 'draft'>('all');

    // Conflict detection
    const checkConflict = (shift: any) => {
        if (!shift.startTime || !shift.endTime) return false;

        const approvedRequests = timeOffRequests?.filter((r: any) => r.status === 'APPROVED' && r.employmentId === shift.employmentId) || [];
        const shiftStart = parseISO(shift.startTime);
        const shiftEnd = parseISO(shift.endTime);

        return approvedRequests.some((r: any) => {
            if (!r.startDate || !r.endDate) return false;
            const reqStart = parseISO(r.startDate);
            const reqEnd = parseISO(r.endDate);
            return (shiftStart < reqEnd && shiftEnd > reqStart);
        });
    };

    // Navigation
    const handlePrev = () => {
        if (calendarView === 'day') setCurrentDate(addDays(currentDate, -1));
        else if (calendarView === 'month') setCurrentDate(addMonths(currentDate, -1));
        else setCurrentDate(addDays(currentDate, -7));
    };
    const handleNext = () => {
        if (calendarView === 'day') setCurrentDate(addDays(currentDate, 1));
        else if (calendarView === 'month') setCurrentDate(addMonths(currentDate, 1));
        else setCurrentDate(addDays(currentDate, 7));
    };

    const noShowCount = (shifts || []).filter(s => s.status === ShiftStatus.NO_SHOW).length;

    // Intervals for viewing
    const viewInterval = eachDayOfInterval({ start: dateStart, end: dateEnd });
    
    const calendarWeeks = [];
    if (calendarView === 'month') {
        for (let i = 0; i < viewInterval.length; i += 7) {
            calendarWeeks.push(viewInterval.slice(i, i + 7));
        }
    }

    const handleRightClick = (employeeId: string, day: Date) => {
        setSelectedEmployeeId(employeeId);
        setSelectedDate(format(day, 'yyyy-MM-dd'));
        setSelectedShift(null);
        setIsIndividualModalOpen(true);
    };

    const handleEditShift = (shift: Shift) => {
        setSelectedEmployeeId(shift.employmentId);
        setSelectedDate(format(parseISO(shift.startTime), 'yyyy-MM-dd'));
        setSelectedShift(shift);
        setIsIndividualModalOpen(true);
    };

    const handleDeleteShift = (shiftId: string) => {
        if (confirm(t("schedule_staff_scheduling_tab.confirm_delete_shift"))) {
            deleteShift(shiftId);
        }
    };

    const handleValidateShift = (shift: Shift) => {
        if (!shift.attendanceId) return;
        setValidationAttendanceId(shift.attendanceId);
        setValidationInitialCheckIn(shift.startTime);
        setValidationInitialCheckOut(shift.endTime);
        setIsValidationModalOpen(true);
    };

    const handleLogAsWorked = (shift: Shift) => {
        setLogWorkedShift(shift);
        setIsLogWorkedModalOpen(true);
    };

    // Cron and a real clock-in can race — if the shift already gained an attendance
    // record by the time we submit, refetch and route into the validate flow instead.
    const handleLogWorkedConflict = async (shiftId: string) => {
        const refetched = await refetchShifts();
        const updatedShift = refetched.data?.find((s: Shift) => s.id === shiftId);
        if (updatedShift?.attendanceId) {
            handleValidateShift(updatedShift);
        } else {
            toast.info(t("schedule_staff_scheduling_tab.toast_already_has_attendance"));
        }
    };

    const getStatusBadge = (status: ShiftStatus, staffResponse?: string) => {
        switch (status) {
            case ShiftStatus.SCHEDULED:
                if (staffResponse === 'ACCEPTED') {
                    return (
                        <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-emerald-500 bg-emerald-50 text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-2 h-2" />
                            {t("schedule_staff_scheduling_tab.status_accepted")}
                        </Badge>
                    );
                }
                if (staffResponse === 'REJECTED') {
                    return (
                        <Badge variant="destructive" className="text-[8px] px-1 py-0 h-3.5 bg-red-50 text-red-700 border-red-200">
                            {t("schedule_staff_scheduling_tab.status_rejected")}
                        </Badge>
                    );
                }
                return <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5 bg-gray-100 text-gray-600 font-normal">{t("schedule_staff_scheduling_tab.status_pending")}</Badge>;
            case ShiftStatus.IN_PROGRESS:
                return (
                    <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-green-200 bg-green-50 text-green-700 flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                        {t("schedule_staff_scheduling_tab.status_ongoing")}
                    </Badge>
                );
            case ShiftStatus.COMPLETED:
                return <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-amber-200 bg-amber-50 text-amber-700">{t("schedule_staff_scheduling_tab.status_finished")}</Badge>;
            case ShiftStatus.VALIDATED:
                return (
                    <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-green-500 bg-green-50 text-green-700 flex items-center gap-1">
                        <CheckCircle2 className="w-2 h-2" />
                        {t("schedule_staff_scheduling_tab.status_validated")}
                    </Badge>
                );
            case ShiftStatus.NO_SHOW:
                return (
                    <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-red-500 bg-red-50 text-red-700 flex items-center gap-1">
                        <UserX className="w-2 h-2" />
                        {t("schedule_staff_scheduling_tab.status_no_show")}
                    </Badge>
                );
            case ShiftStatus.OPEN:
                return (
                    <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-orange-500 bg-orange-50 text-orange-700 font-bold uppercase">
                        {t("schedule_staff_scheduling_tab.status_open")}
                    </Badge>
                );
            default:
                return <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5">{status}</Badge>;
        }
    };

    const handlePublish = () => {
        publishWeeklySchedule({
            startDate: format(dateStart, 'yyyy-MM-dd'),
            endDate: format(dateEnd, 'yyyy-MM-dd')
        });
    };

    const handleGenerate = () => {
        if (calendarView === 'month' && filterStaffId) {
            generateDraft({
                startDate: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
                endDate: format(endOfMonth(currentDate), 'yyyy-MM-dd'),
                employmentId: filterStaffId,
            });
        } else {
            generateDraft({
                startDate: format(dateStart, 'yyyy-MM-dd'),
                endDate: format(dateEnd, 'yyyy-MM-dd'),
                employmentId: filterStaffId || undefined,
            });
        }
    };

    const handleCopyWeek = () => {
        const prevWeekStart = addDays(dateStart, -7);
        copyPreviousWeek({
            sourceWeekStart: format(prevWeekStart, 'yyyy-MM-dd'),
            targetWeekStart: format(dateStart, 'yyyy-MM-dd')
        });
    };

    const handleExport = async (exportFormat: 'pdf' | 'excel') => {
        const isMonthlyStaff = calendarView === 'month' && !!filterStaffId;
        const start = isMonthlyStaff ? format(startOfMonth(currentDate), 'yyyy-MM-dd') : format(dateStart, 'yyyy-MM-dd');
        const end = isMonthlyStaff ? format(endOfMonth(currentDate), 'yyyy-MM-dd') : format(dateEnd, 'yyyy-MM-dd');
        try {
            const blob = await fetchShiftExportApiCall(businessId as string, start, end, exportFormat, filterStaffId || undefined);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `schedule-${start}-to-${end}.${exportFormat === 'excel' ? 'xlsx' : 'pdf'}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch {
            toast.error(t("schedule_staff_scheduling_tab.toast_export_failed"));
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 border-b space-y-3 pb-3">
                {/* Row 1: Title + action buttons */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-lg">{t("schedule_staff_scheduling_tab.title")}</CardTitle>

                    <div className="flex flex-wrap items-center gap-1.5">
                        {/* Export */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1.5 text-muted-foreground hover:text-foreground"
                                    disabled={calendarView === 'month' && !filterStaffId}
                                >
                                    <Download className="w-4 h-4" />
                                    {t("schedule_staff_scheduling_tab.export_button")}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                                    <FileText className="w-4 h-4 mr-2 text-red-500" />
                                    {t("schedule_staff_scheduling_tab.export_pdf")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport('excel')}>
                                    <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                                    {t("schedule_staff_scheduling_tab.export_excel")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="w-px h-5 bg-border mx-1" />

                        {/* Add shifts */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1.5">
                                    <PlusCircle className="w-4 h-4" />
                                    {t("schedule_staff_scheduling_tab.add_shifts_button")}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuItem onClick={() => setIsBulkStaffModalOpen(true)}>
                                    <CalendarPlus className="w-4 h-4 mr-2" />
                                    {t("schedule_staff_scheduling_tab.bulk_staff_setup")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsBulkModalOpen(true)}>
                                    <Users className="w-4 h-4 mr-2" />
                                    {t("schedule_staff_scheduling_tab.schedule_team")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Generate Draft */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGenerate}
                            disabled={isGeneratingDraft}
                            className="gap-1.5"
                        >
                            <Wand2 className="w-4 h-4" />
                            {isGeneratingDraft ? t("schedule_staff_scheduling_tab.generating") : t("schedule_staff_scheduling_tab.generate_button")}
                        </Button>

                        {/* Copy previous — icon-only to save space */}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCopyWeek}
                            disabled={isCopyingWeek}
                            title={t("schedule_staff_scheduling_tab.copy_previous_week_title")}
                            className="shrink-0"
                        >
                            <Copy className="w-4 h-4" />
                        </Button>

                        <div className="w-px h-5 bg-border mx-1" />

                        {/* Publish — primary CTA */}
                        <Button
                            size="sm"
                            onClick={handlePublish}
                            disabled={isPublishing}
                            className="gap-1.5"
                        >
                            <Send className="w-4 h-4" />
                            {isPublishing ? t("schedule_staff_scheduling_tab.publishing") : t("schedule_staff_scheduling_tab.publish_button")}
                        </Button>
                    </div>
                </div>

                {/* Row 2: Navigation + filters */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center bg-background border rounded-md">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrev}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium w-40 text-center select-none">
                            {calendarView === 'day'
                                ? format(currentDate, 'MMM d, yyyy')
                                : calendarView === 'month'
                                ? format(currentDate, 'MMMM yyyy')
                                : `${format(dateStart, 'MMM d')} – ${format(dateEnd, 'MMM d, yyyy')}`}
                        </span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-1 bg-background border rounded-md p-1">
                        {(['day', 'week', 'month'] as const).map((view) => (
                            <Button
                                key={view}
                                variant={calendarView === view ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setCalendarView(view)}
                                className="h-7 text-xs capitalize px-3"
                            >
                                {t(`schedule_staff_scheduling_tab.view_${view}`)}
                            </Button>
                        ))}
                    </div>

                    <Select
                        value={filterStaffId || 'all'}
                        onValueChange={(val: string) => setFilterStaffId(val === 'all' ? null : val)}
                    >
                        <SelectTrigger className="h-8 w-44 text-sm">
                            <SelectValue placeholder={t("schedule_staff_scheduling_tab.all_staff_placeholder")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("schedule_staff_scheduling_tab.all_staff_placeholder")}</SelectItem>
                            {employees.map(emp => (
                                <SelectItem key={emp.id} value={emp.id}>
                                    {emp.professionalProfile?.displayName || emp.professionalProfile?.firstName || t("schedule_staff_scheduling_tab.staff_fallback_name")}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {phantomSummary && phantomSummary.total > 0 && (
                        <Badge variant="outline" className="h-7 px-3 border-amber-200 bg-amber-50 text-amber-700 flex items-center gap-1.5 font-medium animate-in fade-in slide-in-from-left-2 duration-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            {t("schedule_staff_scheduling_tab.unvalidated_shifts_count", { count: phantomSummary.total })}
                        </Badge>
                    )}

                    {noShowCount > 0 && (
                        <Badge variant="outline" className="h-7 px-3 border-red-200 bg-red-50 text-red-700 flex items-center gap-1.5 font-medium animate-in fade-in slide-in-from-left-2 duration-500">
                            <UserX className="w-3.5 h-3.5" />
                            {t("schedule_staff_scheduling_tab.no_show_count", { count: noShowCount })}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto min-h-[400px]">
                <div className={calendarView === 'day' ? 'min-w-[420px]' : 'min-w-[800px]'}>
                    {/* Header Row */}
                    <div className={`grid border-b bg-muted/10 ${
                        calendarView === 'month' ? 'grid-cols-7' : 
                        calendarView === 'day' ? 'grid-cols-[200px_1fr]' : 
                        'grid-cols-[200px_repeat(7,1fr)]'
                    }`}>
                        {calendarView !== 'month' && (
                            <div className="p-3 font-semibold text-sm border-r flex items-center justify-center text-center">
                                {t("schedule_staff_scheduling_tab.col_staff_member")}
                            </div>
                        )}
                        {calendarView === 'month' ? (
                            [
                                t("schedule_staff_scheduling_tab.days_short.mon"),
                                t("schedule_staff_scheduling_tab.days_short.tue"),
                                t("schedule_staff_scheduling_tab.days_short.wed"),
                                t("schedule_staff_scheduling_tab.days_short.thu"),
                                t("schedule_staff_scheduling_tab.days_short.fri"),
                                t("schedule_staff_scheduling_tab.days_short.sat"),
                                t("schedule_staff_scheduling_tab.days_short.sun"),
                            ].map(dayName => (
                                <div key={dayName} className="p-3 font-semibold text-sm text-center border-r last:border-r-0">
                                    {dayName}
                                </div>
                            ))
                        ) : (
                            viewInterval.map(day => {
                                const isToday = isSameDay(day, new Date());
                                return (
                                <div key={day.toString()} className={`p-3 font-semibold text-sm text-center border-r last:border-r-0 ${
                                    isToday ? 'bg-primary/10 text-primary' : ''
                                }`}>
                                    <div>{format(day, 'EEE')}</div>
                                    <div className={`font-normal text-xs mt-0.5 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>{format(day, 'MMM d')}</div>
                                </div>
                            )})
                        )}
                    </div>

                    {/* Content Rows */}
                    {fetchingEmployees || fetchingShifts ? (
                        <div className="p-8 text-center text-muted-foreground animate-pulse">{t("schedule_staff_scheduling_tab.loading_schedule")}</div>
                    ) : employees?.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">{t("schedule_staff_scheduling_tab.empty_no_employees")}</div>
                    ) : calendarView === 'month' && !filterStaffId ? (
                         <div className="p-12 text-center text-muted-foreground">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">{t("schedule_staff_scheduling_tab.monthly_overview_title")}</p>
                            <p className="text-sm">{t("schedule_staff_scheduling_tab.monthly_overview_select_staff")}</p>
                         </div>
                    ) : calendarView === 'month' && filterStaffId ? (
                        calendarWeeks.map((week, weekIdx) => (
                            <div key={weekIdx} className="grid grid-cols-7 border-b last:border-b-0">
                                {week.map(day => {
                                    const employee = employees.find(e => e.id === filterStaffId);
                                    if (!employee) return null;
                                    const dayShifts = (shifts || [])
                                        .filter(s => s.employmentId === employee.id && isSameDay(parseISO(s.startTime), day))
                                        .filter(s => {
                                            if (viewMode === 'published') return s.isPublished;
                                            if (viewMode === 'draft') return !s.isPublished;
                                            return true;
                                        });

                                    return (
                                        <ContextMenu key={day.toString()}>
                                            <ContextMenuTrigger asChild>
                                                <div 
                                                    className={`p-2 border-r last:border-r-0 min-h-[100px] hover:bg-muted/10 transition-colors cursor-default ${
                                                        !isSameMonth(day, currentDate) ? 'bg-muted/5 opacity-40' : ''
                                                    } ${isSameDay(day, new Date()) ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''}`}
                                                >
                                                    <div className={`text-[10px] mb-1 text-right ${isSameDay(day, new Date()) ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{format(day, 'd')}</div>
                                                    {dayShifts.map((shift) => {
                                                        const hasConflict = checkConflict(shift);
                                                        return (
                                                            <div 
                                                                key={shift.id}
                                                                onClick={() => handleEditShift(shift)}
                                                                className={`mb-1 p-1.5 transition-all border rounded text-[10px] sm:text-xs cursor-pointer flex flex-col gap-0.5 ${
                                                                    shift.status === ShiftStatus.NO_SHOW ? "border-red-500 ring-red-500/20 bg-red-50" :
                                                                    hasConflict ? "border-destructive ring-destructive/20 bg-destructive/5" :
                                                                    shift.status === ShiftStatus.VALIDATED
                                                                        ? "bg-green-500/10 border-green-500/20 ring-green-500/20" :
                                                                    shift.isPublished
                                                                        ? "bg-primary/10 hover:bg-primary/20 ring-primary/20 border-primary/20"
                                                                        : "bg-amber-500/10 hover:bg-amber-500/20 ring-amber-500/20 border-amber-500/30 border-dashed"
                                                                } hover:ring-1`}
                                                                title={shift.status === ShiftStatus.NO_SHOW ? t("schedule_staff_scheduling_tab.tooltip_no_show") : hasConflict ? t("schedule_staff_scheduling_tab.tooltip_conflict") : shift.notes || (shift.isPublished ? t("schedule_staff_scheduling_tab.tooltip_published") : t("schedule_staff_scheduling_tab.tooltip_draft"))}
                                                            >
                                                                <div className="flex items-center justify-between gap-1">
                                                                    <div className={`font-semibold truncate ${shift.status === ShiftStatus.NO_SHOW ? 'text-red-700' : hasConflict ? 'text-destructive' : shift.status === ShiftStatus.VALIDATED ? 'text-green-700' : shift.isPublished ? 'text-primary' : 'text-amber-700'}`}>
                                                                        {formatInBusinessTimezone(shift.startTime, businessTz)} - {formatInBusinessTimezone(shift.endTime, businessTz)}
                                                                    </div>
                                                                    {shift.status === ShiftStatus.VALIDATED && <Lock className="w-2 h-2 text-green-600" />}
                                                                    {shift.status === ShiftStatus.NO_SHOW && <UserX className="w-2 h-2 text-red-600" />}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </ContextMenuTrigger>
                                            <ContextMenuContent className="w-48">
                                                <ContextMenuItem onClick={() => handleRightClick(employee.id, day)}>
                                                    {t("schedule_staff_scheduling_tab.context_add_new_shift")}
                                                </ContextMenuItem>
                                                                {dayShifts.length > 0 && (
                                                                    <>
                                                                        <ContextMenuSeparator />
                                                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{t("schedule_staff_scheduling_tab.context_shifts_count", { count: dayShifts.length })}</div>
                                                                        {dayShifts.map(s => (
                                                                            <div key={s.id}>
                                                                                {s.status === ShiftStatus.COMPLETED && (
                                                                                    <ContextMenuItem onClick={() => handleValidateShift(s)} className="pl-4 text-green-600 focus:text-green-700">
                                                                                        <ShieldCheck className="w-4 h-4 mr-2" />
                                                                                        {t("schedule_staff_scheduling_tab.context_validate_shift")}
                                                                                    </ContextMenuItem>
                                                                                )}
                                                                                {s.status === ShiftStatus.NO_SHOW && canLogNoShow && (
                                                                                    <ContextMenuItem onClick={() => handleLogAsWorked(s)} className="pl-4 text-red-600 focus:text-red-700">
                                                                                        <ClipboardCheck className="w-4 h-4 mr-2" />
                                                                                        {t("schedule_staff_scheduling_tab.context_log_as_worked")}
                                                                                    </ContextMenuItem>
                                                                                )}
                                                                                <ContextMenuItem disabled={s.status === ShiftStatus.VALIDATED} onClick={() => handleEditShift(s)} className="pl-4">
                                                                                    {t("schedule_staff_scheduling_tab.context_edit_at_time", { time: formatInBusinessTimezone(s.startTime, businessTz) })}
                                                                                </ContextMenuItem>
                                                                                <ContextMenuItem disabled={s.status === ShiftStatus.VALIDATED} onClick={() => handleDeleteShift(s.id)} className="pl-4 text-destructive focus:text-destructive">
                                                                                    {t("schedule_staff_scheduling_tab.context_delete_at_time", { time: formatInBusinessTimezone(s.startTime, businessTz) })}
                                                                                </ContextMenuItem>
                                                                            </div>
                                                                        ))}
                                                                    </>
                                                                )}
                                            </ContextMenuContent>
                                        </ContextMenu>
                                    );
                                })}
                            </div>
                        ))
                    ) : (
                        <>
                            {/* Open Shifts Row for Managers */}
                            <div className={`grid border-b last:border-b-0 group bg-orange-50/30 ${
                                calendarView === 'day' ? 'grid-cols-[200px_1fr]' : 
                                'grid-cols-[200px_repeat(7,1fr)]'
                            }`}>
                                <div className="p-3 text-sm font-bold border-r bg-orange-100/20 flex items-center overflow-hidden text-orange-700">
                                    <span className="truncate flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        {t("schedule_staff_scheduling_tab.open_vacant_row_label")}
                                    </span>
                                </div>
                                {viewInterval.map(day => {
                                    const dayOpenShifts = (shifts || [])
                                        .filter(s => !s.employmentId && isSameDay(parseISO(s.startTime), day));
                                    
                                    return (
                                        <ContextMenu key={day.toString()}>
                                            <ContextMenuTrigger asChild>
                                                <div 
                                                    className={`p-2 border-r last:border-r-0 min-h-[80px] hover:bg-orange-100/10 transition-colors cursor-default ${
                                                        isSameDay(day, new Date()) ? 'bg-orange-50/50' : ''
                                                    }`}
                                                >
                                                    {dayOpenShifts.map((shift) => (
                                                        <div 
                                                            key={shift.id}
                                                            onClick={() => handleEditShift(shift)}
                                                            className="mb-1 p-1.5 transition-all border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 rounded text-[10px] sm:text-xs cursor-pointer flex flex-col gap-0.5"
                                                        >
                                                            <div className="flex items-center justify-between gap-1">
                                                                <div className="font-bold text-orange-800 truncate">
                                                                    {formatInBusinessTimezone(shift.startTime, businessTz, 'HH:mm')} - {formatInBusinessTimezone(shift.endTime, businessTz, 'HH:mm')}
                                                                </div>
                                                                <Badge variant="outline" className="text-[7px] px-1 py-0 h-3 bg-white border-orange-200 text-orange-700 font-bold uppercase">{t("schedule_staff_scheduling_tab.status_open")}</Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {dayOpenShifts.length === 0 && (
                                                        <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-6 w-6 text-orange-400 hover:text-orange-600 hover:bg-orange-100"
                                                                onClick={() => handleRightClick("", day)}
                                                            >
                                                                <PlusCircle className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </ContextMenuTrigger>
                                            <ContextMenuContent className="w-48">
                                                <ContextMenuItem onClick={() => handleRightClick("", day)}>
                                                    {t("schedule_staff_scheduling_tab.context_create_open_shift")}
                                                </ContextMenuItem>
                                            </ContextMenuContent>
                                        </ContextMenu>
                                    );
                                })}
                            </div>

                            {(filterStaffId ? employees.filter(e => e.id === filterStaffId) : employees).map(employee => (
                            <div 
                                key={employee.id} 
                                className={`grid border-b last:border-b-0 group ${
                                    calendarView === 'day' ? 'grid-cols-[200px_1fr]' : 
                                    'grid-cols-[200px_repeat(7,1fr)]'
                                }`}
                            >
                                <div className="p-3 text-sm font-medium border-r bg-muted/5 flex items-center overflow-hidden">
                                   <span className="truncate">
                                        {employee.professionalProfile?.displayName || employee.professionalProfile?.firstName || t("schedule_staff_scheduling_tab.unnamed_staff_fallback")}
                                   </span>
                                </div>
                                
                                {viewInterval.map(day => {
                                    // Find shifts for this employee on this day
                                    const dayShifts = (shifts || [])
                                        .filter(s => s.employmentId === employee.id && isSameDay(parseISO(s.startTime), day))
                                        .filter(s => {
                                            if (viewMode === 'published') return s.isPublished;
                                            if (viewMode === 'draft') return !s.isPublished;
                                            return true;
                                        });

                                    return (
                                        <ContextMenu key={day.toString()}>
                                            <ContextMenuTrigger asChild>
                                                <div 
                                                    className={`p-2 border-r last:border-r-0 min-h-[80px] hover:bg-muted/10 transition-colors cursor-default ${
                                                        isSameDay(day, new Date()) ? 'bg-primary/5' : ''
                                                    }`}
                                                >
                                                    {dayShifts.map((shift) => {
                                                        const hasConflict = checkConflict(shift);
                                                        return (
                                                            <div 
                                                                key={shift.id}
                                                                onClick={() => handleEditShift(shift)}
                                                                className={`mb-1 p-1.5 transition-all border rounded text-[10px] sm:text-xs cursor-pointer flex flex-col gap-0.5 ${
                                                                    shift.status === ShiftStatus.NO_SHOW ? "border-red-500 ring-red-500/20 bg-red-50" :
                                                                    hasConflict ? "border-destructive ring-destructive/20 bg-destructive/5" :
                                                                    shift.isPublished
                                                                        ? "bg-primary/10 hover:bg-primary/20 ring-primary/20 border-primary/20"
                                                                        : "bg-amber-500/10 hover:bg-amber-500/20 ring-amber-500/20 border-amber-500/30 border-dashed"
                                                                } hover:ring-1`}
                                                                title={shift.status === ShiftStatus.NO_SHOW ? t("schedule_staff_scheduling_tab.tooltip_no_show") : hasConflict ? t("schedule_staff_scheduling_tab.tooltip_conflict") : shift.notes || (shift.isPublished ? t("schedule_staff_scheduling_tab.tooltip_published") : t("schedule_staff_scheduling_tab.tooltip_draft"))}
                                                            >
                                                                <div className="flex items-center justify-between gap-1">
                                                                    <div className={`font-semibold truncate ${shift.status === ShiftStatus.NO_SHOW ? 'text-red-700' : hasConflict ? 'text-destructive' : shift.status === ShiftStatus.VALIDATED ? 'text-green-700' : shift.isPublished ? 'text-primary' : 'text-amber-700'}`}>
                                                                        {formatInBusinessTimezone(shift.startTime, businessTz, 'HH:mm')} - {formatInBusinessTimezone(shift.endTime, businessTz, 'HH:mm')}
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        {shift.status === ShiftStatus.VALIDATED && <Lock className="w-2.5 h-2.5 text-green-600" />}
                                                                        {shift.status === ShiftStatus.NO_SHOW && <UserX className="w-2.5 h-2.5 text-red-600" />}
                                                                        {hasConflict && <Badge variant="destructive" className="h-3 w-3 p-0 flex items-center justify-center text-[8px] rounded-full">!</Badge>}
                                                                    </div>
                                                                </div>
                                                                <div className="text-[10px] text-muted-foreground mt-0.5 truncate flex flex-wrap gap-1 items-center justify-between">
                                                                    <div className="flex items-center gap-1">
                                                                        {getStatusBadge(shift.status, shift.staffResponse)}
                                                                        {!shift.isPublished && (
                                                                            <Badge variant="secondary" className="text-[7px] px-1 py-0 h-3 bg-amber-100 text-amber-700 hover:bg-amber-100 font-bold">{t("schedule_staff_scheduling_tab.status_draft")}</Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </ContextMenuTrigger>
                                            <ContextMenuContent className="w-48">
                                                <ContextMenuItem onClick={() => handleRightClick(employee.id, day)}>
                                                    {t("schedule_staff_scheduling_tab.context_add_new_shift")}
                                                </ContextMenuItem>

                                                {dayShifts.length > 0 && (
                                                    <>
                                                        <ContextMenuSeparator />
                                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{t("schedule_staff_scheduling_tab.context_shifts_count", { count: dayShifts.length })}</div>
                                                        {dayShifts.map(s => (
                                                            <div key={s.id}>
                                                                {s.status === ShiftStatus.COMPLETED && (
                                                                    <ContextMenuItem onClick={() => handleValidateShift(s)} className="pl-4 text-green-600 focus:text-green-700">
                                                                        <ShieldCheck className="w-4 h-4 mr-2" />
                                                                        {t("schedule_staff_scheduling_tab.context_validate_shift")}
                                                                    </ContextMenuItem>
                                                                )}
                                                                {s.status === ShiftStatus.NO_SHOW && canLogNoShow && (
                                                                    <ContextMenuItem onClick={() => handleLogAsWorked(s)} className="pl-4 text-red-600 focus:text-red-700">
                                                                        <ClipboardCheck className="w-4 h-4 mr-2" />
                                                                        {t("schedule_staff_scheduling_tab.context_log_as_worked")}
                                                                    </ContextMenuItem>
                                                                )}
                                                                <ContextMenuItem
                                                                    disabled={s.status === ShiftStatus.VALIDATED}
                                                                    onClick={() => handleEditShift(s)}
                                                                    className="pl-4"
                                                                >
                                                                    {t("schedule_staff_scheduling_tab.context_edit_at_time", { time: formatInBusinessTimezone(s.startTime, businessTz) })}
                                                                </ContextMenuItem>
                                                                <ContextMenuItem
                                                                    disabled={s.status === ShiftStatus.VALIDATED}
                                                                    onClick={() => handleDeleteShift(s.id)}
                                                                    className="pl-4 text-destructive focus:text-destructive"
                                                                >
                                                                    {t("schedule_staff_scheduling_tab.context_delete_at_time", { time: formatInBusinessTimezone(s.startTime, businessTz) })}
                                                                </ContextMenuItem>
                                                            </div>
                                                        ))}
                                                    </>
                                                )}
                                            </ContextMenuContent>
                                        </ContextMenu>
                                    );
                                })}
                            </div>
                        ))
                        }
                    </>
                )}

                    {/* Footer Row (Totals) */}
                    {!fetchingShifts && !fetchingEmployees && calendarView !== 'month' && (
                        <div className={`grid border-t bg-muted/20 sticky bottom-0 z-10 ${
                            calendarView === 'day' ? 'grid-cols-[200px_1fr]' : 
                            'grid-cols-[200px_repeat(7,1fr)]'
                        }`}>
                            <div className="p-3 text-xs font-bold border-r flex flex-col justify-center bg-muted/10">
                                <div>{t("schedule_staff_scheduling_tab.footer_daily_totals")}</div>
                                <div className="text-[10px] text-muted-foreground font-normal">{t("schedule_staff_scheduling_tab.footer_hrs_est_cost")}</div>
                            </div>
                            {viewInterval.map(day => {
                                const dayData = managerRoster?.find((r: any) => r.date === format(day, 'yyyy-MM-dd'));
                                return (
                                    <div key={day.toString()} className="p-2 border-r last:border-r-0 flex flex-col items-center justify-center text-center">
                                        <div className="text-xs font-bold">{dayData?.dailyTotalHours?.toFixed(1) || '0.0'}h</div>
                                        <div className="text-[10px] text-primary font-medium">{getCurrencySymbol(myBusinessFullDetails?.currency)}{dayData?.dailyTotalCost?.toFixed(2) || '0.00'}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </CardContent>

            <BulkScheduleModal open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen} />
            <BulkStaffWeeklySetupModal open={isBulkStaffModalOpen} onOpenChange={setIsBulkStaffModalOpen} />
            <IndividualScheduleModal
                open={isIndividualModalOpen}
                onOpenChange={setIsIndividualModalOpen}
                defaultEmploymentId={selectedEmployeeId}
                defaultDate={selectedDate}
                shift={selectedShift}
                canLogNoShow={canLogNoShow}
                onLogAsWorked={(shift) => {
                    setIsIndividualModalOpen(false);
                    handleLogAsWorked(shift);
                }}
            />

            <ValidationModal
                open={isValidationModalOpen}
                onOpenChange={setIsValidationModalOpen}
                attendanceId={validationAttendanceId}
                initialCheckIn={validationInitialCheckIn}
                initialCheckOut={validationInitialCheckOut}
            />

            <LogShiftWorkedModal
                open={isLogWorkedModalOpen}
                onOpenChange={setIsLogWorkedModalOpen}
                shift={logWorkedShift}
                businessId={businessId as string}
                onAlreadyHasAttendance={handleLogWorkedConflict}
            />
        </Card>
    )
}

export default ManagerScheduleStaffSchedulingTab