import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useInventoryDashboard } from "@/features/inventory/useInventory";
import { Package, AlertTriangle, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InventoryDashboardCardsProps {
    businessId: string;
    onLowStockClick?: () => void;
}

export const InventoryDashboardCards: React.FC<InventoryDashboardCardsProps> = ({
    businessId,
    onLowStockClick,
}) => {
    const { data, isFetching } = useInventoryDashboard(businessId);

    const cards = [
        {
            label: "Total Items",
            value: data?.totalItems ?? 0,
            icon: <Package className="w-5 h-5 text-blue-500" />,
            bg: "bg-blue-50 dark:bg-blue-950/30",
        },
        {
            label: "Low Stock",
            value: data?.lowStockItems ?? 0,
            icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
            bg: "bg-orange-50 dark:bg-orange-950/30",
            alert: (data?.lowStockItems ?? 0) > 0,
            onClick: onLowStockClick,
        },
        {
            label: "Total Stock Units",
            value: data?.totalStockUnits != null ? Number(data.totalStockUnits).toLocaleString() : 0,
            icon: <BarChart2 className="w-5 h-5 text-green-500" />,
            bg: "bg-green-50 dark:bg-green-950/30",
        },
    ];

    if (isFetching && !data) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-5 h-20" />
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cards.map((card) => (
                <Card
                    key={card.label}
                    className={cn(
                        "transition-shadow",
                        card.onClick && "cursor-pointer hover:shadow-md",
                        card.alert && "ring-1 ring-orange-400"
                    )}
                    onClick={card.onClick}
                >
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className={cn("rounded-full p-2.5", card.bg)}>{card.icon}</div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{card.label}</p>
                            <p className={cn("text-2xl font-bold", card.alert && "text-orange-600")}>{card.value}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
