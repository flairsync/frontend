"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowRightLeft, Loader2, DollarSign, ChevronLeft, ChevronRight, Filter, CheckCircle2, Lock, ShieldCheck, Clock, Info, UserX, ClipboardCheck } from "lucide-react"
import { usePageContext } from "vike-react/usePageContext"
import { navigate } from "vike/client/router"
import { toast } from "sonner"
import { useShifts, useUpcomingShifts, useAvailableShifts, useMyBids } from "@/features/shifts/useShifts"
import { useMyEmployments } from "@/features/business/employment/useMyEmployments"
import { useBusinessBasicDetails } from "@/features/business/useBusinessBasicDetails"
import { usePermissions } from "@/features/auth/usePermissions"
import { formatInBusinessTimezone, formatTimeInBusinessTimezone } from "@/utils/date-utils"
import { getCurrencySymbol } from "@/utils/currency"
import { Shift, ShiftStatus } from "@/models/business/shift/Shift"
import { format, parseISO, addDays, startOfDay, differenceInHours } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useMemo, useEffect } from "react"
import { RequestTimeOffModal } from "@/components/management/schedule/RequestTimeOffModal"
import { RequestShiftSwapModal } from "@/components/management/schedule/RequestShiftSwapModal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTimeOff } from "@/features/shifts/useTimeOff"
import { useShiftSwaps } from "@/features/shifts/useShiftSwaps"
import { AttendanceDashboard } from "@/components/management/schedule/AttendanceDashboard"
import { useTodayAttendanceDashboard } from "@/features/shifts/useAttendance"
import { StaffAvailabilityModal } from "@/components/management/schedule/StaffAvailabilityModal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ValidationModal } from "@/components/management/schedule/ValidationModal"
import { LogShiftWorkedModal } from "@/components/management/schedule/LogShiftWorkedModal"
import { useTranslation } from "react-i18next"

