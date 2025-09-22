import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";

const salesData = [
    { date: "2025-09-12", sales: 120 },
    { date: "2025-09-13", sales: 200 },
    { date: "2025-09-14", sales: 150 },
    { date: "2025-09-15", sales: 300 },
    { date: "2025-09-16", sales: 250 },
    { date: "2025-09-17", sales: 180 },
    { date: "2025-09-18", sales: 320 },
];

const topItems = [
    { name: "Cappuccino", sold: 50 },
    { name: "Margherita Pizza", sold: 35 },
    { name: "Chocolate Cake", sold: 25 },
    { name: "Latte", sold: 20 },
];

const staffPerformance = [
    { name: "Alice", ordersHandled: 40 },
    { name: "Bob", ordersHandled: 30 },
    { name: "Charlie", ordersHandled: 25 },
];

const OwnerAnalyticsPage: React.FC = () => {
    const [timeRange, setTimeRange] = useState("Last 7 Days");

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
                    Analytics & Reports
                </h1>

                <Separator />

                {/* Time Range Filter */}
                <div className="flex items-center gap-2">
                    <Select value={timeRange} onValueChange={(val) => setTimeRange(val)}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select Time Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
                            <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
                            <SelectItem value="This Month">This Month</SelectItem>
                            <SelectItem value="Last Month">Last Month</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Sales Over Time */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Over Time</CardTitle>
                        <CardDescription>Revenue generated in the selected time range</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="sales" stroke="#4F46E5" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top-Selling Items */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top-Selling Items</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topItems} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="name" />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="sold" fill="#4F46E5" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Staff Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Staff Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border-b p-2">Staff</th>
                                        <th className="border-b p-2">Orders Handled</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffPerformance.map((s) => (
                                        <tr key={s.name} className="hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                            <td className="p-2">{s.name}</td>
                                            <td className="p-2">{s.ordersHandled}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OwnerAnalyticsPage;
