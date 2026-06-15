import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { useReservationDashboard } from "@/features/reservations/useReservationDashboard";
import { useReservations } from "@/features/reservations/useReservations";
import { getAvailableActions, getStatusBadge } from "@/features/reservations/reservationUtils";
import { ReservationSummary, DashboardStats } from "@/features/reservations/types";
import { ReservationActionButtons } from "./ReservationActionButtons";
import { AssignTableModal } from "./AssignTableModal";
import { CustomerLatePopover } from "./CustomerLatePopover";
import { WalkInModal } from "./WalkInModal";
import DataPagination from "@/components/inputs/DataPagination";
import { formatInTimezone } from "@/lib/dateUtils";
import {
    Users, CheckCircle, Armchair, Flag, XCircle, UserX,
    CalendarCheck, Clock, Plus, Eye, RefreshCw
} from "lucide-react";


interface ReservationDashboardProps {
    businessId: string;
    timezone?: string;
    onViewReservation: (reservation: any) => void;
    onEditReservation: (reservation: any) => void;
    onCreateReservation: () => void;
}

const StatTile = ({ label, value, icon: Icon, active, color, onClick }: {
    label: string; value: number; icon: any; active: boolean; color: string; onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={`flex-1 min-w-[100px] p-4 rounded-lg border text-left transition-all hover:shadow-md ${active ? "ring-2 ring-primary shadow-md" : ""}`}
    >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${color}`}>
            <Icon className="w-4 h-4" />
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </button>
);

function elapsedMinutes(reservationTime: string): number {
    return Math.floor((Date.now() - new Date(reservationTime).getTime()) / 60_000);
}

function formatElapsed(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export const ReservationDashboard: React.FC<ReservationDashboardProps> = ({
    businessId, timezone, onViewReservation, onEditReservation, onCreateReservation
}) => {
    const [walkInOpen, setWalkInOpen] = useState(false);
    const [assignTarget, setAssignTarget] = useState<any>(null);
    const [statFilter, setStatFilter] = useState<string>("all");

    // Pagination for "All Today" section
    const [page, setPage] = useState(1);
    const limit = 10;
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(),
    });

    const { data: dashboard, isLoading: loadingDashboard, refetch: refetchDashboard } = useReservationDashboard(businessId);

    const filters = {
        page, limit,
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        startDate: dateRange?.from ? new Date(format(dateRange.from, "yyyy-MM-dd") + "T00:00:00").toISOString() : undefined,
        endDate: dateRange?.to ? new Date(format(dateRange.to, "yyyy-MM-dd") + "T23:59:59").toISOString() : undefined,
        sortBy: "reservationTime",
        sortOrder: "ASC",
    };
    const { reservations, meta, fetchingReservations } = useReservations(businessId, filters);

    const stats: DashboardStats = dashboard?.stats ?? {
        totalToday: 0, confirmed: 0, seated: 0, completed: 0, noShow: 0, cancelled: 0,
    };

    const statTiles = [
        { key: "all",       label: "Total Today",  value: stats.totalToday, icon: CalendarCheck, color: "bg-gray-100 text-gray-600" },
        { key: "confirmed", label: "Confirmed",    value: stats.confirmed,  icon: CheckCircle,   color: "bg-blue-100 text-blue-600" },
        { key: "seated",    label: "Seated",       value: stats.seated,     icon: Armchair,      color: "bg-green-100 text-green-600" },
        { key: "completed", label: "Completed",    value: stats.completed,  icon: Flag,          color: "bg-gray-100 text-gray-500" },
        { key: "no_show",   label: "No-Shows",     value: stats.noShow,     icon: UserX,         color: "bg-orange-100 text-orange-600" },
        { key: "cancelled", label: "Cancelled",    value: stats.cancelled,  icon: XCircle,       color: "bg-red-100 text-red-600" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Reservations</h1>
                    <p className="text-sm text-muted-foreground">Live dashboard — refreshes every 60s</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => refetchDashboard()}>
                        <RefreshCw className="w-4 h-4 mr-1" /> Refresh
                    </Button>
                    <Button variant="outline" size="sm" onClick={onCreateReservation}>
                        <Plus className="w-4 h-4 mr-1" /> New Reservation
                    </Button>
                    <Button size="sm" onClick={() => setWalkInOpen(true)}>
                        <Users className="w-4 h-4 mr-1" /> Walk-In
                    </Button>
                </div>
            </div>

            {/* Stats bar */}
            <div className="flex flex-wrap gap-3">
                {loadingDashboard
                    ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="flex-1 min-w-[100px] h-24 rounded-lg" />)
                    : statTiles.map((tile) => (
                        <StatTile
                            key={tile.key}
                            label={tile.label}
                            value={tile.value}
                            icon={tile.icon}
                            color={tile.color}
                            active={statFilter === tile.key}
                            onClick={() => { setStatFilter(tile.key); if (tile.key !== "all") setStatusFilter(tile.key); else setStatusFilter("all"); setPage(1); }}
                        />
                    ))
                }
            </div>

            {/* Currently Seated */}
            {(dashboard?.currentlySeated?.length ?? 0) > 0 && (
                <Card className="border-green-200 bg-green-50/30">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Armchair className="w-4 h-4 text-green-600" />
                            Currently Seated ({dashboard!.currentlySeated.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {dashboard!.currentlySeated.map((res: ReservationSummary) => {
                                const elapsed = elapsedMinutes(res.reservationTime);
                                const actions = getAvailableActions(res.status);
                                return (
                                    <div key={res.id} className="bg-background border border-green-200 rounded-lg p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm">{res.customerName}</span>
                                            <Badge variant="outline" className="text-[9px] bg-green-50 text-green-700 border-green-200">
                                                {formatElapsed(elapsed)}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span><Users className="w-3 h-3 inline mr-0.5" />{res.guestCount}</span>
                                            {res.table && <span>{res.table.name || `Table ${res.table.number}`}</span>}
                                        </div>
                                        <div className="flex gap-1.5 pt-1">
                                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => onViewReservation(res)}>
                                                <Eye className="w-3 h-3 mr-1" /> View
                                            </Button>
                                            {actions.includes("complete") && (
                                                <ReservationActionButtons
                                                    businessId={businessId}
                                                    reservation={res}
                                                    onActionComplete={() => refetchDashboard()}
                                                    size="sm"
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Upcoming (next 2h) */}
            {(dashboard?.upcoming?.length ?? 0) > 0 && (
                <Card className="border-blue-200 bg-blue-50/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            Upcoming — Next 2 Hours ({dashboard!.upcoming.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {dashboard!.upcoming.map((res: ReservationSummary) => {
                                const actions = getAvailableActions(res.status);
                                return (
                                    <div key={res.id} className="flex items-center justify-between gap-3 bg-background border rounded-lg px-3 py-2">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <span className="text-sm font-medium whitespace-nowrap">
                                                {formatInTimezone(res.reservationTime, "h:mm A", timezone)}
                                            </span>
                                            <span className="text-sm truncate">{res.customerName}</span>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                <Users className="w-3 h-3 inline mr-0.5" />{res.guestCount}
                                            </span>
                                            {res.table && (
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {res.table.name || `Table ${res.table.number}`}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            {getStatusBadge(res.status)}
                                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onViewReservation(res)}>
                                                <Eye className="w-3.5 h-3.5" />
                                            </Button>
                                            {actions.includes("assign_table") && (
                                                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setAssignTarget(res)}>
                                                    {res.table ? "Reassign" : "Assign Table"}
                                                </Button>
                                            )}
                                            <ReservationActionButtons businessId={businessId} reservation={res} onActionComplete={() => refetchDashboard()} size="sm" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* All Reservations — paginated */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-3">
                        <CardTitle className="text-base">
                            {dateRange?.from ? (
                                dateRange.to && dateRange.from.toDateString() !== dateRange.to.toDateString()
                                    ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
                                    : format(dateRange.from, "MMM d, yyyy")
                            ) : "All Reservations"}
                        </CardTitle>
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Status</Label>
                                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="seated">Seated</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="no_show">No Show</SelectItem>
                                        <SelectItem value="waitlist">Waitlist</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Date Range</Label>
                                <DatePickerWithRange
                                    date={dateRange}
                                    setDate={(range) => { setDateRange(range); setPage(1); }}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Guests</TableHead>
                                <TableHead>Table</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fetchingReservations ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                                ))
                            ) : reservations.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No reservations found.</TableCell></TableRow>
                            ) : (
                                reservations.map((res: any) => {
                                    const actions = getAvailableActions(res.status);
                                    return (
                                        <TableRow key={res.id}>
                                            <TableCell className="text-sm whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span>{formatInTimezone(res.reservationTime, "MMM D, YYYY", timezone)}</span>
                                                    <span className="text-xs text-muted-foreground">{formatInTimezone(res.reservationTime, "h:mm A", timezone)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{res.customerName}</span>
                                                    {res.customerPhone && <span className="text-xs text-muted-foreground">{res.customerPhone}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>{res.guestCount}</TableCell>
                                            <TableCell className="text-sm">
                                                {res.table ? (res.table.name || `Table ${res.table.number}`) : (
                                                    <span className="text-muted-foreground italic text-xs">Unassigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(res.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex justify-end items-center gap-1">
                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onViewReservation(res)}>
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Button>
                                                    {actions.includes("assign_table") && (
                                                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setAssignTarget(res)}>
                                                            {res.table ? "Reassign" : "Assign"}
                                                        </Button>
                                                    )}
                                                    {actions.includes("customer_late") && (
                                                        <CustomerLatePopover businessId={businessId} reservationId={res.id} />
                                                    )}
                                                    <ReservationActionButtons businessId={businessId} reservation={res} onActionComplete={() => refetchDashboard()} size="sm" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>

                    {!fetchingReservations && meta?.totalPages > 1 && (
                        <div className="mt-4 flex justify-end">
                            <DataPagination
                                current={page}
                                total={meta.totalItems}
                                pageSize={limit}
                                onChange={(p: number) => setPage(p)}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* No-shows today */}
            {(dashboard?.noShowsToday?.length ?? 0) > 0 && (
                <Card className="border-orange-200 bg-orange-50/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <UserX className="w-4 h-4 text-orange-600" />
                            No-Shows Today ({dashboard!.noShowsToday.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {dashboard!.noShowsToday.map((res: ReservationSummary) => (
                                <div key={res.id} className="flex items-center justify-between bg-background border rounded-lg px-3 py-2">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium">{res.customerName}</span>
                                        <span className="text-xs text-muted-foreground">
                                            <Users className="w-3 h-3 inline mr-0.5" />{res.guestCount}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Booked: {formatInTimezone(res.reservationTime, "h:mm A", timezone)}
                                        </span>
                                        {res.noShowMarkedAt && (
                                            <span className="text-xs text-muted-foreground">
                                                Marked: {formatInTimezone(res.noShowMarkedAt, "h:mm A", timezone)}
                                            </span>
                                        )}
                                    </div>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onViewReservation(res)}>
                                        <Eye className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Modals */}
            <WalkInModal businessId={businessId} open={walkInOpen} onOpenChange={setWalkInOpen} />
            <AssignTableModal
                businessId={businessId}
                reservation={assignTarget}
                open={!!assignTarget}
                onOpenChange={(v) => { if (!v) setAssignTarget(null); }}
                onSuccess={() => refetchDashboard()}
            />
        </div>
    );
};
