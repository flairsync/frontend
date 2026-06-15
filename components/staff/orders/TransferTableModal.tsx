import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Order } from "@/features/orders/service";
import { useOrders } from "@/features/orders/useOrders";
import { useFloors } from "@/features/floor-plan/useFloorPlan";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TransferTableModalProps {
    open: boolean;
    onClose: () => void;
    businessId: string;
    order: Order | null;
}

export const TransferTableModal: React.FC<TransferTableModalProps> = ({ open, onClose, businessId, order }) => {
    const { transferOrder, isTransferringOrder } = useOrders(businessId);
    const { floors } = useFloors(businessId);
    const [selectedTableId, setSelectedTableId] = useState<string>("");

    const handleTransfer = () => {
        if (!order || !selectedTableId) return;

        transferOrder({ orderId: order.id, data: { tableId: selectedTableId } }, {
            onSuccess: () => {
                setSelectedTableId("");
                onClose();
            }
        });
    };

    const availableTables = React.useMemo(() => {
        if (!floors) return [];
        return floors.flatMap((floor: any) =>
            floor.tables
                .filter((table: any) => table.status === "available" || table.status === "empty")
                .map((table: any) => ({ ...table, floorName: floor.name }))
        );
    }, [floors]);

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Transfer Table</DialogTitle>
                    <DialogDescription>
                        Select an available table to transfer this order to. This will free up the current table (<strong className="text-foreground">{order?.table?.name || "None"}</strong>) and immediately occupy the newly selected table.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Select Destination Table</Label>
                        <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose an available table" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableTables.length > 0 ? (
                                    availableTables.map((t: any) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.floorName} - {t.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled>No tables available</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isTransferringOrder}>Cancel</Button>
                    <Button onClick={handleTransfer} disabled={isTransferringOrder || !selectedTableId || selectedTableId === "none"}>
                        {isTransferringOrder ? "Transferring..." : "Transfer Order"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
