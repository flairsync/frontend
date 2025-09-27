import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import React from 'react'
import { Edit3 } from 'lucide-react'
const ManagerScheduleStaffSchedulingTab = () => {
    return (
        <Card>
            <CardHeader className="flex items-center justify-between">
                <CardTitle>Manage Shifts</CardTitle>

            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Shift Name</TableHead>
                            <TableHead>Staff Assigned</TableHead>
                            <TableHead>Start</TableHead>
                            <TableHead>End</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Morning</TableCell>
                            <TableCell>Jane Doe</TableCell>
                            <TableCell>09:00</TableCell>
                            <TableCell>13:00</TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon">
                                    <Edit3 className="w-4 h-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Evening</TableCell>
                            <TableCell>John Smith</TableCell>
                            <TableCell>16:00</TableCell>
                            <TableCell>22:00</TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon">
                                    <Edit3 className="w-4 h-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default ManagerScheduleStaffSchedulingTab