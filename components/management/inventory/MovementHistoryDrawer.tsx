import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInventoryMovements } from "@/features/inventory/useInventory";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface MovementHistoryDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: any | null;
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

const getQtySign = (type: string, qty: number) => {
    const negative = ["SALE_CONSUMPTION", "WASTE", "OUT"].includes(type);
    return negative ? `-${qty}` : `+${qty}`;
};

export const MovementHistoryDrawer: React.FC<MovementHistoryDrawerProps> = ({
    open,
    onOpenChange,
    item,
    businessId,
}) => {
    const [page, setPage] = useState(1);

    const { data, isFetching } = useInventoryMovements(businessId, item?.id ?? null, { page, limit: 20 });
    const movements = data?.movements ?? [];
    const pagination = data?.pagination;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader className="pb-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Movement History — {item?.name}
                    </SheetTitle>
                </SheetHeader>

                <div className="mt-4 space-y-3">
                    {isFetching ? (
                        <div className="py-10 text-center text-muted-foreground animate-pulse">Loading history…</div>
                    ) : movements.length === 0 ? (
                        <div className="py-10 text-center text-muted-foreground">No movements recorded yet.</div>
                    ) : (
                        movements.map((m: any) => {
                            const style = MOVEMENT_STYLES[m.type] ?? { label: m.type, color: "bg-gray-100 text-gray-800 border-gray-200" };
                            const isNegative = ["SALE_CONSUMPTION", "WASTE", "OUT"].includes(m.type);
                            return (
                                <div key={m.id} className="flex flex-col gap-1 p-3 rounded-lg border bg-card">
                                    <div className="flex items-center justify-between gap-2">
                                        <Badge variant="outline" className={cn("text-[11px] font-medium border", style.color)}>
                                            {style.label}
                                        </Badge>
                                        <span className={cn("text-sm font-bold tabular-nums", isNegative ? "text-red-600" : "text-green-600")}>
                                            {getQtySign(m.type, m.quantity)} → {m.quantityAfter}
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
                                        <p className="text-xs text-muted-foreground italic mt-0.5">{m.notes}</p>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {pagination && pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">{page} / {pagination.pages}</span>
                        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};
