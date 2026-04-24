import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInventoryLowStock } from "@/features/inventory/useInventory";
import { AlertTriangle, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface LowStockItemsViewProps {
    businessId: string;
    onAdjust: (item: any) => void;
    getUnitName: (unitId: number) => string;
}

export const LowStockItemsView: React.FC<LowStockItemsViewProps> = ({
    businessId,
    onAdjust,
    getUnitName,
}) => {
    const { data: items, isFetching } = useInventoryLowStock(businessId);

    if (isFetching) {
        return (
            <div className="py-10 text-center text-muted-foreground animate-pulse">Loading low-stock items…</div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <AlertTriangle className="w-10 h-10 mb-3 opacity-20" />
                <p className="font-medium">All good — no low-stock items.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow>
                        <TableHead className="font-semibold">Item</TableHead>
                        <TableHead className="font-semibold">Group</TableHead>
                        <TableHead className="text-right font-semibold">Current Stock</TableHead>
                        <TableHead className="text-right font-semibold">Threshold</TableHead>
                        <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item: any) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                                    {item.name}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="font-normal">
                                    {item.group?.name ?? "Default"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <span className={cn(
                                    "inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-full text-sm font-bold bg-destructive/10 text-destructive"
                                )}>
                                    {item.quantity} {getUnitName(item.unitId)}
                                </span>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">{item.lowStockThreshold}</TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => onAdjust(item)}>
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                    Adjust
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
