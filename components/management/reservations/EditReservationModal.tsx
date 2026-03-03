import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReservations } from "@/features/reservations/useReservations";
import { useTables } from "@/features/floor-plan/useFloorPlan";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditReservationModalProps {
    businessId: string;
    reservation: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const EditReservationModal: React.FC<EditReservationModalProps> = ({
    businessId,
    reservation,
    open,
    onOpenChange
}) => {
    const { updateReservation, isUpdatingReservation } = useReservations(businessId);
    const { tables, fetchingTables } = useTables(businessId);

    const [formData, setFormData] = useState({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        date: "",
        time: "",
        guestCount: 1,
        tableId: "unassigned",
        status: "",
        notes: ""
    });

    useEffect(() => {
        if (reservation && open) {
            const resDate = new Date(reservation.reservationTime);
            setFormData({
                customerName: reservation.customerName || "",
                customerEmail: reservation.customerEmail || "",
                customerPhone: reservation.customerPhone || "",
                date: format(resDate, "yyyy-MM-dd"),
                time: format(resDate, "HH:mm"),
                guestCount: reservation.guestCount || 1,
                tableId: reservation.tableId || "unassigned",
                status: reservation.status || "pending",
                notes: reservation.notes || ""
            });
        }
    }, [reservation, open]);

    const handleSave = () => {
        const timestamp = `${formData.date}T${formData.time}`;

        let newTableId = formData.tableId === "unassigned" ? null : formData.tableId;
        // The API might expect tableId to be omitted if null, but setting it to undefined/null is fine for JSON.

        const payload: any = {
            customerName: formData.customerName,
            customerEmail: formData.customerEmail,
            customerPhone: formData.customerPhone,
            reservationTime: new Date(timestamp).toISOString(),
            guestCount: formData.guestCount,
            status: formData.status,
            notes: formData.notes
        };

        if (newTableId) {
            payload.tableId = newTableId;
        } else {
            // To unassign a table, we pass null. Backend should handle that.
            payload.tableId = null;
        }

        updateReservation({
            reservationId: reservation.id,
            data: payload
        }, {
            onSuccess: () => {
                onOpenChange(false);
            }
        });
    };

    if (!reservation) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Reservation</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Customer Name</Label>
                            <Input
                                value={formData.customerName}
                                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input
                                value={formData.customerPhone}
                                onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Time</Label>
                            <Input
                                type="time"
                                value={formData.time}
                                onChange={e => setFormData({ ...formData, time: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Guest Count</Label>
                            <Input
                                type="number"
                                min={1}
                                value={formData.guestCount}
                                onChange={e => setFormData({ ...formData, guestCount: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="waitlist">Waitlist</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="no_show">No Show</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Assigned Table</Label>
                        <Select value={formData.tableId} onValueChange={(val) => setFormData({ ...formData, tableId: val })}>
                            <SelectTrigger disabled={fetchingTables}>
                                <SelectValue placeholder="Select a Table" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unassigned">Unassigned (Waitlist)</SelectItem>
                                {tables?.map((table: any) => (
                                    <SelectItem key={table.id} value={table.id}>
                                        {table.name || `Table ${table.number || table.id.substring(0, 4)}`} (Capacity: {table.capacity})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                            Assigning a table will check for availability conflicts.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isUpdatingReservation}>
                        {isUpdatingReservation && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
