"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Coffee, UtensilsCrossed, Table2, Clock } from "lucide-react"
import { StaffAddOrderDrawer } from "@/components/staff/orders/StaffAddOrderDrawer"
import { useState } from "react"
import { usePageContext } from "vike-react/usePageContext"

export default function StaffOrdersPage() {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;
    const [addingOrder, setAddingOrder] = useState(false);
    const activeOrders = [
        {
            id: "#O2034",
            table: "Table 4",
            type: "Dine-in",
            items: "Cappuccino, Croissant",
            time: "10:25 AM",
            status: "In Progress",
        },
        {
            id: "#O2035",
            table: "Takeaway",
            type: "Takeaway",
            items: "Latte, Muffin",
            time: "10:32 AM",
            status: "Ready",
        },
    ]

    const completedOrders = [
        {
            id: "#O2029",
            table: "Table 2",
            type: "Dine-in",
            items: "Espresso",
            time: "09:15 AM",
            status: "Completed",
        },
        {
            id: "#O2030",
            table: "Takeaway",
            type: "Takeaway",
            items: "Americano",
            time: "09:40 AM",
            status: "Completed",
        },
    ]

    return (
        <div className="space-y-6 p-6">
            <StaffAddOrderDrawer
                businessId={businessId}
                open={addingOrder}
                onOpenChange={() => {
                    setAddingOrder(false);
                }}
            />
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
                    <p className="text-muted-foreground">Manage active and completed customer orders.</p>
                </div>
                <Button
                    onClick={() => {
                        setAddingOrder(true);

                    }}
                >Add New Order</Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid grid-cols-2 w-full max-w-[300px]">
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                {/* Active Orders */}
                <TabsContent value="active" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Table</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeOrders.map((order) => (
                                        <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                                            <TableCell>{order.id}</TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
                                                    <span>{order.type}</span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Table2 className="w-4 h-4 text-muted-foreground" />
                                                    <span>{order.table}</span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Coffee className="w-4 h-4 text-muted-foreground" />
                                                    <span>{order.items}</span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                                    <span>{order.time}</span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                {order.status === "Ready" && <Badge>Ready</Badge>}
                                                {order.status === "In Progress" && (
                                                    <Badge variant="outline">In Progress</Badge>
                                                )}
                                            </TableCell>

                                            <TableCell className="text-right space-x-2">
                                                {order.status !== "Ready" && (
                                                    <Button size="sm" variant="outline">
                                                        Mark Ready
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

                {/* Completed Orders */}
                <TabsContent value="completed" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Completed Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Table</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {completedOrders.map((order) => (
                                        <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                                            <TableCell>{order.id}</TableCell>
                                            <TableCell>{order.type}</TableCell>
                                            <TableCell>{order.table}</TableCell>
                                            <TableCell>{order.items}</TableCell>
                                            <TableCell>{order.time}</TableCell>
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
