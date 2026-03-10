import React, { useMemo } from "react";
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

const COLORS = ['#4F46E5', '#10B981', '#F59E0B'];

export const AnalyticsOrderTypesChart: React.FC<AnalyticsOrderTypesChartProps> = ({ sales }) => {
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
            { name: "Dine-In", value: dineIn },
            { name: "Takeaway", value: takeaway },
            { name: "Delivery", value: delivery }
        ].filter(item => item.value > 0); // Hide empty segments
    }, [sales]);

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Orders by Type</CardTitle>
                <CardDescription>Breakdown of fulfillments</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
                {chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-zinc-500">
                        No order data available.
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
                            <Tooltip formatter={(value: number) => [value, "Orders"]} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
};
