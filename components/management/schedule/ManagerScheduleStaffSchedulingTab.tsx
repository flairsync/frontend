import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Users, CalendarPlus, Wand2, Copy, Send, Settings2, PlusCircle, CheckCircle2, Lock, ShieldCheck } from 'lucide-react'
import { usePageContext } from 'vike-react/usePageContext'
import { useBusinessEmployees } from '@/features/business/employment/useBusinessEmployees'
import { useShifts } from '@/features/shifts/useShifts'
import { useTimeOff } from '@/features/shifts/useTimeOff'
import { useUnvalidatedSummary } from '@/features/shifts/useUnvalidatedSummary'
import { useManagerRoster } from '@/features/shifts/useShifts'
import { useMyBusiness } from '@/features/business/useMyBusiness'
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
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Shift } from '@/models/business/shift/Shift'
import { startOfWeek, endOfWeek, addDays, format, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, startOfDay, endOfDay, addMonths, isSameMonth } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ValidationModal } from './ValidationModal'
import { ShiftStatus } from '@/models/business/shift/Shift'

const ManagerScheduleStaffSchedulingTab = () => {
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

    // Data
    const { employees: allEmployees, isPending: fetchingEmployees } = useBusinessEmployees(businessId);
    const employees = allEmployees?.filter(emp => emp.type !== 'OWNER') || [];
    const { 
        shifts, 
        fetchingShifts, 
        generateWeeklyDraft,
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
        if (confirm("Are you sure you want to delete this shift?")) {
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

    const getStatusBadge = (status: ShiftStatus, staffResponse?: string) => {
        switch (status) {
            case ShiftStatus.SCHEDULED:
                if (staffResponse === 'ACCEPTED') {
                    return (
                        <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-emerald-500 bg-emerald-50 text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-2 h-2" />
                            Accepted
                        </Badge>
                    );
                }
                if (staffResponse === 'REJECTED') {
                    return (
                        <Badge variant="destructive" className="text-[8px] px-1 py-0 h-3.5 bg-red-50 text-red-700 border-red-200">
                            Rejected
                        </Badge>
                    );
                }
                return <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5 bg-gray-100 text-gray-600 font-normal">Pending</Badge>;
            case ShiftStatus.IN_PROGRESS:
                return (
                    <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-green-200 bg-green-50 text-green-700 flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                        Ongoing
                    </Badge>
                );
            case ShiftStatus.COMPLETED:
                return <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-amber-200 bg-amber-50 text-amber-700">Finished</Badge>;
            case ShiftStatus.VALIDATED:
                return (
                    <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-green-500 bg-green-50 text-green-700 flex items-center gap-1">
                        <CheckCircle2 className="w-2 h-2" />
                        Validated
                    </Badge>
                );
            case ShiftStatus.OPEN:
                return (
                    <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-orange-500 bg-orange-50 text-orange-700 font-bold uppercase">
                        OPEN
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
        generateWeeklyDraft(format(dateStart, 'yyyy-MM-dd'));
    };

    const handleCopyWeek = () => {
        const prevWeekStart = addDays(dateStart, -7);
        copyPreviousWeek({
            sourceWeekStart: format(prevWeekStart, 'yyyy-MM-dd'),
            targetWeekStart: format(dateStart, 'yyyy-MM-dd')
        });
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between bg-muted/30 pb-4 border-b gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <CardTitle>Schedule</CardTitle>
                    <div className="flex items-center gap-2 bg-background border rounded-md">
                        <Button variant="ghost" size="icon" onClick={handlePrev}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium w-40 text-center cursor-default">
                            {calendarView === 'day' ? format(currentDate, 'MMM d, yyyy') :
                             calendarView === 'month' ? format(currentDate, 'MMMM yyyy') :
                             `${format(dateStart, 'MMM d')} - ${format(dateEnd, 'MMM d, yyyy')}`}
                        </span>
                        <Button variant="ghost" size="icon" onClick={handleNext}>
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
                                {view}
                            </Button>
                        ))}
                    </div>

                    <div className="w-48">
                        <Select 
                            value={filterStaffId || "all"} 
                            onValueChange={(val: string) => setFilterStaffId(val === "all" ? null : val)}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="All Staff" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Staff</SelectItem>
                                {employees.map(emp => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                        {emp.professionalProfile?.displayName || emp.professionalProfile?.firstName || 'Staff'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {phantomSummary && phantomSummary.total > 0 && (
                        <Badge variant="outline" className="h-7 px-3 border-amber-200 bg-amber-50 text-amber-700 flex items-center gap-1.5 font-medium animate-in fade-in slide-in-from-left-2 duration-500">
                             <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                             {phantomSummary.total} Phantom Shifts (Next 4 weeks)
                        </Badge>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <PlusCircle className="w-4 h-4" />
                                Scheduling Tools
                                <ChevronRight className="w-3 h-3 rotate-90" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Manual Entry</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setIsBulkStaffModalOpen(true)}>
                                <CalendarPlus className="w-4 h-4 mr-2" />
                                Bulk Staff Setup
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsBulkModalOpen(true)}>
                                <Users className="w-4 h-4 mr-2" />
                                Schedule Team
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="default" size="sm" className="gap-2">
                                <Settings2 className="w-4 h-4" />
                                Weekly Actions
                                <ChevronRight className="w-3 h-3 rotate-90" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Automation</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleGenerate} disabled={isGeneratingDraft}>
                                <Wand2 className="w-4 h-4 mr-2" />
                                {isGeneratingDraft ? "Generating..." : "Generate Draft"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleCopyWeek} disabled={isCopyingWeek}>
                                <Copy className="w-4 h-4 mr-2" />
                                {isCopyingWeek ? "Copying..." : "Copy Previous Week"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Finalize</DropdownMenuLabel>
                            <DropdownMenuItem onClick={handlePublish} disabled={isPublishing} className="text-primary focus:text-primary">
                                <Send className="w-4 h-4 mr-2" />
                                {isPublishing ? "Publishing..." : calendarView === 'week' ? "Publish Week" : "Publish Range"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto min-h-[400px]">
                <div className="min-w-[800px]">
                    {/* Header Row */}
                    <div className={`grid border-b bg-muted/10 ${
                        calendarView === 'month' ? 'grid-cols-7' : 
                        calendarView === 'day' ? 'grid-cols-[200px_1fr]' : 
                        'grid-cols-[200px_repeat(7,1fr)]'
                    }`}>
                        {calendarView !== 'month' && (
                            <div className="p-3 font-semibold text-sm border-r flex items-center justify-center text-center">
                                Staff Member
                            </div>
                        )}
                        {calendarView === 'month' ? (
                            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(dayName => (
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
                        <div className="p-8 text-center text-muted-foreground animate-pulse">Loading schedule...</div>
                    ) : employees?.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No employees found.</div>
                    ) : calendarView === 'month' && !filterStaffId ? (
                         <div className="p-12 text-center text-muted-foreground">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">Monthly Overview</p>
                            <p className="text-sm">Please select a staff member to view their monthly schedule.</p>
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
                                                                    hasConflict ? "border-destructive ring-destructive/20 bg-destructive/5" :
                                                                    shift.status === ShiftStatus.VALIDATED
                                                                        ? "bg-green-500/10 border-green-500/20 ring-green-500/20" :
                                                                    shift.isPublished 
                                                                        ? "bg-primary/10 hover:bg-primary/20 ring-primary/20 border-primary/20" 
                                                                        : "bg-amber-500/10 hover:bg-amber-500/20 ring-amber-500/20 border-amber-500/30 border-dashed"
                                                                } hover:ring-1`}
                                                                title={hasConflict ? 'CONFLICT: Employee has approved time off' : shift.notes || (shift.isPublished ? 'Published' : 'Draft')}
                                                            >
                                                                <div className="flex items-center justify-between gap-1">
                                                                    <div className={`font-semibold truncate ${hasConflict ? 'text-destructive' : shift.status === ShiftStatus.VALIDATED ? 'text-green-700' : shift.isPublished ? 'text-primary' : 'text-amber-700'}`}>
                                                                        {formatInBusinessTimezone(shift.startTime, businessTz)} - {formatInBusinessTimezone(shift.endTime, businessTz)}
                                                                    </div>
                                                                    {shift.status === ShiftStatus.VALIDATED && <Lock className="w-2 h-2 text-green-600" />}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </ContextMenuTrigger>
                                            <ContextMenuContent className="w-48">
                                                <ContextMenuItem onClick={() => handleRightClick(employee.id, day)}>
                                                    Add New Shift
                                                </ContextMenuItem>
                                                                {dayShifts.length > 0 && (
                                                                    <>
                                                                        <ContextMenuSeparator />
                                                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Shifts ({dayShifts.length})</div>
                                                                        {dayShifts.map(s => (
                                                                            <div key={s.id}>
                                                                                {s.status === ShiftStatus.COMPLETED && (
                                                                                    <ContextMenuItem onClick={() => handleValidateShift(s)} className="pl-4 text-green-600 focus:text-green-700">
                                                                                        <ShieldCheck className="w-4 h-4 mr-2" />
                                                                                        Validate Shift
                                                                                    </ContextMenuItem>
                                                                                )}
                                                                                <ContextMenuItem disabled={s.status === ShiftStatus.VALIDATED} onClick={() => handleEditShift(s)} className="pl-4">
                                                                                    Edit {formatInBusinessTimezone(s.startTime, businessTz)}
                                                                                </ContextMenuItem>
                                                                                <ContextMenuItem disabled={s.status === ShiftStatus.VALIDATED} onClick={() => handleDeleteShift(s.id)} className="pl-4 text-destructive focus:text-destructive">
                                                                                    Delete {formatInBusinessTimezone(s.startTime, businessTz)}
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
                                        OPEN / VACANT
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
                                                                <Badge variant="outline" className="text-[7px] px-1 py-0 h-3 bg-white border-orange-200 text-orange-700 font-bold uppercase">OPEN</Badge>
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
                                                    Create Open Shift
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
                                        {employee.professionalProfile?.displayName || employee.professionalProfile?.firstName || 'Unnamed Staff'}
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
                                                                    hasConflict ? "border-destructive ring-destructive/20 bg-destructive/5" :
                                                                    shift.isPublished 
                                                                        ? "bg-primary/10 hover:bg-primary/20 ring-primary/20 border-primary/20" 
                                                                        : "bg-amber-500/10 hover:bg-amber-500/20 ring-amber-500/20 border-amber-500/30 border-dashed"
                                                                } hover:ring-1`}
                                                                title={hasConflict ? 'CONFLICT: Employee has approved time off' : shift.notes || (shift.isPublished ? 'Published' : 'Draft')}
                                                            >
                                                                <div className="flex items-center justify-between gap-1">
                                                                    <div className={`font-semibold truncate ${hasConflict ? 'text-destructive' : shift.status === ShiftStatus.VALIDATED ? 'text-green-700' : shift.isPublished ? 'text-primary' : 'text-amber-700'}`}>
                                                                        {formatInBusinessTimezone(shift.startTime, businessTz, 'HH:mm')} - {formatInBusinessTimezone(shift.endTime, businessTz, 'HH:mm')}
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        {shift.status === ShiftStatus.VALIDATED && <Lock className="w-2.5 h-2.5 text-green-600" />}
                                                                        {hasConflict && <Badge variant="destructive" className="h-3 w-3 p-0 flex items-center justify-center text-[8px] rounded-full">!</Badge>}
                                                                    </div>
                                                                </div>
                                                                <div className="text-[10px] text-muted-foreground mt-0.5 truncate flex flex-wrap gap-1 items-center justify-between">
                                                                    <div className="flex items-center gap-1">
                                                                        {getStatusBadge(shift.status, shift.staffResponse)}
                                                                        {!shift.isPublished && (
                                                                            <Badge variant="secondary" className="text-[7px] px-1 py-0 h-3 bg-amber-100 text-amber-700 hover:bg-amber-100 font-bold">DRAFT</Badge>
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
                                                    Add New Shift
                                                </ContextMenuItem>
                                                
                                                {dayShifts.length > 0 && (
                                                    <>
                                                        <ContextMenuSeparator />
                                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Shifts ({dayShifts.length})</div>
                                                        {dayShifts.map(s => (
                                                            <div key={s.id}>
                                                                {s.status === ShiftStatus.COMPLETED && (
                                                                    <ContextMenuItem onClick={() => handleValidateShift(s)} className="pl-4 text-green-600 focus:text-green-700">
                                                                        <ShieldCheck className="w-4 h-4 mr-2" />
                                                                        Validate Shift
                                                                    </ContextMenuItem>
                                                                )}
                                                                <ContextMenuItem 
                                                                    disabled={s.status === ShiftStatus.VALIDATED}
                                                                    onClick={() => handleEditShift(s)}
                                                                    className="pl-4"
                                                                >
                                                                    Edit {formatInBusinessTimezone(s.startTime, businessTz)}
                                                                </ContextMenuItem>
                                                                <ContextMenuItem 
                                                                    disabled={s.status === ShiftStatus.VALIDATED}
                                                                    onClick={() => handleDeleteShift(s.id)}
                                                                    className="pl-4 text-destructive focus:text-destructive"
                                                                >
                                                                    Delete {formatInBusinessTimezone(s.startTime, businessTz)}
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
                                <div>DAILY TOTALS</div>
                                <div className="text-[10px] text-muted-foreground font-normal">Hrs / Est. Cost</div>
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
            />

            <ValidationModal
                open={isValidationModalOpen}
                onOpenChange={setIsValidationModalOpen}
                attendanceId={validationAttendanceId}
                initialCheckIn={validationInitialCheckIn}
                initialCheckOut={validationInitialCheckOut}
            />
        </Card>
    )
}

export default ManagerScheduleStaffSchedulingTab