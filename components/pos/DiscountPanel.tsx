import { useState } from "react";
import { discountsApi } from "@/features/orders/discounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, X } from "lucide-react";

interface Props {
    businessId: string;
    orderId: string;
    currentDiscount: number;
    onApplied: (updatedOrder: any) => void;
    onRemoved: (updatedOrder: any) => void;
}

type DiscountMode = "code" | "manual";

export default function DiscountPanel({
    businessId,
    orderId,
    currentDiscount,
    onApplied,
    onRemoved,
}: Props) {
    const [mode, setMode] = useState<DiscountMode>("code");
    const [code, setCode] = useState("");
    const [manualAmount, setManualAmount] = useState("");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleApply() {
        setLoading(true);
        setError("");
        try {
            const payload: any = { reason: reason || undefined };
            if (mode === "code") {
                if (!code.trim()) return;
                payload.code = code.trim().toUpperCase();
            } else {
                const amt = parseFloat(manualAmount);
                if (isNaN(amt) || amt <= 0) return;
                payload.manualAmount = amt;
            }
            const updated = await discountsApi.applyToOrder(businessId, orderId, payload);
            onApplied(updated);
        } catch (e: any) {
            setError(e.response?.data?.message ?? "Discount could not be applied");
        } finally {
            setLoading(false);
        }
    }

    async function handleRemove() {
        setLoading(true);
        try {
            const updated = await discountsApi.removeFromOrder(businessId, orderId);
            onRemoved(updated);
        } finally {
            setLoading(false);
        }
    }

    if (currentDiscount > 0) {
        return (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Tag className="w-4 h-4 text-primary" />
                    <div>
                        <p className="text-sm font-semibold text-foreground">Discount applied</p>
                        <p className="text-primary font-bold">−${currentDiscount.toFixed(2)}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    disabled={loading}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            {/* Mode toggle */}
            <div className="flex gap-2 bg-muted p-1 rounded-lg">
                {(["code", "manual"] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                            mode === m
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground"
                        }`}
                    >
                        {m === "code" ? "Discount Code" : "Manual Amount"}
                    </button>
                ))}
            </div>

            {mode === "code" ? (
                <Input
                    placeholder="Enter discount code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="font-mono tracking-widest uppercase"
                />
            ) : (
                <>
                    <Input
                        type="number"
                        placeholder="Amount ($)"
                        value={manualAmount}
                        onChange={(e) => setManualAmount(e.target.value)}
                        min={0}
                        step={0.01}
                    />
                    <Input
                        placeholder="Reason (required)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </>
            )}

            {error && <p className="text-destructive text-xs">{error}</p>}

            <Button
                onClick={handleApply}
                disabled={loading}
                className="w-full"
                size="sm"
            >
                {loading ? "Applying..." : "Apply Discount"}
            </Button>
        </div>
    );
}
