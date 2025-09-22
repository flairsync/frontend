"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"

export default function StaffShiftsPage() {
    return (
        <div className="space-y-6 p-6">
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Shifts</h1>
                    <p className="text-muted-foreground">Here’s your upcoming schedule and recent shifts.</p>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Request Time Off
                </Button>
            </div>

            {/* Upcoming Shift */}
            <Card>
                <CardHeader>
                    <CardTitle>Next Shift</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Tuesday, Sep 24</span>
                        <Badge>Upcoming</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">09:00 AM - 05:00 PM • Coffee Shop A</p>
                    <div className="flex gap-2">
                        <Button size="sm">Clock In</Button>
                        <Button size="sm" variant="outline">Swap Shift</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Shift History */}
            <Card>
                <CardHeader>
                    <CardTitle>Shift History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Mon, Sep 16</TableCell>
                                <TableCell>09:00 AM - 05:00 PM</TableCell>
                                <TableCell>Coffee Shop A</TableCell>
                                <TableCell><Badge>Completed</Badge></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Thu, Sep 19</TableCell>
                                <TableCell>01:00 PM - 09:00 PM</TableCell>
                                <TableCell>Coffee Shop B</TableCell>
                                <TableCell><Badge variant="outline">Missed</Badge></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Sat, Sep 21</TableCell>
                                <TableCell>09:00 AM - 03:00 PM</TableCell>
                                <TableCell>Coffee Shop A</TableCell>
                                <TableCell><Badge>Completed</Badge></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
