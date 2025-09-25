import React from 'react'

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

// Mock data for orders per day
const ordersPerDay = [
    { day: "1", orders: 3 },
    { day: "2", orders: 5 },
    { day: "3", orders: 2 },
    { day: "4", orders: 6 },
    { day: "5", orders: 4 },
    { day: "6", orders: 7 },
    { day: "7", orders: 3 },
    { day: "8", orders: 8 },
    { day: "9", orders: 5 },
    { day: "10", orders: 6 },
    { day: "11", orders: 2 },
    { day: "12", orders: 4 },
    { day: "13", orders: 7 },
    { day: "14", orders: 3 },
    { day: "15", orders: 9 },
    { day: "16", orders: 6 },
    { day: "17", orders: 5 },
    { day: "18", orders: 7 },
    { day: "19", orders: 4 },
    { day: "20", orders: 8 },
    { day: "21", orders: 3 },
    { day: "22", orders: 6 },
    { day: "23", orders: 2 },
    { day: "24", orders: 5 },
    { day: "25", orders: 7 },
    { day: "26", orders: 6 },
    { day: "27", orders: 8 },
    { day: "28", orders: 5 },
    { day: "29", orders: 9 },
    { day: "30", orders: 4 },
]


const ProfileOverviewOrdersChart = () => {
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Orders Per Day (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={ordersPerDay}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}

export default ProfileOverviewOrdersChart