export default function StaffShiftsPage() {
    const { t } = useTranslation("management");
    const { routeParams, urlParsed } = usePageContext();
    const businessId = routeParams.id;

    const { myEmployments } = useMyEmployments();
    // In our SaaS, a user usually has one employment per business
    const activeEmployment = myEmployments?.find(e => e.business?.id === businessId);
    const employmentId = activeEmployment?.id || "";
    const isManagerOrOwner = activeEmployment?.type === 'OWNER' || activeEmployment?.type === 'MANAGER';

    const { businessBasicDetails } = useBusinessBasicDetails(businessId as string);
    const businessTz = businessBasicDetails?.timezone || 'UTC';

    const { hasPermission } = usePermissions(businessId as string);
    const canLogNoShow = hasPermission('STAFF', 'update');

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

    // Personal shifts via the permission-free /upcoming endpoint
    const { data: myShiftsData, isFetching: fetchingShifts, isLoading: loadingShifts } = useUpcomingShifts({
        businessId: businessId as string,
        startDate,
        endDate,
    });
    const shifts = Array.isArray(myShiftsData) ? myShiftsData : (myShiftsData?.data || []);

    const { data: upcomingData, isFetching: fetchingUpcoming, refetch: refetchUpcoming } = useUpcomingShifts({
        businessId: businessId as string,
        status: status === "ALL" ? undefined : status,
        startDate: scheduleStartDate,
        endDate: scheduleEndDate,
        page,
        limit,
    });

    const upcomingShifts = Array.isArray(upcomingData) ? upcomingData : (upcomingData?.data || []);
    const totalPages = Array.isArray(upcomingData) ? 1 : (upcomingData?.pages || 1);

    const { data: dashboard } = useTodayAttendanceDashboard(businessId as string);
    const isCheckedOut = !!dashboard?.attendance?.checkOutTime;

    const [activeTab, setActiveTab] = useState(urlParsed.search.tab || "today");

    const { requests: timeOffRequests, fetchingRequests } = useTimeOff(businessId as string, employmentId, { enabled: activeTab === "requests" });
    const { swaps: shiftSwaps, fetchingSwaps } = useShiftSwaps(businessId as string, employmentId, { enabled: activeTab === "requests" });

    const { data: availableShifts, isLoading: loadingAvailable } = useAvailableShifts(businessId as string);
    const { data: myBids, isLoading: loadingMyBids } = useMyBids();
    const { claimShift, isClaiming, respondToShift, isResponding, bidOnShift, isBidding } = useShifts(businessId as string);
    const [isTimeOffOpen, setIsTimeOffOpen] = useState(false);
    const [isSwapOpen, setIsSwapOpen] = useState(false);
    const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
    const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
    const [submittingBidId, setSubmittingBidId] = useState<string | null>(null);

    // Validation State
    const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
    const [validationAttendanceId, setValidationAttendanceId] = useState("");
    const [validationInitialCheckIn, setValidationInitialCheckIn] = useState("");
    const [validationInitialCheckOut, setValidationInitialCheckOut] = useState("");

    // No-show resolution state
    const [isLogWorkedModalOpen, setIsLogWorkedModalOpen] = useState(false);
    const [logWorkedShift, setLogWorkedShift] = useState<Shift | null>(null);

    // Sync tab with URL search params
    useEffect(() => {
        const tab = urlParsed.search.tab || "today";
        if (tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [urlParsed.search.tab, activeTab]);

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

    const visibleShifts = (shifts || []).filter(s => s.isPublished);
    const nextShift = visibleShifts[0];

    const handleSwap = (shiftId?: string) => {
        setSelectedShiftId(shiftId || null);
        setIsSwapOpen(true);
    };

    const handleResponse = (shiftId: string, response: 'ACCEPTED' | 'REJECTED') => {
        respondToShift({ shiftId, response });
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

    const handleLogWorkedConflict = async (shiftId: string) => {
        const refetched = await refetchUpcoming();
        const refetchedShifts: Shift[] = Array.isArray(refetched.data) ? refetched.data : (refetched.data?.data || []);
        const updatedShift = refetchedShifts.find((s) => s.id === shiftId);
        if (updatedShift?.attendanceId) {
            handleValidateShift(updatedShift);
        } else {
            toast.info(t("schedule_staff_scheduling_tab.toast_already_has_attendance"));
        }
    };

    const getStatusBadge = (status: ShiftStatus) => {
        switch (status) {
            case ShiftStatus.SCHEDULED:
                return <Badge variant="secondary" className="bg-gray-100 text-gray-600">{t("schedule_staff_scheduling_tab.status_pending")}</Badge>;
            case ShiftStatus.IN_PROGRESS:
                return (
                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        {t("schedule_staff_scheduling_tab.status_ongoing")}
                    </Badge>
                );
            case ShiftStatus.COMPLETED:
                return <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">{t("schedule_staff_scheduling_tab.status_finished")}</Badge>;
            case ShiftStatus.VALIDATED:
                return (
                    <Badge variant="outline" className="border-green-500 bg-green-50 text-green-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {t("schedule_staff_scheduling_tab.status_validated")}
                    </Badge>
                );
            case ShiftStatus.NO_SHOW:
                return (
                    <Badge variant="outline" className="border-red-500 bg-red-50 text-red-700 flex items-center gap-1">
                        <UserX className="w-3 h-3" />
                        {t("schedule_staff_scheduling_tab.status_no_show")}
                    </Badge>
                );
            case ShiftStatus.OPEN:
                return (
                    <Badge variant="outline" className="border-orange-500 bg-orange-50 text-orange-700 font-bold">
                        {t("schedule_staff_scheduling_tab.status_open")}
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getResponseLabel = (response?: string) => {
        if (response === 'ACCEPTED') return t("schedule_staff_scheduling_tab.status_accepted");
        if (response === 'REJECTED') return t("schedule_staff_scheduling_tab.status_rejected");
        return t("schedule_staff_scheduling_tab.status_pending");
    };

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Page Title */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t("staff_shifts_page.header.title")}</h1>
                    <p className="text-muted-foreground">{t("staff_shifts_page.header.subtitle")}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsAvailabilityOpen(true)} disabled={!employmentId}>
                        <Calendar className="h-4 w-4" />
                        {t("staff_shifts_page.header.my_availability")}
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsTimeOffOpen(true)} disabled={!employmentId}>
                        <Calendar className="h-4 w-4" />
                        {t("staff_shifts_page.header.request_time_off")}
                    </Button>
                </div>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={(val) => {
                    setActiveTab(val);
                    navigate(`/manage/${businessId}/staff/shifts?tab=${val}`);
                }}
                className="w-full"
            >
                <TabsList className="mb-4 w-full flex justify-start overflow-x-auto whitespace-nowrap">
                    <TabsTrigger value="today">{t("staff_shifts_page.tabs.today")}</TabsTrigger>
                    <TabsTrigger value="schedule">{t("staff_shifts_page.tabs.schedule")}</TabsTrigger>
                    <TabsTrigger value="requests">{t("staff_shifts_page.tabs.requests")}</TabsTrigger>
                    <TabsTrigger value="bids">{t("staff_shifts_page.tabs.bids")}</TabsTrigger>
                </TabsList>

                <TabsContent value="today" className="space-y-6">
                    {/* Attendance Dashboard */}
                    {businessId && employmentId && (
                        <AttendanceDashboard businessId={businessId as string} employmentId={employmentId} />
                    )}

                    {/* Today's Shift Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("staff_shifts_page.today_tab.title")}</CardTitle>
                            <CardDescription>{t("staff_shifts_page.today_tab.subtitle")}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {loadingShifts ? (
                                <Skeleton className="h-20 w-full" />
                            ) : nextShift && formatInBusinessTimezone(nextShift.startTime, businessTz, 'yyyy-MM-dd') === formatInBusinessTimezone(new Date().toISOString(), businessTz, 'yyyy-MM-dd') ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <span className="font-bold text-lg">{formatInBusinessTimezone(nextShift.startTime, businessTz, 'dddd, MMM D')}</span>
                                            <p className="text-sm text-muted-foreground">
                                                {formatTimeInBusinessTimezone(nextShift.startTime, businessTz)} - {formatTimeInBusinessTimezone(nextShift.endTime, businessTz)}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge variant={nextShift.staffResponse === 'ACCEPTED' ? 'default' : 'secondary'}>
                                                {getResponseLabel(nextShift.staffResponse)}
                                            </Badge>
                                        </div>
                                    </div>

                                    {nextShift.notes && (
                                        <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground italic">
                                            " {nextShift.notes} "
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        {!isCheckedOut ? (
                                            <>
                                                {(nextShift.staffResponse === 'PENDING' || !nextShift.staffResponse) && (
                                                    <Button size="sm" onClick={() => handleResponse(nextShift.id, 'ACCEPTED')} disabled={isResponding}>{t("staff_shifts_page.today_tab.accept_shift")}</Button>
                                                )}
                                                <Button size="sm" variant="outline" onClick={() => handleSwap(nextShift.id)}>{t("staff_shifts_page.today_tab.swap_shift")}</Button>
                                            </>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                <Badge variant="outline" className="w-fit border-emerald-200 bg-emerald-50 text-emerald-700">{t("staff_shifts_page.today_tab.finished_worked")}</Badge>
                                                <div className="p-2 bg-muted/50 rounded border border-dashed border-muted-foreground/20">
                                                    <p className="text-xs text-muted-foreground">
                                                        <span className="font-semibold italic">{t("staff_shifts_page.today_tab.mistake_label")}</span> {t("staff_shifts_page.today_tab.mistake_desc")}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
                                    <Calendar className="h-8 w-8 opacity-20" />
                                    <p>{t("staff_shifts_page.today_tab.empty")}</p>
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
                                <CardTitle className="text-lg">{t("staff_shifts_page.open_shifts.title")}</CardTitle>
                            </div>
                            <CardDescription>{t("staff_shifts_page.open_shifts.subtitle")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingAvailable ? (
                                <div className="flex justify-center py-6">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                            ) : (availableShifts || []).length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg bg-background/50">
                                    {t("staff_shifts_page.open_shifts.empty")}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(availableShifts || []).map(shift => {
                                        // Check for tight gaps with scheduled shifts
                                        const hasConflict = (shifts || []).some(scheduled => {
                                            const availStart = new Date(shift.startTime);
                                            const availEnd = new Date(shift.endTime);
                                            const schedStart = new Date(scheduled.startTime);
                                            const schedEnd = new Date(scheduled.endTime);
                                            
                                            const gapBefore = (availStart.getTime() - schedEnd.getTime()) / (1000 * 60 * 60);
                                            const gapAfter = (schedStart.getTime() - availEnd.getTime()) / (1000 * 60 * 60);
                                            
                                            // 8h rest gap rule
                                            return (gapBefore > 0 && gapBefore < 8) || (gapAfter > 0 && gapAfter < 8);
                                        });

                                        return (
                                            <Card key={shift.id} className="bg-background shadow-sm hover:shadow-md transition-shadow">
                                                <CardContent className="p-4 flex flex-col justify-between h-full gap-4">
                                                    <div>
                                                        <div className="flex justify-between items-start">
                                                            <div className="font-semibold text-lg">{formatInBusinessTimezone(shift.startTime, businessTz, 'dddd, MMM D')}</div>
                                                            {hasConflict && (
                                                                <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-600 bg-amber-50 gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {t("staff_shifts_page.open_shifts.short_rest_gap")}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {formatTimeInBusinessTimezone(shift.startTime, businessTz)} - {formatTimeInBusinessTimezone(shift.endTime, businessTz)}
                                                        </div>
                                                        {shift.estimatedCost && (
                                                            <div className="mt-2 flex items-center gap-1 text-sm font-medium text-emerald-600">
                                                                <DollarSign className="h-3 w-3" />
                                                                <span>{getCurrencySymbol(shift.currency || 'EUR')}{shift.estimatedCost}</span>
                                                            </div>
                                                        )}
                                                        {hasConflict && (
                                                            <p className="text-[10px] text-amber-600 mt-2 italic flex items-center gap-1">
                                                                <Info className="w-3 h-3" />
                                                                {t("staff_shifts_page.open_shifts.rest_gap_warning")}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            className="flex-1" 
                                                            onClick={() => {
                                                                setSubmittingBidId(shift.id);
                                                                bidOnShift(shift.id, { onSettled: () => setSubmittingBidId(null) });
                                                            }}
                                                            disabled={isBidding || submittingBidId === shift.id}
                                                        >
                                                            {isBidding || submittingBidId === shift.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                                                            {t("staff_shifts_page.open_shifts.bid")}
                                                        </Button>
                                                        <Button 
                                                            variant="secondary"
                                                            className="flex-1" 
                                                            onClick={() => {
                                                                setSubmittingBidId(shift.id + '-claim');
                                                                claimShift(shift.id, { onSettled: () => setSubmittingBidId(null) });
                                                            }}
                                                            disabled={isClaiming || submittingBidId === shift.id + '-claim'}
                                                        >
                                                            {isClaiming || submittingBidId === shift.id + '-claim' ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                                                            {t("staff_shifts_page.open_shifts.claim")}
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>{t("staff_shifts_page.upcoming.title")}</CardTitle>
                                    <CardDescription>{t("staff_shifts_page.upcoming.subtitle")}</CardDescription>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-3 w-full lg:w-auto">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="status-filter" className="text-[10px] uppercase text-muted-foreground font-semibold">{t("staff_shifts_page.upcoming.status_label")}</Label>
                                        <Select value={status} onValueChange={setStatus}>
                                            <SelectTrigger id="status-filter" className="w-full h-9">
                                                <SelectValue placeholder={t("staff_shifts_page.upcoming.all_statuses")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ALL">{t("staff_shifts_page.upcoming.all_statuses")}</SelectItem>
                                                <SelectItem value="SCHEDULED">{t("schedule_staff_scheduling_tab.status_pending")}</SelectItem>
                                                <SelectItem value="IN_PROGRESS">{t("schedule_staff_scheduling_tab.status_ongoing")}</SelectItem>
                                                <SelectItem value="COMPLETED">{t("schedule_staff_scheduling_tab.status_finished")}</SelectItem>
                                                <SelectItem value="VALIDATED">{t("schedule_staff_scheduling_tab.status_validated")}</SelectItem>
                                                <SelectItem value="CANCELLED">{t("staff_shifts_page.upcoming.cancelled")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="start-date" className="text-[10px] uppercase text-muted-foreground font-semibold">{t("staff_shifts_page.upcoming.from_label")}</Label>
                                        <Input
                                            id="start-date"
                                            type="date"
                                            value={scheduleStartDate}
                                            onChange={(e) => setScheduleStartDate(e.target.value)}
                                            className="w-full h-9"
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="end-date" className="text-[10px] uppercase text-muted-foreground font-semibold">{t("staff_shifts_page.upcoming.to_label")}</Label>
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
                                            <TableHead>{t("staff_shifts_page.upcoming.col_date")}</TableHead>
                                            <TableHead>{t("staff_shifts_page.upcoming.col_time")}</TableHead>
                                            <TableHead>{t("staff_shifts_page.upcoming.col_estimated_cost")}</TableHead>
                                            <TableHead>{t("staff_shifts_page.upcoming.col_response")}</TableHead>
                                            <TableHead>{t("staff_shifts_page.upcoming.col_status")}</TableHead>
                                            <TableHead className="text-right">{t("staff_shifts_page.upcoming.col_actions")}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fetchingUpcoming ? (
                                            <TableRow><TableCell colSpan={6} className="text-center py-8">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>{t("staff_shifts_page.upcoming.loading")}</span>
                                                </div>
                                            </TableCell></TableRow>
                                        ) : upcomingShifts.length === 0 ? (
                                            <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
                                                <Calendar className="h-8 w-8 opacity-20" />
                                                <p>{t("staff_shifts_page.upcoming.empty")}</p>
                                            </TableCell></TableRow>
                                        ) : (
                                            upcomingShifts.map((shift: Shift) => (
                                                <TableRow key={shift.id}>
                                                    <TableCell className="font-medium">{formatInBusinessTimezone(shift.startTime, businessTz, 'ddd, MMM D')}</TableCell>
                                                    <TableCell>
                                                        {formatTimeInBusinessTimezone(shift.startTime, businessTz)} - {formatTimeInBusinessTimezone(shift.endTime, businessTz)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {shift.estimatedCost ? (
                                                            <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                                                                <span>{shift.estimatedCost}</span>
                                                                <span className="text-[10px] text-muted-foreground">{getCurrencySymbol(shift.currency || 'EUR')}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {shift.staffResponse ? (
                                                            <Badge variant={shift.staffResponse === 'ACCEPTED' ? 'outline' : 'destructive'} className={shift.staffResponse === 'ACCEPTED' ? 'border-emerald-500 text-emerald-600' : ''}>
                                                                {getResponseLabel(shift.staffResponse)}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary">{t("schedule_staff_scheduling_tab.status_pending")}</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {getStatusBadge(shift.status)}
                                                            {shift.status === ShiftStatus.VALIDATED && <Lock className="h-3 w-3 text-green-600" />}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {shift.status !== ShiftStatus.VALIDATED && (
                                                                <>
                                                                    {isManagerOrOwner && shift.status === ShiftStatus.COMPLETED && shift.attendanceId && (
                                                                        <Button variant="ghost" size="sm" onClick={() => handleValidateShift(shift)} className="text-green-600 hover:text-green-700 hover:bg-green-50">
                                                                            <ShieldCheck className="h-4 w-4 mr-2" />
                                                                            {t("staff_shifts_page.upcoming.validate")}
                                                                        </Button>
                                                                    )}
                                                                    {isManagerOrOwner && canLogNoShow && shift.status === ShiftStatus.NO_SHOW && (
                                                                        <Button variant="ghost" size="sm" onClick={() => handleLogAsWorked(shift)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                                            <ClipboardCheck className="h-4 w-4 mr-2" />
                                                                            {t("staff_shifts_page.upcoming.log_as_worked")}
                                                                        </Button>
                                                                    )}
                                                                    {(shift.staffResponse === 'PENDING' || !shift.staffResponse) && (
                                                                        <Button variant="ghost" size="sm" onClick={() => handleResponse(shift.id, 'ACCEPTED')} disabled={isResponding} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">{t("staff_shifts_page.upcoming.accept")}</Button>
                                                                    )}
                                                                    <Button variant="ghost" size="sm" onClick={() => handleSwap(shift.id)}>
                                                                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                                                                        {t("staff_shifts_page.upcoming.swap")}
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {shift.status === ShiftStatus.VALIDATED && (
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1 italic">
                                                                    <Lock className="h-3 w-3" />
                                                                    {t("staff_shifts_page.upcoming.locked")}
                                                                </span>
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
                                        {t("staff_shifts_page.upcoming.pagination_showing", { page, totalPages })}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page <= 1}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            {t("staff_shifts_page.upcoming.previous")}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page >= totalPages}
                                        >
                                            {t("staff_shifts_page.upcoming.next")}
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
                                <CardTitle>{t("staff_shifts_page.time_off.title")}</CardTitle>
                                <CardDescription>{t("staff_shifts_page.time_off.subtitle")}</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => setIsTimeOffOpen(true)} disabled={!employmentId}>
                                <Calendar className="h-4 w-4 mr-2" />
                                {t("staff_shifts_page.time_off.new_request")}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("staff_shifts_page.time_off.col_dates")}</TableHead>
                                        <TableHead>{t("staff_shifts_page.time_off.col_reason")}</TableHead>
                                        <TableHead>{t("staff_shifts_page.time_off.col_status")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fetchingRequests ? (
                                        <TableRow><TableCell colSpan={3} className="text-center py-4">{t("staff_shifts_page.time_off.loading")}</TableCell></TableRow>
                                    ) : (timeOffRequests || []).length === 0 ? (
                                        <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">{t("staff_shifts_page.time_off.empty")}</TableCell></TableRow>
                                    ) : (
                                        (timeOffRequests || []).map(req => (
                                            <TableRow key={req.id}>
                                                <TableCell className="text-sm">
                                                    {formatInBusinessTimezone(req.startDate, businessTz, 'MMM D, yyyy')} - {formatInBusinessTimezone(req.endDate, businessTz, 'MMM D, yyyy')}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate">{req.reason}</TableCell>
                                                <TableCell>
                                                    <Badge variant={req.status === 'APPROVED' ? 'default' : req.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                                                        {t(`schedule_time_off_tab.status_options.${req.status}`)}
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
                            <CardTitle>{t("staff_shifts_page.swaps.title")}</CardTitle>
                            <CardDescription>{t("staff_shifts_page.swaps.subtitle")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("staff_shifts_page.swaps.col_shift")}</TableHead>
                                        <TableHead>{t("staff_shifts_page.swaps.col_involving")}</TableHead>
                                        <TableHead>{t("staff_shifts_page.swaps.col_status")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fetchingSwaps ? (
                                        <TableRow><TableCell colSpan={3} className="text-center py-4">{t("staff_shifts_page.swaps.loading")}</TableCell></TableRow>
                                    ) : (shiftSwaps || []).length === 0 ? (
                                        <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">{t("staff_shifts_page.swaps.empty")}</TableCell></TableRow>
                                    ) : (
                                        (shiftSwaps || []).map((swap: any) => (
                                            <TableRow key={swap.id}>
                                                <TableCell className="text-sm">
                                                    {swap.shift ? `${formatInBusinessTimezone(swap.shift.startTime, businessTz, 'MMM D')}: ${formatTimeInBusinessTimezone(swap.shift.startTime, businessTz)} - ${formatTimeInBusinessTimezone(swap.shift.endTime, businessTz)}` : t("staff_shifts_page.swaps.unknown_shift")}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {swap.fromEmploymentId === employmentId
                                                        ? t("staff_shifts_page.swaps.with_label", { name: swap.toEmployment?.professionalProfile?.displayName || t("staff_shifts_page.swaps.colleague") })
                                                        : t("staff_shifts_page.swaps.from_label", { name: swap.fromEmployment?.professionalProfile?.displayName || t("staff_shifts_page.swaps.colleague") })}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={swap.status === 'APPROVED' ? 'default' : swap.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                                                        {t(`schedule_swaps_tab.status_options.${swap.status}`)}
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

                <TabsContent value="bids" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("staff_shifts_page.bids_tab.title")}</CardTitle>
                            <CardDescription>{t("staff_shifts_page.bids_tab.subtitle")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t("staff_shifts_page.bids_tab.col_shift_date")}</TableHead>
                                            <TableHead>{t("staff_shifts_page.bids_tab.col_times")}</TableHead>
                                            <TableHead>{t("staff_shifts_page.bids_tab.col_restaurant")}</TableHead>
                                            <TableHead>{t("staff_shifts_page.bids_tab.col_bid_submitted")}</TableHead>
                                            <TableHead>{t("staff_shifts_page.bids_tab.col_status")}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loadingMyBids ? (
                                            <TableRow><TableCell colSpan={5} className="text-center py-8">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>{t("staff_shifts_page.bids_tab.loading")}</span>
                                                </div>
                                            </TableCell></TableRow>
                                        ) : (myBids || []).length === 0 ? (
                                            <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
                                                <ArrowRightLeft className="h-8 w-8 opacity-20" />
                                                <p>{t("staff_shifts_page.bids_tab.empty")}</p>
                                            </TableCell></TableRow>
                                        ) : (
                                            (myBids || []).map((bid: any) => (
                                                <TableRow key={bid.id}>
                                                    <TableCell className="font-medium">
                                                        {bid.shift ? formatInBusinessTimezone(bid.shift.startTime, businessTz, 'ddd, MMM D') : t("staff_shifts_page.bids_tab.unknown_date")}
                                                    </TableCell>
                                                    <TableCell>
                                                        {bid.shift ? (
                                                            `${formatTimeInBusinessTimezone(bid.shift.startTime, businessTz)} - ${formatTimeInBusinessTimezone(bid.shift.endTime, businessTz)}`
                                                        ) : (
                                                            t("staff_shifts_page.bids_tab.not_available")
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{bid.shift?.business?.name || t("staff_shifts_page.bids_tab.your_restaurant")}</TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {formatInBusinessTimezone(bid.createdAt, businessTz, 'MMM D')}, {formatTimeInBusinessTimezone(bid.createdAt, businessTz)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {bid.status === 'PENDING' && (
                                                            <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">
                                                                {t("staff_shifts_page.bids_tab.pending_review")}
                                                            </Badge>
                                                        )}
                                                        {bid.status === 'APPROVED' && (
                                                            <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50">
                                                                {t("staff_shifts_page.bids_tab.approved")}
                                                            </Badge>
                                                        )}
                                                        {bid.status === 'REJECTED' && (
                                                            <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50">
                                                                {t("staff_shifts_page.bids_tab.rejected")}
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
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
        </div>
    )
}
