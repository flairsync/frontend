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
    const [editingReservation, setEditingReservation] = useState<any>(null);

    const [form, setForm] = useState({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        reservationTime: "",
        guestCount: 2,
        notes: "",
        tableId: ""
    });

    const handleOpenCreate = () => {
        setEditingReservation(null);
        setForm({
            customerName: "",
            customerEmail: "",
            customerPhone: "",
            reservationTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            guestCount: 2,
            notes: "",
            tableId: ""
        });
        setModalOpen(true);
    };

    const handleEdit = (res: any) => {
        setEditingReservation(res);
        setForm({
            customerName: res.customerName,
            customerEmail: res.customerEmail,
            customerPhone: res.customerPhone,
            reservationTime: format(new Date(res.reservationTime), "yyyy-MM-dd'T'HH:mm"),
            guestCount: res.guestCount,
            notes: res.notes || "",
            tableId: res.tableId || ""
        });
        setModalOpen(true);
    };

    const handleSave = async () => {
        const payload = { ...form, reservationTime: new Date(form.reservationTime).toISOString() };
        if (editingReservation) {
            updateReservation({ reservationId: editingReservation.id, data: payload });
        } else {
            createReservation(payload);
        }
        setModalOpen(false);
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
                                            <Select value={res.status} onValueChange={(val) => updateStatus(res.id, val)}>
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                                    <SelectItem value="rejected">Rejected</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => handleEdit(res)}>
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingReservation ? t("reservations.title") : t("reservations.add_reservation")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t("reservations.customer_name")}</Label>
                                <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>{t("reservations.time")}</Label>
                            <Input type="datetime-local" value={form.reservationTime} onChange={(e) => setForm({ ...form, reservationTime: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t("reservations.guests")}</Label>
                                <Input type="number" value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("reservations.table")}</Label>
                                <Select value={form.tableId} onValueChange={(val) => setForm({ ...form, tableId: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Table" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* Ideally we'd flatten all tables from floors */}
                                        {floors?.flatMap((f: any) => f.tables || [])?.map((t: any) => (
                                            <SelectItem key={t.id} value={t.id}>{t.name} (Cap: {t.capacity})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalOpen(false)}>{t("shared.actions.cancel")}</Button>
                        <Button onClick={handleSave}>{t("shared.actions.save")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ReservationsPage;
