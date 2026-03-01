import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, CalendarCheck, User } from "lucide-react";
import { useReservations } from "@/features/reservations/useReservations";
import { useFloors } from "@/features/floor-plan/useFloorPlan";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { format } from "date-fns";
import { BookingFlowModal } from "@/components/management/reservations/BookingFlowModal";

const ReservationsPage: React.FC = () => {
    const { t } = useTranslation();
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const {
        reservations,
        fetchingReservations,
        createReservation,
        updateReservation
    } = useReservations(businessId);

    const { floors } = useFloors(businessId); // To get table choices if assigned

    const [modalOpen, setModalOpen] = useState(false);

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
                    <CardTitle>{t("reservations.title")}</CardTitle>
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
                                        <TableCell>{format(new Date(res.reservationTime), "MMM d, h:mm a")}</TableCell>
                                        <TableCell>{res.guestCount}</TableCell>
                                        <TableCell>{res.tableId ? `Table ${res.tableId.substring(0, 4)}` : "Unassigned"}</TableCell>
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
                                            {/* Action icons could go here if needed */}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <BookingFlowModal
                businessId={businessId}
                open={modalOpen}
                onOpenChange={setModalOpen}
            />
        </div>
    );
};

export default ReservationsPage;
