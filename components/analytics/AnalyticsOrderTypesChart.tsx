import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DailySalesMetric } from "@/models/analytics";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";

interface AnalyticsOrderTypesChartProps {
    sales: DailySalesMetric[];
}

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'];

export const AnalyticsOrderTypesChart: React.FC<AnalyticsOrderTypesChartProps> = ({ sales }) => {
    const { t } = useTranslation("management");

    const chartData = useMemo(() => {
        let takeaway = 0;
        let dineIn = 0;
        let delivery = 0;

        sales.forEach((day) => {
            takeaway += Number(day.takeawayCount || 0);
            dineIn += Number(day.dineInCount || 0);
            delivery += Number(day.deliveryCount || 0);
        });

        return [
            { name: t("analytics.order_types_chart.dine_in"), value: dineIn },
            { name: t("analytics.order_types_chart.takeaway"), value: takeaway },
            { name: t("analytics.order_types_chart.delivery"), value: delivery }
        ].filter(item => item.value > 0); // Hide empty segments
    }, [sales, t]);

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>{t("analytics.order_types_chart.title")}</CardTitle>
                <CardDescription>{t("analytics.order_types_chart.description")}</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
                {chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        {t("analytics.order_types_chart.no_data")}
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => [value, t("analytics.order_types_chart.tooltip_label")]} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
};
