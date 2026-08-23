import React from "react";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation("management");
    const { data: items, isFetching } = useInventoryLowStock(businessId);

    if (isFetching) {
        return (
            <div className="py-10 text-center text-muted-foreground animate-pulse">{t("low_stock_items_view.loading")}</div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <AlertTriangle className="w-10 h-10 mb-3 opacity-20" />
                <p className="font-medium">{t("low_stock_items_view.all_good")}</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow>
                        <TableHead className="font-semibold">{t("low_stock_items_view.col_item")}</TableHead>
                        <TableHead className="font-semibold">{t("low_stock_items_view.col_group")}</TableHead>
                        <TableHead className="text-right font-semibold">{t("low_stock_items_view.col_current_stock")}</TableHead>
                        <TableHead className="text-right font-semibold">{t("low_stock_items_view.col_threshold")}</TableHead>
                        <TableHead className="text-right font-semibold">{t("low_stock_items_view.col_actions")}</TableHead>
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
                                    {item.group?.name ?? t("low_stock_items_view.default_group")}
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
                                    {t("low_stock_items_view.adjust")}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
