import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation("management");
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
                    <DialogTitle>{t("walk_in_modal.title")}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-1">
                        <Label className="text-xs">{t("walk_in_modal.name_label")} <span className="text-destructive">*</span></Label>
                        <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={t("walk_in_modal.name_placeholder")} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">{t("walk_in_modal.phone_label")}</Label>
                            <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+1 555 0000" type="tel" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">{t("walk_in_modal.email_label")}</Label>
                            <Input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="john@example.com" type="email" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs">{t("walk_in_modal.party_size_label")} <span className="text-destructive">*</span></Label>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <Input type="number" min={1} max={50} value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} className="w-24" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs">{t("walk_in_modal.table_label")} <span className="text-destructive">*</span></Label>
                        {checkingAvailability ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" /> {t("walk_in_modal.checking_availability")}
                            </div>
                        ) : (
                            <Select value={tableId} onValueChange={setTableId}>
                                <SelectTrigger>
                                    <SelectValue placeholder={availableTables.length === 0 ? t("walk_in_modal.no_tables_available") : t("walk_in_modal.select_table_placeholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTables.map((tbl: any) => (
                                        <SelectItem key={tbl.id} value={tbl.id}>
                                            {t("walk_in_modal.table_option", { name: tbl.name || t("walk_in_modal.table_fallback_name", { number: tbl.number || tbl.id.substring(0, 4) }), capacity: tbl.capacity })}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs">{t("walk_in_modal.notes_label")}</Label>
                        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("walk_in_modal.notes_placeholder")} rows={2} />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => { reset(); onOpenChange(false); }}>{t("walk_in_modal.cancel")}</Button>
                    <Button disabled={isPending || !customerName.trim() || !tableId} onClick={handleSubmit}>
                        {isPending ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> {t("walk_in_modal.creating")}</> : t("walk_in_modal.create")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
