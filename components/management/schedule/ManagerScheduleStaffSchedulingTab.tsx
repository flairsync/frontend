import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Users, CalendarPlus, Wand2, Copy, Send, Settings2, PlusCircle } from 'lucide-react'
import { usePageContext } from 'vike-react/usePageContext'
import { useBusinessEmployees } from '@/features/business/employment/useBusinessEmployees'
import { useShifts } from '@/features/shifts/useShifts'
import { useTimeOff } from '@/features/shifts/useTimeOff'
import { useUnvalidatedSummary } from '@/features/shifts/useUnvalidatedSummary'
import { useManagerRoster } from '@/features/shifts/useShifts'
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

const ManagerScheduleStaffSchedulingTab = () => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    // View state
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week');
    const [filterStaffId, setFilterStaffId] = useState<string | null>(null);

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
        const approvedRequests = timeOffRequests?.filter((r: any) => r.status === 'APPROVED' && r.employmentId === shift.employmentId) || [];
        const shiftStart = parseISO(shift.startTime);
        const shiftEnd = parseISO(shift.endTime);

        return approvedRequests.some((r: any) => {
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
                            onValueChange={(val) => setFilterStaffId(val === "all" ? null : val)}
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
                            viewInterval.map(day => (
                                <div key={day.toString()} className="p-3 font-semibold text-sm text-center border-r last:border-r-0">
                                    <div>{format(day, 'EEE')}</div>
                                    <div className="text-muted-foreground font-normal text-xs mt-0.5">{format(day, 'MMM d')}</div>
                                </div>
                            ))
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
                                                    }`}
                                                >
                                                    <div className="text-[10px] text-muted-foreground mb-1 text-right">{format(day, 'd')}</div>
                                                    {dayShifts.map((shift) => {
                                                        const hasConflict = checkConflict(shift);
                                                        return (
                                                            <div 
                                                                key={shift.id}
                                                                onClick={() => handleEditShift(shift)}
                                                                className={`mb-1 p-1.5 transition-all border rounded text-[10px] sm:text-xs cursor-pointer flex flex-col gap-0.5 ${
                                                                    hasConflict ? "border-destructive ring-destructive/20 bg-destructive/5" :
                                                                    shift.isVirtual
                                                                        ? "bg-muted/50 border-muted-foreground/30 border-dashed opacity-70 grayscale-[0.5]" :
                                                                    shift.isPublished 
                                                                        ? "bg-primary/10 hover:bg-primary/20 ring-primary/20 border-primary/20" 
                                                                        : "bg-amber-500/10 hover:bg-amber-500/20 ring-amber-500/20 border-amber-500/30 border-dashed"
                                                                } hover:ring-1`}
                                                                title={shift.isVirtual ? 'VIRTUAL: Projected from regular rules. Not yet real.' : hasConflict ? 'CONFLICT: Employee has approved time off' : shift.notes || (shift.isPublished ? 'Published' : 'Draft')}
                                                            >
                                                                <div className="flex items-center justify-between gap-1">
                                                                    <div className={`font-semibold truncate ${hasConflict ? 'text-destructive' : shift.isPublished ? 'text-primary' : 'text-amber-700'}`}>
                                                                        {format(parseISO(shift.startTime), 'HH:mm')} - {format(parseISO(shift.endTime), 'HH:mm')}
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
                                                                <ContextMenuItem disabled={s.isVirtual} onClick={() => handleEditShift(s)} className="pl-4">
                                                                    Edit {format(parseISO(s.startTime), 'HH:mm')}
                                                                </ContextMenuItem>
                                                                <ContextMenuItem disabled={s.isVirtual} onClick={() => handleDeleteShift(s.id)} className="pl-4 text-destructive focus:text-destructive">
                                                                    Delete {format(parseISO(s.startTime), 'HH:mm')}
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
                        (filterStaffId ? employees.filter(e => e.id === filterStaffId) : employees).map(employee => (
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
                                                    className="p-2 border-r last:border-r-0 min-h-[80px] hover:bg-muted/10 transition-colors cursor-default"
                                                >
                                                    {dayShifts.map((shift) => {
                                                        const hasConflict = checkConflict(shift);
                                                        return (
                                                            <div 
                                                                key={shift.id}
                                                                onClick={() => handleEditShift(shift)}
                                                                className={`mb-1 p-1.5 transition-all border rounded text-[10px] sm:text-xs cursor-pointer flex flex-col gap-0.5 ${
                                                                    hasConflict ? "border-destructive ring-destructive/20 bg-destructive/5" :
                                                                    shift.isVirtual
                                                                        ? "bg-muted/50 border-muted-foreground/30 border-dashed opacity-70 grayscale-[0.5]" :
                                                                    shift.isPublished 
                                                                        ? "bg-primary/10 hover:bg-primary/20 ring-primary/20 border-primary/20" 
                                                                        : "bg-amber-500/10 hover:bg-amber-500/20 ring-amber-500/20 border-amber-500/30 border-dashed"
                                                                } hover:ring-1`}
                                                                title={shift.isVirtual ? 'VIRTUAL: Projected from regular rules. Not yet real.' : hasConflict ? 'CONFLICT: Employee has approved time off' : shift.notes || (shift.isPublished ? 'Published' : 'Draft')}
                                                            >
                                                                <div className="flex items-center justify-between gap-1">
                                                                    <div className={`font-semibold truncate ${hasConflict ? 'text-destructive' : shift.isPublished ? 'text-primary' : 'text-amber-700'}`}>
                                                                        {format(parseISO(shift.startTime), 'HH:mm')} - {format(parseISO(shift.endTime), 'HH:mm')}
                                                                    </div>
                                                                    {hasConflict && <Badge variant="destructive" className="h-3 w-3 p-0 flex items-center justify-center text-[8px] rounded-full">!</Badge>}
                                                                </div>
                                                                <div className="text-[10px] text-muted-foreground mt-0.5 truncate flex flex-wrap gap-1 items-center justify-between">
                                                                    <div className="flex items-center gap-1">
                                                                        {shift.status !== 'SCHEDULED' && (
                                                                            <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5">{shift.status}</Badge>
                                                                        )}
                                                                        {!shift.isPublished && !shift.isVirtual && (
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
                                                                <ContextMenuItem 
                                                                    disabled={s.isVirtual}
                                                                    onClick={() => handleEditShift(s)}
                                                                    className="pl-4"
                                                                >
                                                                    Edit {format(parseISO(s.startTime), 'HH:mm')}
                                                                </ContextMenuItem>
                                                                <ContextMenuItem 
                                                                    disabled={s.isVirtual}
                                                                    onClick={() => handleDeleteShift(s.id)}
                                                                    className="pl-4 text-destructive focus:text-destructive"
                                                                >
                                                                    Delete {format(parseISO(s.startTime), 'HH:mm')}
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
                                        <div className="text-[10px] text-primary font-medium">€{dayData?.dailyTotalCost?.toFixed(2) || '0.00'}</div>
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
        </Card>
    )
}

export default ManagerScheduleStaffSchedulingTab