import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWalkIn } from "@/features/reservations/useReservationDashboard";
import { useAvailability } from "@/features/reservations/useReservations";
import { Loader2, Users } from "lucide-react";

interface WalkInModalProps {
    businessId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const WalkInModal: React.FC<WalkInModalProps> = ({ businessId, open, onOpenChange }) => {
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [guestCount, setGuestCount] = useState(2);
    const [tableId, setTableId] = useState("");
    const [notes, setNotes] = useState("");
    const [availableTables, setAvailableTables] = useState<any[]>([]);

    const { mutate: createWalkIn, isPending } = useWalkIn(businessId);
    const { mutate: checkAvailability, isPending: checkingAvailability } = useAvailability(businessId);

    // Fetch available tables whenever guest count changes
    useEffect(() => {
        if (!open) return;
        setTableId("");
        checkAvailability(
            { date: new Date().toISOString(), guestCount },
            { onSuccess: (tables: any[]) => setAvailableTables(tables) }
        );
    }, [guestCount, open]);

    const reset = () => {
        setCustomerName("");
        setCustomerPhone("");
        setCustomerEmail("");
        setGuestCount(2);
        setTableId("");
        setNotes("");
        setAvailableTables([]);
    };

    const handleSubmit = () => {
        if (!customerName.trim()) return;
        if (!tableId) return;

        createWalkIn(
            { customerName, customerPhone: customerPhone || undefined, customerEmail: customerEmail || undefined, guestCount, tableId, notes: notes || undefined },
            {
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>New Walk-In</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-1">
                        <Label className="text-xs">Customer Name <span className="text-red-500">*</span></Label>
                        <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="John Smith" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Phone</Label>
                            <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+1 555 0000" type="tel" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Email</Label>
                            <Input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="john@example.com" type="email" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs">Party Size <span className="text-red-500">*</span></Label>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <Input type="number" min={1} max={50} value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} className="w-24" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs">Table <span className="text-red-500">*</span></Label>
                        {checkingAvailability ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" /> Checking availability…
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

                    <div className="space-y-1">
                        <Label className="text-xs">Notes</Label>
                        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Allergies, preferences…" rows={2} />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
                    <Button disabled={isPending || !customerName.trim() || !tableId} onClick={handleSubmit}>
                        {isPending ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Creating…</> : "Create Walk-In"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
