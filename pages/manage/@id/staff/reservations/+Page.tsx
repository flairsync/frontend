"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import { DateRange } from "react-day-picker"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CalendarDays, Clock, Table2, Loader, Eye } from "lucide-react"
import { isTerminalStatus, getAvailableActions } from "@/features/reservations/reservationUtils"
import { BookingFlowModal } from "@/components/management/reservations/BookingFlowModal"
import { EditReservationModal } from "@/components/management/reservations/EditReservationModal"
import { ViewReservationModal } from "@/components/management/reservations/ViewReservationModal"
import { useState } from "react"
import { useReservations } from "@/features/reservations/useReservations"
import { usePageContext } from "vike-react/usePageContext"
import { format } from "date-fns"
import { formatTime } from "@/lib/dateUtils"
import { useTranslation } from "react-i18next"
import DataPagination from "@/components/inputs/DataPagination"

export default function StaffReservationsPage() {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;
    const { t } = useTranslation("management");
    const [addingReservation, setAddingReservation] = useState(false);
    const [editingReservation, setEditingReservation] = useState<any>(null);
    const [viewingReservation, setViewingReservation] = useState<any>(null);
    const [cancelTarget, setCancelTarget] = useState<any>(null);

    const [activeTab, setActiveTab] = useState("upcoming");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [sortBy, setSortBy] = useState<string>("reservationTime");
    const [sortOrder, setSortOrder] = useState<string>("DESC");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    const getFilters = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const base: any = { page, limit, sortBy, sortOrder };

        if (statusFilter !== "all") {
            base.status = statusFilter;
        }

        if (dateRange?.from || dateRange?.to) {
            if (dateRange?.from) base.startDate = new Date(format(dateRange.from, "yyyy-MM-dd") + "T00:00:00").toISOString();
            if (dateRange?.to) base.endDate = new Date(format(dateRange.to, "yyyy-MM-dd") + "T23:59:59").toISOString();
        } else {
            if (activeTab === "upcoming") {
                base.startDate = today.toISOString();
            } else {
                base.endDate = new Date(today.getTime() - 1).toISOString();
            }
        }

        return base;
    };

    const { reservations, meta, fetchingReservations, updateReservation } = useReservations(businessId, getFilters());

    const handleTabChange = (val: string) => {
        setActiveTab(val);
        setPage(1);
        setDateRange(undefined);
        setStatusFilter("all");
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 uppercase text-[10px]">Pending</Badge>;
            case 'confirmed': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase text-[10px]">Confirmed</Badge>;
            case 'waitlist': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px]">Waitlist</Badge>;
            case 'completed': return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 uppercase text-[10px]">Completed</Badge>;
            case 'no_show': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 uppercase text-[10px]">No Show</Badge>;
            case 'cancelled': return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 uppercase text-[10px]">Cancelled</Badge>;
            default: return <Badge variant="outline" className="uppercase text-[10px]">{status}</Badge>;
        }
    };

    const displayReservations = reservations ?? [];

    const handleUpdateStatus = (id: string, status: string) => {
        updateReservation({ reservationId: id, data: { status: status as any } });
    };

    return (
        <div className="space-y-6 p-6">
            <BookingFlowModal
                businessId={businessId}
                open={addingReservation}
                onOpenChange={setAddingReservation}
            />
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Reservations</h1>
                    <p className="text-muted-foreground">
                        Manage upcoming and past reservations efficiently.
                    </p>
                </div>
                <Button
                    onClick={() => setAddingReservation(true)}
                    className="w-full sm:w-auto"
                >
                    Add New Reservation
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="flex flex-col gap-3 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <TabsList className="grid grid-cols-2 w-full max-w-[300px]">
                            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                            <TabsTrigger value="past">Past</TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="reservationTime">Reservation Date</SelectItem>
                                    <SelectItem value="createdAt">Booking Date</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={sortOrder} onValueChange={setSortOrder}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Order" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DESC">Newest First</SelectItem>
                                    <SelectItem value="ASC">Oldest First</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

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

                {/* Upcoming Reservations */}
                <TabsContent value="upcoming" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Reservations</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-6">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Table</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Guests</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fetchingReservations ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-10">
                                                    <Loader className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                                                </TableCell>
                                            </TableRow>
                                        ) : displayReservations.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                                    No upcoming reservations found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            displayReservations.map((rsv: any) => (
                                                <TableRow key={rsv.id} className="hover:bg-muted/50 transition-colors">
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{rsv.customerName}</span>
                                                            <span className="text-xs text-muted-foreground">{rsv.customerPhone}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Table2 className="w-4 h-4 text-muted-foreground" />
                                                            <span>{rsv.table ? (rsv.table.name || `Table ${rsv.table.number || rsv.table.id.substring(0, 4)}`) : "Unassigned"}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                                                                <span>{format(new Date(rsv.reservationTime), "MMM d, yyyy")}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                                <Clock className="w-3 h-3" />
                                                                <span>{formatTime(rsv.reservationTime)}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{rsv.guestCount}</TableCell>
                                                    <TableCell>{getStatusBadge(rsv.status)}</TableCell>
                                                    <TableCell className="text-right space-x-2">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 px-2"
                                                                onClick={() => setViewingReservation(rsv)}
                                                            >
                                                                <Eye className="w-4 h-4 mr-1" /> View
                                                            </Button>
                                                            {!isTerminalStatus(rsv.status) && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 px-2"
                                                                    onClick={() => setEditingReservation(rsv)}
                                                                >
                                                                    Edit
                                                                </Button>
                                                            )}
                                                            {rsv.status.toLowerCase() === "pending" && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-8 px-2 text-green-600 hover:text-green-700"
                                                                    onClick={() => handleUpdateStatus(rsv.id, "confirmed")}
                                                                >
                                                                    Approve
                                                                </Button>
                                                            )}
                                                            {getAvailableActions(rsv.status).includes('cancel') && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                    onClick={() => setCancelTarget(rsv)}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            {!fetchingReservations && meta && meta.totalPages > 1 && (
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
                </TabsContent>

                {/* Past Reservations */}
                <TabsContent value="past" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Past Reservations</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-6">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Table</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Guests</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fetchingReservations ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-10">
                                                    <Loader className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                                                </TableCell>
                                            </TableRow>
                                        ) : displayReservations.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                                    No past reservations found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            displayReservations.map((rsv: any) => (
                                                <TableRow key={rsv.id} className="hover:bg-muted/50 transition-colors">
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{rsv.customerName}</span>
                                                            <span className="text-xs text-muted-foreground">{rsv.customerPhone}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Table2 className="w-4 h-4 text-muted-foreground" />
                                                            <span>{rsv.table ? (rsv.table.name || `Table ${rsv.table.number || rsv.table.id.substring(0, 4)}`) : "Unassigned"}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <CalendarDays className="w-4 h-4 text-muted-foreground" />
                                                            <span>{format(new Date(rsv.reservationTime), "MMM d, yyyy")}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                                            <span>{formatTime(rsv.reservationTime)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{rsv.guestCount}</TableCell>
                                                    <TableCell>{getStatusBadge(rsv.status)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 px-2"
                                                            onClick={() => setViewingReservation(rsv)}
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" /> View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            {!fetchingReservations && meta && meta.totalPages > 1 && (
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
                </TabsContent>
            </Tabs>

            <EditReservationModal
                businessId={businessId}
                reservation={editingReservation}
                open={!!editingReservation}
                onOpenChange={(open) => {
                    if (!open) setEditingReservation(null);
                }}
            />

            <ViewReservationModal
                businessId={businessId}
                reservation={viewingReservation}
                open={!!viewingReservation}
                onOpenChange={(open) => {
                    if (!open) setViewingReservation(null);
                }}
            />

            <AlertDialog open={!!cancelTarget} onOpenChange={(open) => { if (!open) setCancelTarget(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel this reservation?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {cancelTarget?.customerName
                                ? `This will cancel the reservation for ${cancelTarget.customerName}. The customer will be notified.`
                                : "This will cancel the reservation. The customer will be notified."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => {
                                if (cancelTarget) {
                                    handleUpdateStatus(cancelTarget.id, "cancelled");
                                    setCancelTarget(null);
                                }
                            }}
                        >
                            Yes, Cancel It
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
