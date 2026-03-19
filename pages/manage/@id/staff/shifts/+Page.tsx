"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowRightLeft, Loader2, DollarSign, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { usePageContext } from "vike-react/usePageContext"
import { useShifts, useUpcomingShifts } from "@/features/shifts/useShifts"
import { useMyEmployments } from "@/features/business/employment/useMyEmployments"
import { Shift } from "@/models/business/shift/Shift"
import { format, parseISO, addDays, startOfDay } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useMemo, useEffect } from "react"
import { RequestTimeOffModal } from "@/components/management/schedule/RequestTimeOffModal"
import { RequestShiftSwapModal } from "@/components/management/schedule/RequestShiftSwapModal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTimeOff } from "@/features/shifts/useTimeOff"
import { useShiftSwaps } from "@/features/shifts/useShiftSwaps"
import { AttendanceDashboard } from "@/components/management/schedule/AttendanceDashboard"
import { StaffAvailabilityModal } from "@/components/management/schedule/StaffAvailabilityModal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function StaffShiftsPage() {
    const { routeParams, urlParsed } = usePageContext();
    const businessId = routeParams.id;

    const { myEmployments } = useMyEmployments();
    // In our SaaS, a user usually has one employment per business
    const activeEmployment = myEmployments?.find(e => e.business?.id === businessId);
    const employmentId = activeEmployment?.id || "";

    const { startDate, endDate } = useMemo(() => ({
        startDate: format(startOfDay(new Date()), 'yyyy-MM-dd'),
        endDate: format(addDays(new Date(), 30), 'yyyy-MM-dd')
    }), []);

    // Filters and Pagination state
    const [status, setStatus] = useState<string>("ALL");
    const [scheduleStartDate, setScheduleStartDate] = useState<string>(format(startOfDay(new Date()), 'yyyy-MM-dd'));
    const [scheduleEndDate, setScheduleEndDate] = useState<string>(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
    const [page, setPage] = useState(1);
    const limit = 10;

    const { 
        shifts, 
        fetchingShifts, 
        loadingShifts, 
        respondToShift, 
        isResponding,
        claimShift,
        isClaiming
    } = useShifts(
        businessId as string,
        startDate,
        endDate,
        employmentId
    );

    const { data: upcomingData, isFetching: fetchingUpcoming } = useUpcomingShifts({
        businessId: businessId as string,
        status: status === "ALL" ? undefined : status,
        startDate: scheduleStartDate,
        endDate: scheduleEndDate,
        page,
        limit,
    });

    const upcomingShifts = upcomingData?.data || [];
    const totalPages = upcomingData?.pages || 1;

    const { requests: timeOffRequests, fetchingRequests } = useTimeOff(businessId as string, employmentId);
    const { swaps: shiftSwaps, fetchingSwaps } = useShiftSwaps(businessId as string, employmentId);

    const [activeTab, setActiveTab] = useState(urlParsed.search.tab || "today");
    const [isTimeOffOpen, setIsTimeOffOpen] = useState(false);
    const [isSwapOpen, setIsSwapOpen] = useState(false);
    const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
    const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);

    // Sync tab with URL search params
    useEffect(() => {
        if (urlParsed.search.tab && urlParsed.search.tab !== activeTab) {
            setActiveTab(urlParsed.search.tab);
        }
    }, [urlParsed.search.tab]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [status, scheduleStartDate, scheduleEndDate]);

    // Handle 'date' param from notifications
    useEffect(() => {
        const dateFromUrl = urlParsed.search.date;
        if (dateFromUrl) {
            setScheduleStartDate(dateFromUrl);
            setScheduleEndDate(dateFromUrl);
            setActiveTab("schedule");
        }
    }, [urlParsed.search.date]);

    const visibleShifts = (shifts || []).filter(s => s.isPublished || s.isVirtual);
    const nextShift = visibleShifts[0];

    const handleSwap = (shiftId?: string) => {
        setSelectedShiftId(shiftId || null);
        setIsSwapOpen(true);
    };

    const handleResponse = (shiftId: string, response: 'ACCEPTED' | 'REJECTED') => {
        respondToShift({ shiftId, response });
    };

    return (
        <div className="space-y-6 p-6">
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Shifts</h1>
                    <p className="text-muted-foreground">Here’s your upcoming schedule and recent shifts.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsAvailabilityOpen(true)} disabled={!employmentId}>
                        <Calendar className="h-4 w-4" />
                        My Availability
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsTimeOffOpen(true)} disabled={!employmentId}>
                        <Calendar className="h-4 w-4" />
                        Request Time Off
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="schedule">Upcoming Schedule</TabsTrigger>
                    <TabsTrigger value="requests">Time Off & Swaps</TabsTrigger>
                </TabsList>

                <TabsContent value="today" className="space-y-6">
                    {/* Attendance Dashboard */}
                    {businessId && employmentId && (
                        <AttendanceDashboard businessId={businessId as string} employmentId={employmentId} />
                    )}

                    {/* Today's Shift Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Today's Shift</CardTitle>
                            <CardDescription>Details for your scheduled shifts today.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {loadingShifts ? (
                                <Skeleton className="h-20 w-full" />
                            ) : nextShift && format(parseISO(nextShift.startTime), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <span className="font-bold text-lg">{format(parseISO(nextShift.startTime), 'EEEE, MMM d')}</span>
                                            <p className="text-sm text-muted-foreground">
                                                {format(parseISO(nextShift.startTime), 'hh:mm a')} - {format(parseISO(nextShift.endTime), 'hh:mm a')}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            {nextShift.isVirtual && <Badge variant="secondary">VIRTUAL</Badge>}
                                            <Badge variant={nextShift.staffResponse === 'ACCEPTED' ? 'default' : 'secondary'}>
                                                {nextShift.staffResponse || 'PENDING'}
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    {nextShift.notes && (
                                        <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground italic">
                                            " {nextShift.notes} "
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        {!nextShift.isVirtual ? (
                                            <>
                                                {(nextShift.staffResponse === 'PENDING' || !nextShift.staffResponse) && (
                                                    <Button size="sm" onClick={() => handleResponse(nextShift.id, 'ACCEPTED')} disabled={isResponding}>Accept Shift</Button>
                                                )}
                                                <Button size="sm" variant="outline" onClick={() => handleSwap(nextShift.id)}>Swap Shift</Button>
                                            </>
                                        ) : (
                                            <p className="text-xs text-muted-foreground italic">Scheduled Projection</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
                                    <Calendar className="h-8 w-8 opacity-20" />
                                    <p>No shift scheduled for today.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-6">
                    {/* Open Shifts Bidding Section */}
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-primary/10 rounded-full">
                                    <ArrowRightLeft className="h-4 w-4 text-primary" />
                                </div>
                                <CardTitle className="text-lg">Open Shifts Available</CardTitle>
                            </div>
                            <CardDescription>Pick up extra hours by claiming these unclaimed shifts.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {(shifts || []).filter(s => s.status === 'OPEN').length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg bg-background/50">
                                    No open shifts currently available for bidding.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(shifts || []).filter(s => s.status === 'OPEN').map(shift => (
                                        <Card key={shift.id} className="bg-background shadow-sm hover:shadow-md transition-shadow">
                                            <CardContent className="p-4 flex flex-col justify-between h-full gap-4">
                                                <div>
                                                    <div className="font-semibold text-lg">{format(parseISO(shift.startTime), 'EEEE, MMM d')}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {format(parseISO(shift.startTime), 'hh:mm a')} - {format(parseISO(shift.endTime), 'hh:mm a')}
                                                    </div>
                                                    {shift.estimatedCost && (
                                                        <div className="mt-2 flex items-center gap-1 text-sm font-medium text-emerald-600">
                                                            <DollarSign className="h-3 w-3" />
                                                            <span>{shift.estimatedCost} {shift.currency || 'EUR'}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <Button 
                                                    className="w-full" 
                                                    onClick={() => claimShift(shift.id)}
                                                    disabled={isClaiming}
                                                >
                                                    {isClaiming ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                    Claim Shift
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Upcoming Schedule</CardTitle>
                                    <CardDescription>Your scheduled shifts for the selected period.</CardDescription>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-3 w-full lg:w-auto">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="status-filter" className="text-[10px] uppercase text-muted-foreground font-semibold">Status</Label>
                                        <Select value={status} onValueChange={setStatus}>
                                            <SelectTrigger id="status-filter" className="w-full h-9">
                                                <SelectValue placeholder="All Statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ALL">All Statuses</SelectItem>
                                                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="start-date" className="text-[10px] uppercase text-muted-foreground font-semibold">From</Label>
                                        <Input 
                                            id="start-date"
                                            type="date" 
                                            value={scheduleStartDate} 
                                            onChange={(e) => setScheduleStartDate(e.target.value)}
                                            className="w-full h-9"
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="end-date" className="text-[10px] uppercase text-muted-foreground font-semibold">To</Label>
                                        <Input 
                                            id="end-date"
                                            type="date" 
                                            value={scheduleEndDate} 
                                            onChange={(e) => setScheduleEndDate(e.target.value)}
                                            className="w-full h-9"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Estimated Cost</TableHead>
                                            <TableHead>Response</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fetchingUpcoming ? (
                                            <TableRow><TableCell colSpan={6} className="text-center py-8">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Loading shifts...</span>
                                                </div>
                                            </TableCell></TableRow>
                                        ) : upcomingShifts.length === 0 ? (
                                            <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
                                                <Calendar className="h-8 w-8 opacity-20" />
                                                <p>No shifts found for the selected filters.</p>
                                            </TableCell></TableRow>
                                        ) : (
                                            upcomingShifts.map((shift: Shift) => (
                                                <TableRow key={shift.id}>
                                                    <TableCell className="font-medium">{format(parseISO(shift.startTime), 'EEE, MMM d')}</TableCell>
                                                    <TableCell>
                                                        {format(parseISO(shift.startTime), 'hh:mm a')} - {format(parseISO(shift.endTime), 'hh:mm a')}
                                                    </TableCell>
                                                    <TableCell>
                                                        {shift.estimatedCost ? (
                                                            <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                                                                <span>{shift.estimatedCost}</span>
                                                                <span className="text-[10px] text-muted-foreground uppercase">{shift.currency || 'EUR'}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {shift.isVirtual ? (
                                                            <Badge variant="secondary">VIRTUAL</Badge>
                                                        ) : shift.staffResponse ? (
                                                            <Badge variant={shift.staffResponse === 'ACCEPTED' ? 'outline' : 'destructive'} className={shift.staffResponse === 'ACCEPTED' ? 'border-emerald-500 text-emerald-600' : ''}>
                                                                {shift.staffResponse}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary">PENDING</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell><Badge variant="outline">{shift.isVirtual ? 'PROJECTED' : shift.status}</Badge></TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {!shift.isVirtual && (
                                                                <>
                                                                    {(shift.staffResponse === 'PENDING' || !shift.staffResponse) && (
                                                                        <Button variant="ghost" size="sm" onClick={() => handleResponse(shift.id, 'ACCEPTED')} disabled={isResponding} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">Accept</Button>
                                                                    )}
                                                                    <Button variant="ghost" size="sm" onClick={() => handleSwap(shift.id)}>
                                                                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                                                                        Swap
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Showing page {page} of {totalPages}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => setPage(p => Math.max(1, p - 1))} 
                                            disabled={page <= 1}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Previous
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                                            disabled={page >= totalPages}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="requests" className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Time Off Requests</CardTitle>
                                <CardDescription>Manage your requested time off.</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => setIsTimeOffOpen(true)} disabled={!employmentId}>
                                <Calendar className="h-4 w-4 mr-2" />
                                New Request
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Dates</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fetchingRequests ? (
                                        <TableRow><TableCell colSpan={3} className="text-center py-4">Loading requests...</TableCell></TableRow>
                                    ) : (timeOffRequests || []).length === 0 ? (
                                        <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">No time off requests found.</TableCell></TableRow>
                                    ) : (
                                        (timeOffRequests || []).map(req => (
                                            <TableRow key={req.id}>
                                                <TableCell className="text-sm">
                                                    {format(parseISO(req.startDate), 'MMM d, yyyy')} - {format(parseISO(req.endDate), 'MMM d, yyyy')}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate">{req.reason}</TableCell>
                                                <TableCell>
                                                    <Badge variant={req.status === 'APPROVED' ? 'default' : req.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                                                        {req.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Shift Swaps</CardTitle>
                            <CardDescription>Status of your shift swap requests.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Shift</TableHead>
                                        <TableHead>Involving</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fetchingSwaps ? (
                                        <TableRow><TableCell colSpan={3} className="text-center py-4">Loading swaps...</TableCell></TableRow>
                                    ) : (shiftSwaps || []).length === 0 ? (
                                        <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">No shift swaps found.</TableCell></TableRow>
                                    ) : (
                                        (shiftSwaps || []).map(swap => (
                                            <TableRow key={swap.id}>
                                                <TableCell className="text-sm">
                                                    {swap.shift ? `${format(parseISO(swap.shift.startTime), 'MMM d')}: ${format(parseISO(swap.shift.startTime), 'HH:mm')} - ${format(parseISO(swap.shift.endTime), 'HH:mm')}` : 'Unknown Shift'}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {swap.fromEmploymentId === employmentId ? `With: ${swap.toEmployment?.professionalProfile?.displayName || 'Colleague'}` : `From: ${swap.fromEmployment?.professionalProfile?.displayName || 'Colleague'}`}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={swap.status === 'APPROVED' ? 'default' : swap.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                                                        {swap.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <RequestTimeOffModal 
                open={isTimeOffOpen} 
                onOpenChange={setIsTimeOffOpen} 
                employmentId={employmentId} 
            />
            
            <RequestShiftSwapModal 
                open={isSwapOpen} 
                onOpenChange={setIsSwapOpen} 
                currentEmploymentId={employmentId}
                initialShiftId={selectedShiftId}
            />

            <StaffAvailabilityModal
                isOpen={isAvailabilityOpen}
                onClose={() => setIsAvailabilityOpen(false)}
                employmentId={employmentId}
            />
        </div>
    )
}
