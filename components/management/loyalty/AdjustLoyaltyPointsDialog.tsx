import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { PlusCircle, MinusCircle } from "lucide-react";
import { LoyaltyMember } from "@/features/loyalty/loyalty-api";

type AdjustDirection = "add" | "remove";

interface AdjustLoyaltyPointsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: LoyaltyMember | null;
    onConfirm: (userId: string, delta: number, note?: string) => Promise<void>;
    isAdjusting: boolean;
}

export function AdjustLoyaltyPointsDialog({ open, onOpenChange, member, onConfirm, isAdjusting }: AdjustLoyaltyPointsDialogProps) {
    const [direction, setDirection] = useState<AdjustDirection>("add");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");

    useEffect(() => {
        if (open) {
            setDirection("add");
            setAmount("");
            setNote("");
        }
    }, [open, member]);

    const currentBalance = member?.balance ?? 0;
    const parsedAmount = Math.floor(Math.abs(Number(amount)) || 0);
    const delta = direction === "add" ? parsedAmount : -parsedAmount;
    const previewBalance = currentBalance + delta;
    const needsNote = direction === "remove";

    const memberName = member ? [member.firstName, member.lastName].filter(Boolean).join(" ") || member.email : "";

    const handleConfirm = async () => {
        if (!member || parsedAmount <= 0 || previewBalance < 0) return;
        await onConfirm(member.userId, delta, note || undefined);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Adjust Points — {memberName}</DialogTitle>
                    <DialogDescription>
                        Current balance: <strong>{currentBalance} pts</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <Tabs value={direction} onValueChange={(v) => setDirection(v as AdjustDirection)}>
                        <TabsList className="grid grid-cols-2 w-full">
                            <TabsTrigger value="add" className={cn("gap-1.5", direction === "add" && "text-green-600")}>
                                <PlusCircle className="w-4 h-4" />
                                Add
                            </TabsTrigger>
                            <TabsTrigger value="remove" className={cn("gap-1.5", direction === "remove" && "text-destructive")}>
                                <MinusCircle className="w-4 h-4" />
                                Remove
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="space-y-1.5">
                        <Label htmlFor="amount">Points</Label>
                        <Input
                            id="amount"
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        {parsedAmount > 0 && (
                            <p className={cn("text-sm font-medium", previewBalance < 0 ? "text-destructive" : "text-muted-foreground")}>
                                New balance: <strong>{previewBalance} pts</strong>
                                {previewBalance < 0 && " — would go below zero"}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="note">{needsNote ? "Reason (required)" : "Note (optional)"}</Label>
                        <Textarea
                            id="note"
                            placeholder={needsNote ? "Reason for removing points…" : "e.g. Goodwill gesture for delayed order"}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
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
                        disabled={isAdjusting || parsedAmount <= 0 || (needsNote && !note.trim()) || previewBalance < 0}
                    >
                        {isAdjusting ? "Saving…" : "Confirm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
