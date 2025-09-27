import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import React from 'react'

const ManagerScheduleShiftsTab = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Shift Templates</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Shift Name</TableHead>
                            <TableHead>Start</TableHead>
                            <TableHead>End</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Morning</TableCell>
                            <TableCell>07:00</TableCell>
                            <TableCell>12:00</TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm">Edit</Button>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Evening</TableCell>
                            <TableCell>13:00</TableCell>
                            <TableCell>18:00</TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm">Edit</Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default ManagerScheduleShiftsTab
