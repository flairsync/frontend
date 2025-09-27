import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CalendarDays, Clock, Users } from 'lucide-react'
import React from 'react'

const ManagerScheduleSummary = () => {
    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Clocked In</CardTitle>
                    <Users className="w-4 h-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">8</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Shifts Today</CardTitle>
                    <Clock className="w-4 h-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">15</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Shifts</CardTitle>
                    <CalendarDays className="w-4 h-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">6</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Absent</CardTitle>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">2</p>
                </CardContent>
            </Card>
        </div>
    )
}

export default ManagerScheduleSummary