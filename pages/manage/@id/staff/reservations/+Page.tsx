"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Clock, User, Table2 } from "lucide-react"
import { StaffAddReservationDrawer } from "@/components/staff/reservations/StaffAddReservationDrawer"
import { useState } from "react"

export default function StaffReservationsPage() {
    const [addingReservation, setAddingReservation] = useState(false);

    const upcomingReservations = [
        {
            id: "#R1024",
            name: "Sarah Smith",
            table: "Table 3",
            date: "2025-10-07",
            time: "19:30",
            guests: 2,
            status: "Confirmed",
        },
        {
            id: "#R1025",
            name: "John Doe",
            table: "Table 5",
            date: "2025-10-08",
            time: "20:00",
            guests: 4,
            status: "Pending",
        },
    ]

    const pastReservations = [
        {
            id: "#R1019",
            name: "Alice Green",
            table: "Table 2",
            date: "2025-09-29",
            time: "18:30",
            guests: 3,
            status: "Completed",
        },
    ]

    return (
        <div className="space-y-6 p-6">
            <StaffAddReservationDrawer
                open={addingReservation}
                onOpenChange={() => {
                    setAddingReservation(false);
                }}
            />
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Reservations</h1>
                    <p className="text-muted-foreground">
                        Manage upcoming and past reservations efficiently.
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setAddingReservation(true);
                    }}
                >Add New Reservation</Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid grid-cols-2 w-full max-w-[300px]">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>

                {/* Upcoming Reservations */}
                <TabsContent value="upcoming" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Reservations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Table</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Guests</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {upcomingReservations.map((rsv) => (
                                        <TableRow
                                            key={rsv.id}
                                            className="hover:bg-muted/50 transition-colors"
                                        >
                                            <TableCell>{rsv.id}</TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-muted-foreground" />
                                                    <span>{rsv.name}</span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Table2 className="w-4 h-4 text-muted-foreground" />
                                                    <span>{rsv.table}</span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                                                    <span>{rsv.date}</span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                                    <span>{rsv.time}</span>
                                                </div>
                                            </TableCell>

                                            <TableCell>{rsv.guests}</TableCell>

                                            <TableCell>
                                                {rsv.status === "Confirmed" && <Badge>Confirmed</Badge>}
                                                {rsv.status === "Pending" && (
                                                    <Badge variant="secondary">Pending</Badge>
                                                )}
                                            </TableCell>

                                            <TableCell className="text-right space-x-2">
                                                {rsv.status === "Pending" && (
                                                    <Button size="sm" variant="outline">
                                                        Approve
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="destructive">
                                                    Cancel
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Past Reservations */}
                <TabsContent value="past" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Past Reservations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Table</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Guests</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pastReservations.map((rsv) => (
                                        <TableRow
                                            key={rsv.id}
                                            className="hover:bg-muted/50 transition-colors"
                                        >
                                            <TableCell>{rsv.id}</TableCell>
                                            <TableCell>{rsv.name}</TableCell>
                                            <TableCell>{rsv.table}</TableCell>
                                            <TableCell>{rsv.date}</TableCell>
                                            <TableCell>{rsv.time}</TableCell>
                                            <TableCell>{rsv.guests}</TableCell>
                                            <TableCell>
                                                <Badge>Completed</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
