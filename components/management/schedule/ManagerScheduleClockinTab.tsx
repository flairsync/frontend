import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Clock } from 'lucide-react'
import React from 'react'

const ManagerScheduleClockinTab = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Current Clock-ins
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Staff</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Clock-in Time</TableHead>
                            <TableHead>Clock-out Time</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Jane Doe</TableCell>
                            <TableCell>Waiter</TableCell>
                            <TableCell>09:00</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell className="text-green-600">Clocked in</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>John Smith</TableCell>
                            <TableCell>Chef</TableCell>
                            <TableCell>08:30</TableCell>
                            <TableCell>16:30</TableCell>
                            <TableCell className="text-slate-500">Clocked out</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default ManagerScheduleClockinTab