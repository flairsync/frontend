import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailySalesMetric } from "@/models/analytics";
import { DollarSign, ShoppingBag, TrendingUp, HandCoins, ArrowUp, ArrowDown } from "lucide-react";

interface AnalyticsKpiCardsProps {
    sales: DailySalesMetric[];
    previousSales?: DailySalesMetric[];
    currency?: string;
}

function sumTotals(sales: DailySalesMetric[]) {
    let rev = 0;
    let orders = 0;
    let tips = 0;

    sales.forEach((day) => {
        rev += Number(day.totalRevenue || 0);
        orders += Number(day.orderCount || 0);
        tips += Number(day.totalTips || 0);
    });

    return {
        totalRevenue: rev,
        totalOrders: orders,
        aov: orders > 0 ? rev / orders : 0,
        totalTips: tips,
    };
}

// null = no comparable previous data (e.g. previous period had zero activity) — shown as "New" instead of a %.
function percentChange(current: number, previous: number): number | null {
    if (previous <= 0) return current > 0 ? null : 0;
    return ((current - previous) / previous) * 100;
}

const DeltaBadge: React.FC<{ delta: number | null }> = ({ delta }) => {
    if (delta === null) {
        return <span className="text-xs font-medium text-muted-foreground">New</span>;
    }
    if (delta === 0) {
        return <span className="text-xs font-medium text-muted-foreground">No change</span>;
    }
    const isUp = delta > 0;
    const Icon = isUp ? ArrowUp : ArrowDown;
    return (
        <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isUp ? "text-green-600" : "text-red-600"}`}>
            <Icon className="h-3 w-3" />
            {Math.abs(delta).toFixed(1)}%
        </span>
    );
};

export const AnalyticsKpiCards: React.FC<AnalyticsKpiCardsProps> = ({ sales, previousSales, currency = "$" }) => {
    const current = useMemo(() => sumTotals(sales), [sales]);
    const previous = useMemo(() => (previousSales ? sumTotals(previousSales) : null), [previousSales]);

    const formatCurrency = (val: number) => `${currency}${val.toFixed(2)}`;

    const stats = [
        {
            key: "revenue",
            label: "Total Revenue",
            value: formatCurrency(current.totalRevenue),
            delta: previous ? percentChange(current.totalRevenue, previous.totalRevenue) : undefined,
            icon: DollarSign,
        },
        {
            key: "orders",
            label: "Total Orders",
            value: current.totalOrders.toString(),
            delta: previous ? percentChange(current.totalOrders, previous.totalOrders) : undefined,
            icon: ShoppingBag,
        },
        {
            key: "aov",
            label: "Average Order Value",
            value: formatCurrency(current.aov),
            delta: previous ? percentChange(current.aov, previous.aov) : undefined,
            icon: TrendingUp,
        },
        {
            key: "tips",
            label: "Total Tips",
            value: formatCurrency(current.totalTips),
            delta: previous ? percentChange(current.totalTips, previous.totalTips) : undefined,
            icon: HandCoins,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.key} className="p-4 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                {stat.label}
                            </CardTitle>
                            <Icon className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent className="flex items-end justify-between gap-2">
                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                {stat.value}
                            </div>
                            {stat.delta !== undefined && (
                                <div className="pb-0.5" title="vs previous period">
                                    <DeltaBadge delta={stat.delta} />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
