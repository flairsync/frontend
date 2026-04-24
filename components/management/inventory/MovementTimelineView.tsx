import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInventoryTimeline } from "@/features/inventory/useInventory";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface MovementTimelineViewProps {
    businessId: string;
}

const MOVEMENT_STYLES: Record<string, { label: string; color: string }> = {
    PURCHASE: { label: "Stock Added", color: "bg-green-100 text-green-800 border-green-200" },
    SALE_CONSUMPTION: { label: "Sold / Consumed", color: "bg-blue-100 text-blue-800 border-blue-200" },
    WASTE: { label: "Waste Recorded", color: "bg-orange-100 text-orange-800 border-orange-200" },
    ADJUSTMENT: { label: "Manual Adjustment", color: "bg-gray-100 text-gray-800 border-gray-200" },
    RETURN: { label: "Returned", color: "bg-teal-100 text-teal-800 border-teal-200" },
    IN: { label: "Stock Added", color: "bg-green-100 text-green-800 border-green-200" },
    OUT: { label: "Consumed", color: "bg-blue-100 text-blue-800 border-blue-200" },
};

const SOURCE_LABELS: Record<string, string> = {
    ORDER: "Order",
    MANUAL: "Manual",
    SYSTEM: "System",
};

const MOVEMENT_TYPES = [
    { value: "all", label: "All types" },
    { value: "PURCHASE", label: "Stock Added" },
    { value: "SALE_CONSUMPTION", label: "Sold / Consumed" },
    { value: "WASTE", label: "Waste" },
    { value: "ADJUSTMENT", label: "Adjustment" },
    { value: "RETURN", label: "Returned" },
];

const SOURCE_TYPES = [
    { value: "all", label: "All sources" },
    { value: "ORDER", label: "Order" },
    { value: "MANUAL", label: "Manual" },
    { value: "SYSTEM", label: "System" },
];

export const MovementTimelineView: React.FC<MovementTimelineViewProps> = ({ businessId }) => {
    const [page, setPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState("all");
    const [sourceFilter, setSourceFilter] = useState("all");

    const { data, isFetching } = useInventoryTimeline(businessId, {
        page,
        limit: 25,
        type: typeFilter === "all" ? undefined : typeFilter,
        sourceType: sourceFilter === "all" ? undefined : sourceFilter,
    });

    const movements = data?.movements ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-[180px] h-9">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {MOVEMENT_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-[160px] h-9">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {SOURCE_TYPES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {isFetching ? (
                <div className="py-10 text-center text-muted-foreground animate-pulse">Loading movements…</div>
            ) : movements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                    <Activity className="w-10 h-10 mb-3 opacity-20" />
                    <p className="font-medium">No movements found.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {movements.map((m: any) => {
                        const style = MOVEMENT_STYLES[m.type] ?? { label: m.type, color: "bg-gray-100 text-gray-800 border-gray-200" };
                        const isNegative = ["SALE_CONSUMPTION", "WASTE", "OUT"].includes(m.type);
                        return (
                            <div key={m.id} className="flex flex-col gap-1 p-3 rounded-lg border bg-card">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={cn("text-[11px] font-medium border", style.color)}>
                                            {style.label}
                                        </Badge>
                                        {m.item?.name && (
                                            <span className="text-sm font-medium">{m.item.name}</span>
                                        )}
                                    </div>
                                    <span className={cn("text-sm font-bold tabular-nums", isNegative ? "text-red-600" : "text-green-600")}>
                                        {isNegative ? "-" : "+"}{m.quantity} → {m.quantityAfter}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                        {SOURCE_LABELS[m.sourceType] ?? m.sourceType}
                                        {m.sourceType === "ORDER" && m.referenceId && (
                                            <span className="ml-1 font-mono">#{String(m.referenceId).slice(0, 8)}</span>
                                        )}
                                    </span>
                                    <span>{format(new Date(m.createdAt), "MMM d, h:mm a")}</span>
                                </div>
                                {m.notes && (
                                    <p className="text-xs text-muted-foreground italic">{m.notes}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || isFetching}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">{page} / {pagination.pages}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages || isFetching}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
};
