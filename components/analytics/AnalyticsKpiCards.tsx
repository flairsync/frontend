import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailySalesMetric } from "@/models/analytics";
import { DollarSign, ShoppingBag, TrendingUp } from "lucide-react";

interface AnalyticsKpiCardsProps {
    sales: DailySalesMetric[];
    currency?: string;
}

export const AnalyticsKpiCards: React.FC<AnalyticsKpiCardsProps> = ({ sales, currency = "$" }) => {
    const { totalRevenue, totalOrders, aov } = useMemo(() => {
        let rev = 0;
        let orders = 0;

        sales.forEach((day) => {
            rev += Number(day.totalRevenue || 0);
            orders += Number(day.orderCount || 0);
        });

        const avg = orders > 0 ? rev / orders : 0;

        return {
            totalRevenue: rev,
            totalOrders: orders,
            aov: avg,
        };
    }, [sales]);

    const formatCurrency = (val: number) => `${currency}${val.toFixed(2)}`;

    const stats = [
        {
            key: "revenue",
            label: "Total Revenue",
            value: formatCurrency(totalRevenue),
            icon: DollarSign,
        },
        {
            key: "orders",
            label: "Total Orders",
            value: totalOrders.toString(),
            icon: ShoppingBag,
        },
        {
            key: "aov",
            label: "Average Order Value",
            value: formatCurrency(aov),
            icon: TrendingUp,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                {stat.value}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
