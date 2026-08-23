import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation("management");
    const { transferOrder, isTransferringOrder } = useOrders(businessId);
    const { floors } = useFloors(businessId, true);
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
                    <DialogTitle>{t("transfer_table_modal.title")}</DialogTitle>
                    <DialogDescription>
                        {t("transfer_table_modal.description_prefix")} (<strong className="text-foreground">{order?.table?.name || t("transfer_table_modal.none")}</strong>) {t("transfer_table_modal.description_suffix")}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label>{t("transfer_table_modal.select_destination_label")}</Label>
                        <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                            <SelectTrigger>
                                <SelectValue placeholder={t("transfer_table_modal.choose_table_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                {availableTables.length > 0 ? (
                                    availableTables.map((t: any) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.floorName} - {t.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled>{t("transfer_table_modal.no_tables_available")}</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isTransferringOrder}>{t("transfer_table_modal.cancel")}</Button>
                    <Button onClick={handleTransfer} disabled={isTransferringOrder || !selectedTableId || selectedTableId === "none"}>
                        {isTransferringOrder ? t("transfer_table_modal.transferring") : t("transfer_table_modal.transfer_order")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
