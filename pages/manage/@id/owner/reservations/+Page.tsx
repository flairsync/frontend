import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, CalendarCheck, User, Eye } from "lucide-react";
import { useReservations } from "@/features/reservations/useReservations";
import { useFloors } from "@/features/floor-plan/useFloorPlan";
import { useMyBusiness } from "@/features/business/useMyBusiness";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { formatInTimezone } from "@/lib/dateUtils";
import { BookingFlowModal } from "@/components/management/reservations/BookingFlowModal";
import { EditReservationModal } from "@/components/management/reservations/EditReservationModal";
import { ViewReservationModal } from "@/components/management/reservations/ViewReservationModal";
import DataPagination from "@/components/inputs/DataPagination";

const ReservationsPage: React.FC = () => {
    const { t } = useTranslation();
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const { myBusinessFullDetails } = useMyBusiness(businessId);
    const businessTimezone = myBusinessFullDetails?.timezone;

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("reservationTime");
    const [sortOrder, setSortOrder] = useState<string>("DESC");

    // Build the query object
    const filters = {
        page,
        limit,
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        ...(startDate ? { startDate: new Date(startDate).toISOString() } : {}),
        ...(endDate ? { endDate: new Date(endDate).toISOString() } : {}),
        sortBy,
        sortOrder
    };

    const {
        reservations,
        meta,
        fetchingReservations,
        createReservation,
        updateReservation
    } = useReservations(businessId, filters);

    const { floors } = useFloors(businessId); // To get table choices if assigned

    const [modalOpen, setModalOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState<any>(null);
    const [viewingReservation, setViewingReservation] = useState<any>(null);

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

    const handleOpenCreate = () => {
        setModalOpen(true);
    };

    const updateStatus = (id: string, status: string) => {
        updateReservation({ reservationId: id, data: { status: status as any } });
    };

    const handleClearFilters = () => {
        setStatusFilter("all");
        setStartDate("");
        setEndDate("");
        setSortBy("reservationTime");
        setSortOrder("DESC");
        setPage(1);
    };

    // Whenever a filter changes, reset to page 1
    const handleFilterChange = (setter: any, value: any) => {
        setter(value);
        setPage(1);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{t("reservations.title")}</h1>
                <Button onClick={handleOpenCreate} className="gap-2">
                    <Plus className="w-4 h-4" />
                    {t("reservations.add_reservation")}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4">
                        <CardTitle>{t("reservations.title")}</CardTitle>
                        <div className="flex flex-wrap items-end gap-4 bg-muted/30 p-4 rounded-lg border">
                            <div className="space-y-1">
                                <Label className="text-xs">Status</Label>
                                <Select value={statusFilter} onValueChange={(v) => handleFilterChange(setStatusFilter, v)}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="waitlist">Waitlist</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="no_show">No Show</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Start Date</Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => handleFilterChange(setStartDate, e.target.value)}
                                    className="w-[160px]"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">End Date</Label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => handleFilterChange(setEndDate, e.target.value)}
                                    className="w-[160px]"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Sort By</Label>
                                <Select value={sortBy} onValueChange={(v) => handleFilterChange(setSortBy, v)}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Sort By" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="reservationTime">Reservation Date</SelectItem>
                                        <SelectItem value="createdAt">Booking Date</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Order</Label>
                                <Select value={sortOrder} onValueChange={(v) => handleFilterChange(setSortOrder, v)}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Order" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DESC">Newest First</SelectItem>
                                        <SelectItem value="ASC">Oldest First</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {(statusFilter !== "all" || startDate || endDate || sortBy !== "reservationTime" || sortOrder !== "DESC") && (
                                <Button variant="ghost" onClick={handleClearFilters} size="sm" className="h-10">
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("reservations.customer_name")}</TableHead>
                                <TableHead>{t("reservations.time")}</TableHead>
                                <TableHead>{t("reservations.guests")}</TableHead>
                                <TableHead>{t("reservations.table")}</TableHead>
                                <TableHead>{t("orders.status")}</TableHead>
                                <TableHead className="text-right">{t("shared.actions.all")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fetchingReservations ? (
                                <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
                            ) : reservations?.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center">No reservations found.</TableCell></TableRow>
                            ) : (
                                reservations?.map((res: any) => (
                                    <TableRow key={res.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{res.customerName}</span>
                                                <span className="text-xs text-muted-foreground">{res.customerPhone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatInTimezone(res.reservationTime, "MMM D, h:mm A", businessTimezone)}</TableCell>
                                        <TableCell>{res.guestCount}</TableCell>
                                        <TableCell>{res.table ? (res.table.name || `Table ${res.table.number || res.table.id.substring(0, 4)}`) : "Unassigned"}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(res.status)}
                                                <Select value={res.status} onValueChange={(val) => updateStatus(res.id, val)}>
                                                    <SelectTrigger className="w-[32px] h-8 p-0 flex items-center justify-center border-none shadow-none hover:bg-accent">
                                                        <Pencil className="w-3 h-3" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                                        <SelectItem value="waitlist">Waitlist</SelectItem>
                                                        <SelectItem value="rejected">Rejected</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                        <SelectItem value="completed">Completed</SelectItem>
                                                        <SelectItem value="no_show">No Show</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => setViewingReservation(res)}>
                                                    <Eye className="w-4 h-4 mr-1" /> View
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => setEditingReservation(res)}>
                                                    Edit
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

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

            <BookingFlowModal
                businessId={businessId}
                open={modalOpen}
                onOpenChange={setModalOpen}
            />

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
        </div>
    );
};

export default ReservationsPage;
