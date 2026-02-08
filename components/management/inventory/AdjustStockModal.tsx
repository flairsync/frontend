import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { InventoryUnit } from "@/models/inventory/InventoryUnit";

interface AdjustStockModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: any | null; // Todo: Define proper InventoryItem type
    onConfirm: (itemId: string, data: { adjustment: number; reason: string }) => Promise<void>;
    isAdjusting: boolean;
    getUnitName: (unitId: number) => string;
}

export const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
    open,
    onOpenChange,
    item,
    onConfirm,
    isAdjusting,
    getUnitName
}) => {
    const { t } = useTranslation();
    const [adjustment, setAdjustment] = useState(0);
    const [reason, setReason] = useState("");

    // Reset state when modal opens or item changes
    useEffect(() => {
        if (open) {
            setAdjustment(0);
            setReason("");
        }
    }, [open, item]);

    const handleConfirm = async () => {
        if (item) {
            await onConfirm(item.id, { adjustment, reason });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("inventory_management.adjust.title", { name: item?.name })}</DialogTitle>
                    <DialogDescription>
                        {t("inventory_management.adjust.current")}: <strong>{item?.quantity} {getUnitName(item?.unitId)}</strong>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="adjustment">{t("inventory_management.adjust.adjustment")}</Label>
                        <Input
                            id="adjustment"
                            type="number"
                            placeholder={t("inventory_management.adjust.adjustment_placeholder")}
                            value={adjustment}
                            onChange={(e) => setAdjustment(Number(e.target.value))}
                        />
                        <p className="text-sm text-muted-foreground">
                            {t("inventory_management.adjust.new_quantity")}: {(item?.quantity || 0) + adjustment}
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="reason">{t("inventory_management.adjust.reason")}</Label>
                        <Input
                            id="reason"
                            placeholder={t("inventory_management.adjust.reason_placeholder")}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t("shared.actions.cancel")}</Button>
                    <Button onClick={handleConfirm} disabled={isAdjusting}>
                        {t("shared.actions.confirm")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
