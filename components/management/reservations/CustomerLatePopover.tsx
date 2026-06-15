import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCustomerLate } from "@/features/reservations/useReservationDashboard";
import { Clock, Loader2 } from "lucide-react";

interface CustomerLatePopoverProps {
    businessId: string;
    reservationId: string;
}

export const CustomerLatePopover: React.FC<CustomerLatePopoverProps> = ({ businessId, reservationId }) => {
    const [open, setOpen] = useState(false);
    const [delay, setDelay] = useState<string>("");
    const [notes, setNotes] = useState("");

    const { mutate: recordLate, isPending } = useCustomerLate(businessId);

    const handleSubmit = () => {
        recordLate(
            {
                reservationId,
                data: {
                    estimatedDelayMinutes: delay ? Number(delay) : undefined,
                    notes: notes || undefined,
                },
            },
            { onSuccess: () => { setOpen(false); setDelay(""); setNotes(""); } }
        );
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                    <Clock className="w-3.5 h-3.5 mr-1" /> Running Late
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 space-y-3">
                <p className="text-sm font-semibold">Customer Running Late</p>
                <div className="space-y-1">
                    <Label className="text-xs">Estimated delay (minutes)</Label>
                    <Input type="number" min={1} max={120} value={delay} onChange={(e) => setDelay(e.target.value)} placeholder="e.g. 15" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Notes (optional)</Label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Called ahead, traffic…" rows={2} />
                </div>
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button size="sm" disabled={isPending} onClick={handleSubmit}>
                        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Record"}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};
