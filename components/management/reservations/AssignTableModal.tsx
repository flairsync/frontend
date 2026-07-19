import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAssignTable } from "@/features/reservations/useReservationDashboard";
import { useAvailability, useReservations } from "@/features/reservations/useReservations";
import { Loader2, Table2 } from "lucide-react";

interface AssignTableModalProps {
    businessId: string;
    reservation: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    /** When true, submitting also transitions the reservation straight to SEATED (used to seat a waitlist entry). */
    seatOnAssign?: boolean;
}

export const AssignTableModal: React.FC<AssignTableModalProps> = ({
    businessId,
    reservation,
    open,
    onOpenChange,
    onSuccess,
    seatOnAssign = false,
}) => {
    const [tableId, setTableId] = useState("");
    const [combinedTableId, setCombinedTableId] = useState("");
    const [availableTables, setAvailableTables] = useState<any[]>([]);

    const { mutate: assignTable, isPending: isAssigning } = useAssignTable(businessId);
    const { updateReservation, isUpdatingReservation } = useReservations(businessId);
    const { mutate: checkAvailability, isPending: checkingAvailability } = useAvailability(businessId);

    const isPending = isAssigning || isUpdatingReservation;
    const isReassign = !!reservation?.table;

    useEffect(() => {
        if (!open || !reservation) return;
        setTableId("");
        setCombinedTableId("");
        checkAvailability(
            { date: reservation.reservationTime, guestCount: reservation.guestCount },
            { onSuccess: (tables: any[]) => setAvailableTables(tables) }
        );
    }, [open, reservation?.id]);

    const selectedTable = availableTables.find((t: any) => t.id === tableId);
    const selectedCombinedTable = availableTables.find((t: any) => t.id === combinedTableId);
    const combinedCapacity = (selectedTable?.capacity || 0) + (selectedCombinedTable?.capacity || 0);

    const reset = () => {
        setTableId("");
        setCombinedTableId("");
    };

    const handleSubmit = () => {
        if (!tableId) return;
        const combinedTableIds = combinedTableId ? [combinedTableId] : undefined;

        if (seatOnAssign) {
            updateReservation(
                { reservationId: reservation.id, data: { tableId, combinedTableIds, status: "SEATED" } },
                { onSuccess: () => { reset(); onOpenChange(false); onSuccess?.(); } }
            );
            return;
        }

        assignTable(
            { reservationId: reservation.id, data: { tableId, combinedTableIds } },
            { onSuccess: () => { reset(); onOpenChange(false); onSuccess?.(); } }
        );
    };

    if (!reservation) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Table2 className="w-4 h-4" />
                        {seatOnAssign ? "Seat Party" : isReassign ? "Reassign Table" : "Assign Table"}
                    </DialogTitle>
                    {isReassign && !seatOnAssign && (
                        <DialogDescription>
                            Currently: <strong>{reservation.table?.name || `Table ${reservation.table?.number}`}</strong>. Select a new table below.
                        </DialogDescription>
                    )}
                    {seatOnAssign && (
                        <DialogDescription>
                            Party of {reservation.guestCount} — pick a table, or combine two if the party doesn't fit one alone.
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="py-2 space-y-3 max-h-[50vh] overflow-y-auto">
                    {checkingAvailability ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" /> Loading available tables…
                        </div>
                    ) : (
                        <>
                            <Select value={tableId} onValueChange={(v) => { setTableId(v); if (v === combinedTableId) setCombinedTableId(""); }}>
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

                            {tableId && (
                                <div className="space-y-1">
                                    <Select value={combinedTableId || "__none"} onValueChange={(v) => setCombinedTableId(v === "__none" ? "" : v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="+ Combine another table (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none">No combined table</SelectItem>
                                            {availableTables.filter((t: any) => t.id !== tableId).map((t: any) => (
                                                <SelectItem key={t.id} value={t.id}>
                                                    {t.name || `Table ${t.number || t.id.substring(0, 4)}`} — seats {t.capacity}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {combinedTableId && (
                                        <p className="text-xs text-muted-foreground">
                                            Combined capacity: {combinedCapacity} seats for a party of {reservation.guestCount}
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button disabled={isPending || !tableId} onClick={handleSubmit}>
                        {isPending
                            ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> {seatOnAssign ? "Seating…" : "Assigning…"}</>
                            : seatOnAssign ? "Seat" : isReassign ? "Reassign" : "Assign"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
