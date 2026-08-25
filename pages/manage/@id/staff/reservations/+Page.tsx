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
            case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 uppercase text-[10px]">{t("reservation_status.pending")}</Badge>;
            case 'confirmed': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase text-[10px]">{t("reservation_status.confirmed")}</Badge>;
            case 'waitlist': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px]">{t("reservation_status.waitlist")}</Badge>;
            case 'completed': return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 uppercase text-[10px]">{t("reservation_status.completed")}</Badge>;
            case 'no_show': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 uppercase text-[10px]">{t("reservation_status.no_show")}</Badge>;
            case 'cancelled': return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 uppercase text-[10px]">{t("reservation_status.cancelled")}</Badge>;
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
                    <h1 className="text-2xl font-bold tracking-tight">{t("staff_reservations_page.title")}</h1>
                    <p className="text-muted-foreground">
                        {t("staff_reservations_page.subtitle")}
                    </p>
                </div>
                <Button
                    onClick={() => setAddingReservation(true)}
                    className="w-full sm:w-auto"
                >
                    {t("staff_reservations_page.add_new")}
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="flex flex-col gap-3 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <TabsList className="grid grid-cols-2 w-full max-w-[300px]">
                            <TabsTrigger value="upcoming">{t("staff_reservations_page.tabs.upcoming")}</TabsTrigger>
                            <TabsTrigger value="past">{t("staff_reservations_page.tabs.past")}</TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder={t("staff_reservations_page.sort_by_placeholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="reservationTime">{t("staff_reservations_page.sort_options.reservation_date")}</SelectItem>
                                    <SelectItem value="createdAt">{t("staff_reservations_page.sort_options.booking_date")}</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={sortOrder} onValueChange={setSortOrder}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder={t("staff_reservations_page.order_placeholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DESC">{t("staff_reservations_page.order_options.newest_first")}</SelectItem>
                                    <SelectItem value="ASC">{t("staff_reservations_page.order_options.oldest_first")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-end gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">{t("staff_reservations_page.status_label")}</Label>
                            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("staff_reservations_page.all")}</SelectItem>
                                    <SelectItem value="pending">{t("edit_reservation_modal.status_options.PENDING")}</SelectItem>
                                    <SelectItem value="confirmed">{t("edit_reservation_modal.status_options.CONFIRMED")}</SelectItem>
                                    <SelectItem value="seated">{t("edit_reservation_modal.status_options.SEATED")}</SelectItem>
                                    <SelectItem value="completed">{t("edit_reservation_modal.status_options.COMPLETED")}</SelectItem>
                                    <SelectItem value="cancelled">{t("edit_reservation_modal.status_options.CANCELLED")}</SelectItem>
                                    <SelectItem value="no_show">{t("edit_reservation_modal.status_options.NO_SHOW")}</SelectItem>
                                    <SelectItem value="waitlist">{t("edit_reservation_modal.status_options.WAITLIST")}</SelectItem>
                                    <SelectItem value="expired">{t("edit_reservation_modal.status_options.EXPIRED")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">{t("staff_reservations_page.date_range_label")}</Label>
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
                            <CardTitle>{t("staff_reservations_page.upcoming_reservations_title")}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-6">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t("staff_reservations_page.col_customer")}</TableHead>
                                            <TableHead>{t("staff_reservations_page.col_table")}</TableHead>
                                            <TableHead>{t("staff_reservations_page.col_time")}</TableHead>
                                            <TableHead>{t("staff_reservations_page.col_guests")}</TableHead>
                                            <TableHead>{t("staff_reservations_page.status_label")}</TableHead>
                                            <TableHead className="text-right">{t("staff_reservations_page.col_action")}</TableHead>
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
                                                    {t("staff_reservations_page.no_upcoming_found")}
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
                                                            <span>{rsv.table ? (rsv.table.name || t("staff_reservations_page.table_fallback", { number: rsv.table.number || rsv.table.id.substring(0, 4) })) : t("staff_reservations_page.table_unassigned")}</span>
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
                                                                <Eye className="w-4 h-4 mr-1" /> {t("staff_reservations_page.view")}
                                                            </Button>
                                                            {!isTerminalStatus(rsv.status) && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 px-2"
                                                                    onClick={() => setEditingReservation(rsv)}
                                                                >
                                                                    {t("staff_reservations_page.edit")}
                                                                </Button>
                                                            )}
                                                            {rsv.status.toLowerCase() === "pending" && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-8 px-2 text-green-600 hover:text-green-700"
                                                                    onClick={() => handleUpdateStatus(rsv.id, "confirmed")}
                                                                >
                                                                    {t("staff_reservations_page.approve")}
                                                                </Button>
                                                            )}
                                                            {getAvailableActions(rsv.status).includes('cancel') && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                    onClick={() => setCancelTarget(rsv)}
                                                                >
                                                                    {t("staff_reservations_page.cancel")}
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
                            <CardTitle>{t("staff_reservations_page.past_reservations_title")}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-6">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t("staff_reservations_page.col_customer")}</TableHead>
                                            <TableHead>{t("staff_reservations_page.col_table")}</TableHead>
                                            <TableHead>{t("staff_reservations_page.col_date")}</TableHead>
                                            <TableHead>{t("staff_reservations_page.col_time")}</TableHead>
                                            <TableHead>{t("staff_reservations_page.col_guests")}</TableHead>
                                            <TableHead>{t("staff_reservations_page.status_label")}</TableHead>
                                            <TableHead className="text-right">{t("staff_reservations_page.col_action")}</TableHead>
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
                                                    {t("staff_reservations_page.no_past_found")}
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
                                                            <span>{rsv.table ? (rsv.table.name || t("staff_reservations_page.table_fallback", { number: rsv.table.number || rsv.table.id.substring(0, 4) })) : t("staff_reservations_page.table_unassigned")}</span>
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
                                                            <Eye className="w-4 h-4 mr-1" /> {t("staff_reservations_page.view")}
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
                        <AlertDialogTitle>{t("staff_reservations_page.cancel_dialog.title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {cancelTarget?.customerName
                                ? t("staff_reservations_page.cancel_dialog.description_with_name", { name: cancelTarget.customerName })
                                : t("staff_reservations_page.cancel_dialog.description_generic")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("staff_reservations_page.cancel_dialog.keep")}</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => {
                                if (cancelTarget) {
                                    handleUpdateStatus(cancelTarget.id, "cancelled");
                                    setCancelTarget(null);
                                }
                            }}
                        >
                            {t("staff_reservations_page.cancel_dialog.confirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
