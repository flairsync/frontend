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
    { day: "Monday", sales: 186 },
    { day: "Tuesday", sales: 305 },
    { day: "Wednesday", sales: 237 },
    { day: "Thursday", sales: 73 },
    { day: "Friday", sales: 209 },
    { day: "Saturday", sales: 214 },
    { day: "Sunday", sales: 214 },
]

const chartConfig = {
    sales: {
        label: "Sales",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig

export function DashboardSalesGraph() {
    return (
        <Card
            className="flex-1"

        >
            <CardHeader>
                <CardTitle>Weekly sales</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
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
                        <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>

        </Card>
    )
}
