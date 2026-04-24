import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAssignTable } from "@/features/reservations/useReservationDashboard";
import { useAvailability } from "@/features/reservations/useReservations";
import { Loader2, Table2 } from "lucide-react";

interface AssignTableModalProps {
    businessId: string;
    reservation: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export const AssignTableModal: React.FC<AssignTableModalProps> = ({
    businessId,
    reservation,
    open,
    onOpenChange,
    onSuccess,
}) => {
    const [tableId, setTableId] = useState("");
    const [availableTables, setAvailableTables] = useState<any[]>([]);

    const { mutate: assignTable, isPending } = useAssignTable(businessId);
    const { mutate: checkAvailability, isPending: checkingAvailability } = useAvailability(businessId);

    const isReassign = !!reservation?.table;

    useEffect(() => {
        if (!open || !reservation) return;
        setTableId("");
        checkAvailability(
            { date: reservation.reservationTime, guestCount: reservation.guestCount },
            { onSuccess: (tables: any[]) => setAvailableTables(tables) }
        );
    }, [open, reservation?.id]);

    const handleSubmit = () => {
        if (!tableId) return;
        assignTable(
            { reservationId: reservation.id, data: { tableId } },
            {
                onSuccess: () => {
                    setTableId("");
                    onOpenChange(false);
                    onSuccess?.();
                },
            }
        );
    };

    if (!reservation) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Table2 className="w-4 h-4" />
                        {isReassign ? "Reassign Table" : "Assign Table"}
                    </DialogTitle>
                    {isReassign && (
                        <DialogDescription>
                            Currently: <strong>{reservation.table?.name || `Table ${reservation.table?.number}`}</strong>. Select a new table below.
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="py-2">
                    {checkingAvailability ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" /> Loading available tables…
                        </div>
                    ) : (
                        <Select value={tableId} onValueChange={setTableId}>
                            <SelectTrigger>
                                <SelectValue placeholder={availableTables.length === 0 ? "No tables available" : "Select a table"} />
                            </SelectTrigger>
                            <SelectContent>
                                {availableTables.map((t: any) => (
                                    <SelectItem key={t.id} value={t.id}>
                                        {t.name || `Table ${t.number || t.id.substring(0, 4)}`} — seats {t.capacity}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button disabled={isPending || !tableId} onClick={handleSubmit}>
                        {isPending ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Assigning…</> : isReassign ? "Reassign" : "Assign"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
