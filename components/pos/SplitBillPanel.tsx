import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    splitsApi,
    OrderSplit,
    CreateSplitsPayload,
    PaySplitPayload,
} from "@/features/orders/service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { useBusinessBasicDetails } from "@/features/business/useBusinessBasicDetails";
import { formatCurrency } from "@/lib/formatCurrency";
import { toast } from "sonner";

interface Props {
    businessId: string;
    orderId: string;
    orderTotal: number;
    orderItems: Array<{ id: string; nameSnapshot?: string; totalPrice?: number }>;
    onAllPaid: () => void;
}

const GUEST_LABELS = ["Check 1", "Check 2", "Check 3", "Check 4", "Check 5", "Check 6"];

export default function SplitBillPanel({
    businessId,
    orderId,
    orderTotal,
    orderItems,
    onAllPaid,
}: Props) {
    const qc = useQueryClient();
    const { businessBasicDetails } = useBusinessBasicDetails(businessId);
    const currency = businessBasicDetails?.currency ?? "USD";
    const fmt = (n: number) => formatCurrency(n, currency);

    // item → check label assignment
    const [itemAssignments, setItemAssignments] = useState<Record<string, string>>({});
    const [checkCount, setCheckCount] = useState(2);
    const [showConfigurator, setShowConfigurator] = useState(false);

    const { data: splits, isLoading } = useQuery({
        queryKey: ["splits", orderId],
        queryFn: () => splitsApi.list(businessId, orderId),
    });

    const createMutation = useMutation({
        mutationFn: (payload: CreateSplitsPayload) =>
            splitsApi.create(businessId, orderId, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["splits", orderId] });
            setShowConfigurator(false);
            setItemAssignments({});
        },
        onError: (e: any) => {
            toast.error(e?.response?.data?.message ?? "Failed to create splits");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => splitsApi.remove(businessId, orderId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["splits", orderId] });
            setItemAssignments({});
        },
        onError: (e: any) => {
            if (e?.response?.status === 422) {
                toast.error("Cannot remove splits — at least one check already has a payment");
            } else {
                toast.error("Failed to remove splits");
            }
        },
    });

    const hasSplits = splits && splits.length > 0;
    const anyPaid = hasSplits && splits.some((s) => s.totalPaid > 0);
    const allPaid = hasSplits && splits.every((s) => s.paymentStatus === "paid");

    function handleCreateByItems() {
        const groups: Record<string, string[]> = {};
        for (const [itemId, label] of Object.entries(itemAssignments)) {
            if (!groups[label]) groups[label] = [];
            groups[label].push(itemId);
        }
        // Must have at least 2 checks
        const labels = Object.keys(groups);
        if (labels.length < 2) {
            toast.error("Assign items to at least 2 different checks");
            return;
        }
        // Validate label length
        for (const label of labels) {
            if (label.length > 60) {
                toast.error("Check label must be 60 characters or less");
                return;
            }
        }
        const payload: CreateSplitsPayload = {
            splits: labels.map((label) => ({ label, itemIds: groups[label] })),
        };
        createMutation.mutate(payload);
    }

    const activeItems = orderItems.filter((i) => i.id);
    const allAssigned = activeItems.length > 0 && activeItems.every((i) => itemAssignments[i.id]);
    const usedLabels = Array.from(new Set(Object.values(itemAssignments)));

    if (allPaid) {
        return (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
                <p className="font-semibold">All checks paid</p>
                <Button onClick={onAllPaid} className="w-full">
                    Complete Order
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Splits list */}
            {hasSplits && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{splits.length} Checks</p>
                        <button
                            onClick={() => deleteMutation.mutate()}
                            disabled={deleteMutation.isPending || anyPaid}
                            className={`text-xs underline ${
                                anyPaid
                                    ? "text-muted-foreground cursor-not-allowed"
                                    : "text-destructive hover:text-destructive/80"
                            }`}
                            title={anyPaid ? "Cannot remove — a payment has been recorded" : undefined}
                        >
                            {deleteMutation.isPending ? "Removing…" : "Remove Split"}
                        </button>
                    </div>
                    {splits.map((split) => (
                        <SplitRow
                            key={split.id}
                            split={split}
                            businessId={businessId}
                            orderId={orderId}
                            onPaid={() => qc.invalidateQueries({ queryKey: ["splits", orderId] })}
                        />
                    ))}
                </div>
            )}

            {/* Configurator — only shown before splits exist */}
            {!hasSplits && (
                <>
                    {!showConfigurator ? (
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setShowConfigurator(true)}
                        >
                            Split Bill
                        </Button>
                    ) : (
                        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                            <p className="text-sm font-semibold">Assign items to checks</p>
                            <p className="text-xs text-muted-foreground">
                                Tap a check label next to each item. All items must be assigned.
                            </p>

                            {/* Number of checks selector */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground flex-1">Checks</span>
                                {[2, 3, 4, 5, 6].map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => {
                                            setCheckCount(n);
                                            // Remove assignments for labels that no longer exist
                                            const validLabels = GUEST_LABELS.slice(0, n);
                                            setItemAssignments((prev) => {
                                                const next = { ...prev };
                                                for (const key of Object.keys(next)) {
                                                    if (!validLabels.includes(next[key])) delete next[key];
                                                }
                                                return next;
                                            });
                                        }}
                                        className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                                            checkCount === n
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        }`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>

                            {/* Item list with label assignment */}
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {activeItems.map((item) => {
                                    const assigned = itemAssignments[item.id];
                                    return (
                                        <div
                                            key={item.id}
                                            className={`p-2 rounded-lg border transition-all ${
                                                !assigned
                                                    ? "border-destructive/40 bg-destructive/5"
                                                    : "border-border bg-muted/20"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium truncate">
                                                        {item.nameSnapshot ?? "Item"}
                                                    </p>
                                                    {item.totalPrice !== undefined && (
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {fmt(item.totalPrice)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1 flex-wrap">
                                                {GUEST_LABELS.slice(0, checkCount).map((label) => (
                                                    <button
                                                        key={label}
                                                        onClick={() =>
                                                            setItemAssignments((prev) => ({
                                                                ...prev,
                                                                [item.id]: label,
                                                            }))
                                                        }
                                                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                                                            assigned === label
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                                        }`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {!allAssigned && activeItems.length > 0 && (
                                <p className="text-xs text-destructive font-medium">
                                    All items must be assigned to a check before splitting.
                                </p>
                            )}

                            {usedLabels.length < 2 && allAssigned && (
                                <p className="text-xs text-destructive font-medium">
                                    Items must be spread across at least 2 checks.
                                </p>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setShowConfigurator(false);
                                        setItemAssignments({});
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleCreateByItems}
                                    disabled={
                                        !allAssigned ||
                                        usedLabels.length < 2 ||
                                        createMutation.isPending
                                    }
                                >
                                    {createMutation.isPending ? "Creating…" : "Confirm Split"}
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function SplitRow({
    split,
    businessId,
    orderId,
    onPaid,
}: {
    split: OrderSplit;
    businessId: string;
    orderId: string;
    onPaid: () => void;
}) {
    const { businessBasicDetails } = useBusinessBasicDetails(businessId);
    const currency = businessBasicDetails?.currency ?? "USD";
    const fmt = (n: number) => formatCurrency(n, currency);

    const [showPayment, setShowPayment] = useState(false);
    const [method, setMethod] = useState<"cash" | "card">("card");
    const [cashTendered, setCashTendered] = useState("");
    const [tip, setTip] = useState("");
    const [loading, setLoading] = useState(false);

    const remaining = split.totalAmount - split.totalPaid;
    const tipNum = parseFloat(tip) || 0;

    async function handlePay() {
        setLoading(true);
        try {
            const payload: PaySplitPayload = {
                amount: remaining,
                method,
                tipAmount: tipNum || undefined,
                cashTendered: method === "cash" && cashTendered ? parseFloat(cashTendered) : undefined,
            };
            await splitsApi.pay(businessId, orderId, split.id, payload, crypto.randomUUID());
            setShowPayment(false);
            onPaid();
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? "Payment failed");
        } finally {
            setLoading(false);
        }
    }

    const statusVariant =
        split.paymentStatus === "paid"
            ? "default"
            : split.paymentStatus === "partially_paid"
            ? "secondary"
            : "destructive";

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-start justify-between px-4 py-3 gap-2">
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{split.label}</p>
                    {split.items && split.items.length > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                            {split.items.map((i) => i.nameSnapshot ?? "Item").join(", ")}
                        </p>
                    )}
                    <Badge variant={statusVariant} className="text-[10px] mt-1">
                        {split.paymentStatus === "paid"
                            ? "Paid"
                            : split.paymentStatus === "partially_paid"
                            ? `${fmt(remaining)} remaining`
                            : "Unpaid"}
                    </Badge>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm">{fmt(split.totalAmount)}</p>
                    {split.paymentStatus !== "paid" && (
                        <button
                            onClick={() => setShowPayment((v) => !v)}
                            className="text-xs text-primary underline mt-1"
                        >
                            {showPayment ? "Cancel" : "Pay Check"}
                        </button>
                    )}
                    {split.paymentStatus === "paid" && (
                        <CheckCircle2 className="w-4 h-4 text-primary ml-auto mt-1" />
                    )}
                </div>
            </div>

            {showPayment && split.paymentStatus !== "paid" && (
                <div className="border-t border-border px-4 py-3 space-y-2 bg-muted/30">
                    <div className="flex gap-2">
                        {(["card", "cash"] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => setMethod(m)}
                                className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all capitalize ${
                                    method === m
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                    {method === "cash" && (
                        <Input
                            type="number"
                            placeholder={`Cash tendered (min ${fmt(remaining)})`}
                            value={cashTendered}
                            onChange={(e) => setCashTendered(e.target.value)}
                            min={remaining}
                            step={0.01}
                            className="text-sm"
                        />
                    )}
                    <Input
                        type="number"
                        placeholder="Add tip (optional)"
                        value={tip}
                        onChange={(e) => setTip(e.target.value)}
                        min={0}
                        step={0.01}
                        className="text-sm"
                    />
                    <Button
                        onClick={handlePay}
                        disabled={loading}
                        className="w-full text-sm"
                        size="sm"
                    >
                        {loading ? "Processing…" : `Charge ${fmt(remaining + tipNum)}`}
                    </Button>
                </div>
            )}
        </div>
    );
}
