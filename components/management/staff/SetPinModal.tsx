import { useState } from "react";
import flairapi from "@/lib/flairapi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

interface Props {
    open: boolean;
    businessId: string;
    employee: { id: string; name: string };
    onClose: () => void;
}

async function setStaffPin(businessId: string, empId: string, pin: string) {
    await flairapi.patch(
        `${import.meta.env.BASE_URL}/employments/bus/${businessId}/employees/${empId}/pin`,
        { pin },
    );
}

export default function SetPinModal({ open, businessId, employee, onClose }: Props) {
    const [pin, setPin] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isValid =
        pin.length === 4 &&
        /^\d{4}$/.test(pin) &&
        pin === confirm;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isValid) return;
        setLoading(true);
        setError("");
        try {
            await setStaffPin(businessId, employee.id, pin);
            toast.success(`PIN set for ${employee.name}. They can now log in at any POS terminal.`);
            setPin("");
            setConfirm("");
            onClose();
        } catch (e: any) {
            setError(e.response?.data?.message ?? "Failed to set PIN");
        } finally {
            setLoading(false);
        }
    }

    function handleOpenChange(open: boolean) {
        if (!open) {
            setPin("");
            setConfirm("");
            setError("");
            onClose();
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <KeyRound className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <DialogTitle>Set PIN — {employee.name}</DialogTitle>
                            <DialogDescription>
                                The staff member will use this PIN to log in at any POS terminal.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <PinInput label="New PIN" value={pin} onChange={setPin} />
                    <PinInput label="Confirm PIN" value={confirm} onChange={setConfirm} />

                    {pin.length === 4 && confirm.length === 4 && pin !== confirm && (
                        <p className="text-destructive text-sm">PINs do not match</p>
                    )}
                    {error && <p className="text-destructive text-sm">{error}</p>}

                    <div className="flex gap-2 justify-end pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!isValid || loading}>
                            {loading ? "Saving..." : "Save PIN"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function PinInput({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={value}
                onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="text-center tracking-widest text-2xl font-mono"
                placeholder="••••"
            />
        </div>
    );
}
