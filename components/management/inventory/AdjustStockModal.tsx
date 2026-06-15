import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdjustStockType } from "@/features/inventory/service";
import { cn } from "@/lib/utils";
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, Trash2 } from "lucide-react";

interface AdjustStockModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: any | null;
    onConfirm: (itemId: string, data: { type: AdjustStockType; amount: number; notes?: string }) => Promise<void>;
    isAdjusting: boolean;
    getUnitName: (unitId: number) => string;
}

const TYPES: { value: AdjustStockType; label: string; icon: React.ReactNode; color: string }[] = [
    { value: "add", label: "Add", icon: <ArrowUpCircle className="w-4 h-4" />, color: "text-green-600" },
    { value: "subtract", label: "Subtract", icon: <ArrowDownCircle className="w-4 h-4" />, color: "text-orange-600" },
    { value: "set", label: "Set", icon: <RefreshCw className="w-4 h-4" />, color: "text-blue-600" },
    { value: "waste", label: "Waste", icon: <Trash2 className="w-4 h-4" />, color: "text-red-600" },
];

export const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
    open,
    onOpenChange,
    item,
    onConfirm,
    isAdjusting,
    getUnitName,
}) => {
    const [type, setType] = useState<AdjustStockType>("add");
    const [amount, setAmount] = useState<string>("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (open) {
            setType("add");
            setAmount("");
            setNotes("");
        }
    }, [open, item]);

    const currentQty = Number(item?.quantity ?? 0);
    const parsedAmount = parseFloat(amount) || 0;

    const previewQty = () => {
        if (type === "add") return currentQty + parsedAmount;
        if (type === "subtract") return currentQty - parsedAmount;
        if (type === "waste") return currentQty - parsedAmount;
        if (type === "set") return parsedAmount;
        return currentQty;
    };

    const preview = previewQty();
    const unitName = item ? getUnitName(item.unitId) : "";
    const needsNote = type === "subtract" || type === "waste";

    const handleConfirm = async () => {
        if (!item || parsedAmount <= 0) return;
        await onConfirm(item.id, { type, amount: parsedAmount, notes: notes || undefined });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Adjust Stock — {item?.name}</DialogTitle>
                    <DialogDescription>
                        Current stock: <strong>{currentQty} {unitName}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <Tabs value={type} onValueChange={(v) => setType(v as AdjustStockType)}>
                        <TabsList className="grid grid-cols-4 w-full">
                            {TYPES.map((t) => (
                                <TabsTrigger key={t.value} value={t.value} className={cn("gap-1.5 text-xs", type === t.value && t.color)}>
                                    {t.icon}
                                    {t.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>

                    <div className="space-y-1.5">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            min="0"
                            step="any"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        {parsedAmount > 0 && (
                            <p className={cn("text-sm font-medium", preview < 0 ? "text-destructive" : "text-muted-foreground")}>
                                After adjustment: <strong>{preview} {unitName}</strong>
                                {preview < 0 && " — would result in negative stock"}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="notes">
                            {needsNote ? "Reason (required)" : "Notes (optional)"}
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder={needsNote ? "Reason for removal…" : "e.g. Weekly delivery from supplier"}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isAdjusting || parsedAmount <= 0 || (needsNote && !notes.trim()) || preview < 0}
                    >
                        {isAdjusting ? "Saving…" : "Confirm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
