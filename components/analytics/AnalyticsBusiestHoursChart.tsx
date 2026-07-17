import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HourlyVisitorMetric } from "@/models/analytics";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface AnalyticsBusiestHoursChartProps {
    hourlyVisitors: HourlyVisitorMetric[];
}

function formatHour(hour: number): string {
    const period = hour < 12 ? "AM" : "PM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour} ${period}`;
}

export const AnalyticsBusiestHoursChart: React.FC<AnalyticsBusiestHoursChartProps> = ({ hourlyVisitors }) => {
    const { t } = useTranslation("management");

    // Always render all 24 hours, even ones with no data, so the shape of the day is clear.
    const chartData = useMemo(() => {
        const byHour = new Map(hourlyVisitors.map((h) => [Number(h.hour), h]));
        return Array.from({ length: 24 }, (_, hour) => {
            const entry = byHour.get(hour);
            return {
                hour,
                hourLabel: formatHour(hour),
                orderCount: Number(entry?.orderCount || 0),
                visitorCount: Number(entry?.visitorCount || 0),
                reservationCount: Number(entry?.reservationCount || 0),
            };
        });
    }, [hourlyVisitors]);

    const hasData = chartData.some((d) => d.orderCount > 0);

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>{t("analytics.busiest_hours_chart.title")}</CardTitle>
                <CardDescription>{t("analytics.busiest_hours_chart.description")}</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
                {!hasData ? (
                    <div className="flex items-center justify-center h-full text-zinc-500">
                        {t("analytics.busiest_hours_chart.no_data")}
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="hourLabel"
                                tickLine={false}
                                axisLine={false}
                                interval={2}
                                tick={{ fontSize: 12, fill: '#888' }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                                tick={{ fontSize: 12, fill: '#888' }}
                            />
                            <Tooltip
                                formatter={(value: number, name: string) => {
                                    if (name === "orderCount") return [value, t("analytics.busiest_hours_chart.tooltip_orders")];
                                    return [value, name];
                                }}
                                labelFormatter={(label) => label}
                            />
                            <Bar dataKey="orderCount" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
};
