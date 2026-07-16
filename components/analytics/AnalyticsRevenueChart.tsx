import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DailySalesMetric } from "@/models/analytics";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

interface AnalyticsRevenueChartProps {
    sales: DailySalesMetric[];
    currency: string;
}

export const AnalyticsRevenueChart: React.FC<AnalyticsRevenueChartProps> = ({ sales, currency }) => {
    const { t } = useTranslation("management");

    // Format the data for the chart, enforcing number types
    const chartData = useMemo(() => {
        return sales.map(day => ({
            dateStr: format(parseISO(day.date), "MMM d"),
            originalDate: day.date,
            revenue: Number(day.totalRevenue || 0),
        })).sort((a, b) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime());
    }, [sales]);

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>{t("analytics.revenue_chart.title")}</CardTitle>
                <CardDescription>{t("analytics.revenue_chart.description")}</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="dateStr"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12, fill: '#888' }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12, fill: '#888' }}
                            tickFormatter={(value) => `${currency}${value}`}
                        />
                        <Tooltip
                            formatter={(value: number) => [`${currency}${value.toFixed(2)}`, t("analytics.revenue_chart.tooltip_label")]}
                            labelFormatter={(label) => t("analytics.revenue_chart.date_label", { date: label })}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#4F46E5"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#4F46E5', strokeWidth: 0 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};
