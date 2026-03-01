"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Clock, User, Table2, Loader } from "lucide-react"
import { StaffAddReservationDrawer } from "@/components/staff/reservations/StaffAddReservationDrawer"
import { useState } from "react"
import { useReservations } from "@/features/reservations/useReservations"
import { usePageContext } from "vike-react/usePageContext"
import { format } from "date-fns"
import { useTranslation } from "react-i18next"

export default function StaffReservationsPage() {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;
    const { t } = useTranslation();
    const [addingReservation, setAddingReservation] = useState(false);

    const { reservations, fetchingReservations, updateReservation } = useReservations(businessId);

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 uppercase text-[10px]">Pending</Badge>;
            case 'confirmed': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase text-[10px]">Confirmed</Badge>;
            case 'waitlist': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px]">Waitlist</Badge>;
            case 'completed': return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 uppercase text-[10px]">Completed</Badge>;
            case 'no_show': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 uppercase text-[10px]">No Show</Badge>;
            case 'cancelled': return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 uppercase text-[10px]">Cancelled</Badge>;
            default: return <Badge variant="outline" className="uppercase text-[10px]">{status}</Badge>;
        }
    };

    const upcomingReservations = reservations?.filter((r: any) =>
        ['pending', 'confirmed', 'waitlist'].includes(r.status.toLowerCase())
    ) || [];

    const pastReservations = reservations?.filter((r: any) =>
        ['completed', 'no_show', 'cancelled', 'rejected'].includes(r.status.toLowerCase())
    ) || [];

    const handleUpdateStatus = (id: string, status: string) => {
        updateReservation({ reservationId: id, data: { status: status as any } });
    };

    return (
        <div className="space-y-6 p-6">
            <StaffAddReservationDrawer
                open={addingReservation}
                onOpenChange={() => setAddingReservation(false)}
            />
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Reservations</h1>
                    <p className="text-muted-foreground">
                        Manage upcoming and past reservations efficiently.
                    </p>
                </div>
                <Button
                    onClick={() => setAddingReservation(true)}
                    className="w-full sm:w-auto"
                >
                    Add New Reservation
                </Button>
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
                        <CardContent className="p-0 sm:p-6">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Table</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Guests</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fetchingReservations ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-10">
                                                    <Loader className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                                                </TableCell>
                                            </TableRow>
                                        ) : upcomingReservations.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                                    No upcoming reservations found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            upcomingReservations.map((rsv: any) => (
                                                <TableRow key={rsv.id} className="hover:bg-muted/50 transition-colors">
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{rsv.customerName}</span>
                                                            <span className="text-xs text-muted-foreground">{rsv.customerPhone}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Table2 className="w-4 h-4 text-muted-foreground" />
                                                            <span>{rsv.tableId ? `Table ${rsv.tableId.substring(0, 4)}` : "Unassigned"}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                                                                <span>{format(new Date(rsv.reservationTime), "MMM d, yyyy")}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                                <Clock className="w-3 h-3" />
                                                                <span>{format(new Date(rsv.reservationTime), "h:mm a")}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{rsv.guestCount}</TableCell>
                                                    <TableCell>{getStatusBadge(rsv.status)}</TableCell>
                                                    <TableCell className="text-right space-x-2">
                                                        <div className="flex justify-end gap-2">
                                                            {rsv.status.toLowerCase() === "pending" && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-8 px-2 text-green-600 hover:text-green-700"
                                                                    onClick={() => handleUpdateStatus(rsv.id, "confirmed")}
                                                                >
                                                                    Approve
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                onClick={() => handleUpdateStatus(rsv.id, "cancelled")}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Past Reservations */}
                <TabsContent value="past" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Past Reservations</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-6">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Table</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Guests</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fetchingReservations ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-10">
                                                    <Loader className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                                                </TableCell>
                                            </TableRow>
                                        ) : pastReservations.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                                    No past reservations found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            pastReservations.map((rsv: any) => (
                                                <TableRow key={rsv.id} className="hover:bg-muted/50 transition-colors">
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{rsv.customerName}</span>
                                                            <span className="text-xs text-muted-foreground">{rsv.customerPhone}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Table2 className="w-4 h-4 text-muted-foreground" />
                                                            <span>{rsv.tableId ? `Table ${rsv.tableId.substring(0, 4)}` : "Unassigned"}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <CalendarDays className="w-4 h-4 text-muted-foreground" />
                                                            <span>{format(new Date(rsv.reservationTime), "MMM d, yyyy")}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                                            <span>{format(new Date(rsv.reservationTime), "h:mm a")}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{rsv.guestCount}</TableCell>
                                                    <TableCell>{getStatusBadge(rsv.status)}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
