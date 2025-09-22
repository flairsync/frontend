"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A bar chart"

const chartData = [
    { day: "Monday", orders: 186 },
    { day: "Tuesday", orders: 305 },
    { day: "Wednesday", orders: 237 },
    { day: "Thursday", orders: 73 },
    { day: "Friday", orders: 209 },
    { day: "Saturday", orders: 214 },
    { day: "Sunday", orders: 214 },
]

const chartConfig = {
    orders: {
        label: "orders",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig

export function DashboardOrdersGraph() {
    return (
        <Card
            className="flex-1"
        >
            <CardHeader>
                <CardTitle>Weekly orders</CardTitle>
                <CardDescription>Septembner 2025</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="orders" fill="var(--color-orders)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>

        </Card>
    )
}
