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
import { CheckCircle2, Minus, Plus } from "lucide-react";

interface Props {
    businessId: string;
    orderId: string;
    orderTotal: number;
    orderItems: Array<{ id: string; nameSnapshot: string; totalPrice: number }>;
    onAllPaid: () => void;
}

type SplitMode = "none" | "equal" | "by_items";

function fmt(n: number) {
    return `$${n.toFixed(2)}`;
}

export default function SplitBillPanel({
    businessId,
    orderId,
    orderTotal,
    orderItems,
    onAllPaid,
}: Props) {
    const qc = useQueryClient();
    const [mode, setMode] = useState<SplitMode>("none");
    const [count, setCount] = useState(2);
    const [itemAssignments, setItemAssignments] = useState<Record<string, string>>({});

    const { data: splits } = useQuery({
        queryKey: ["splits", orderId],
        queryFn: () => splitsApi.list(businessId, orderId),
    });

    const createMutation = useMutation({
        mutationFn: (payload: CreateSplitsPayload) =>
            splitsApi.create(businessId, orderId, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["splits", orderId] });
            setMode("none");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => splitsApi.remove(businessId, orderId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["splits", orderId] });
            setMode("none");
        },
    });

    function handleCreateEqual() {
        createMutation.mutate({ type: "equal", count });
    }

    function handleCreateByItems() {
        const groups: Record<string, string[]> = {};
        for (const [itemId, label] of Object.entries(itemAssignments)) {
            if (!groups[label]) groups[label] = [];
            groups[label].push(itemId);
        }
        const parts = Object.entries(groups).map(([label, itemIds]) => ({ label, itemIds }));
        createMutation.mutate({ type: "by_items", parts });
    }

    const hasSplits = splits && splits.length > 0;
    const allPaid = hasSplits && splits.every((s) => s.paymentStatus === "PAID");

    if (allPaid) {
        return (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
                <p className="font-semibold">All splits paid</p>
                <Button onClick={onAllPaid} className="w-full">
                    Complete Order
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Mode selector (only before splits are created) */}
            {!hasSplits && (
                <div className="flex gap-2 bg-muted p-1 rounded-lg">
                    {(["equal", "by_items"] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m === mode ? "none" : m)}
                            className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${
                                mode === m
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground"
                            }`}
                        >
                            {m === "equal" ? "Split Equally" : "Split by Items"}
                        </button>
                    ))}
                </div>
            )}

            {/* Equal split config */}
            {mode === "equal" && !hasSplits && (
                <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Number of people</span>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setCount((c) => Math.max(2, c - 1))}
                                className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center"
                            >
                                <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-bold text-lg">{count}</span>
                            <button
                                onClick={() => setCount((c) => c + 1)}
                                className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-muted-foreground text-xs">Each person pays</p>
                        <p className="text-2xl font-bold text-foreground">
                            {fmt(orderTotal / count)}
                        </p>
                    </div>
                    <Button
                        onClick={handleCreateEqual}
                        disabled={createMutation.isPending}
                        className="w-full"
                    >
                        {createMutation.isPending ? "Creating..." : `Split into ${count}`}
                    </Button>
                </div>
            )}

            {/* By-items config */}
            {mode === "by_items" && !hasSplits && (
                <ByItemsConfig
                    items={orderItems}
                    assignments={itemAssignments}
                    onChange={setItemAssignments}
                    onConfirm={handleCreateByItems}
                    loading={createMutation.isPending}
                />
            )}

            {/* Splits list */}
            {hasSplits && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Splits</p>
                        <button
                            onClick={() => deleteMutation.mutate()}
                            className="text-xs text-destructive hover:text-destructive/80 underline"
                        >
                            Remove split
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
        </div>
    );
}

const GUEST_LABELS = ["Guest 1", "Guest 2", "Guest 3", "Guest 4", "Guest 5", "Guest 6"];

function ByItemsConfig({
    items,
    assignments,
    onChange,
    onConfirm,
    loading,
}: {
    items: Props["orderItems"];
    assignments: Record<string, string>;
    onChange: (a: Record<string, string>) => void;
    onConfirm: () => void;
    loading: boolean;
}) {
    const allAssigned = items.every((item) => assignments[item.id]);

    return (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <p className="text-xs text-muted-foreground">Assign each item to a guest</p>
            {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.nameSnapshot}</p>
                        <p className="text-xs text-muted-foreground">{fmt(item.totalPrice)}</p>
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end">
                        {GUEST_LABELS.map((label) => (
                            <button
                                key={label}
                                onClick={() => onChange({ ...assignments, [item.id]: label })}
                                className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                                    assignments[item.id] === label
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                            >
                                {label.replace("Guest ", "G")}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
            <Button
                onClick={onConfirm}
                disabled={!allAssigned || loading}
                className="w-full mt-2"
            >
                {loading ? "Creating..." : "Confirm Split"}
            </Button>
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
    const [showPayment, setShowPayment] = useState(false);
    const [method, setMethod] = useState<"cash" | "card">("card");
    const [tip, setTip] = useState("");
    const [loading, setLoading] = useState(false);

    const remaining = split.amount - split.amountPaid;
    const tipNum = parseFloat(tip) || 0;

    async function handlePay() {
        setLoading(true);
        try {
            await splitsApi.pay(
                businessId,
                orderId,
                split.id,
                { amount: remaining, method, tipAmount: tipNum },
                crypto.randomUUID(),
            );
            setShowPayment(false);
            onPaid();
        } finally {
            setLoading(false);
        }
    }

    const statusVariant = {
        UNPAID: "destructive",
        PARTIALLY_PAID: "secondary",
        PAID: "default",
    }[split.paymentStatus] as "destructive" | "secondary" | "default";

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
                <div>
                    <p className="font-medium text-sm">{split.label}</p>
                    <Badge variant={statusVariant} className="text-xs mt-0.5">
                        {split.paymentStatus === "PAID"
                            ? "Paid"
                            : split.paymentStatus === "PARTIALLY_PAID"
                            ? `${fmt(remaining)} remaining`
                            : "Unpaid"}
                    </Badge>
                </div>
                <div className="text-right">
                    <p className="font-bold">{fmt(split.amount)}</p>
                    {split.paymentStatus !== "PAID" && (
                        <button
                            onClick={() => setShowPayment((v) => !v)}
                            className="text-xs text-primary underline mt-1"
                        >
                            {showPayment ? "Cancel" : "Pay"}
                        </button>
                    )}
                    {split.paymentStatus === "PAID" && (
                        <CheckCircle2 className="w-4 h-4 text-primary ml-auto mt-1" />
                    )}
                </div>
            </div>

            {showPayment && split.paymentStatus !== "PAID" && (
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
                        {loading ? "Processing..." : `Charge ${fmt(remaining + tipNum)}`}
                    </Button>
                </div>
            )}
        </div>
    );
}
