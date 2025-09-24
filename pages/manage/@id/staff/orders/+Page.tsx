
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StaffOrdersPage() {
    const activeOrders = [
        { id: "#1024", type: "Dine-in", table: "Table 3", items: "Latte, Croissant", status: "In Progress" },
        { id: "#1025", type: "Takeaway", table: "-", items: "Espresso, Muffin", status: "Ready" },
        { id: "#1026", type: "Reservation", table: "Table 7", items: "Dinner Set", status: "Pending" },
    ]

    const completedOrders = [
        { id: "#1019", type: "Dine-in", table: "Table 1", items: "Cappuccino", status: "Completed" },
        { id: "#1020", type: "Takeaway", table: "-", items: "Americano", status: "Completed" },
    ]

    return (
        <div className="space-y-6 p-6">
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Orders & Reservations</h1>
                    <p className="text-muted-foreground">Manage active orders and keep track of reservations.</p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="active" className="w-full">
                <TabsList>
                    <TabsTrigger value="active">Active Orders</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                {/* Active Orders */}
                <TabsContent value="active" className="mt-4">
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
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>{order.id}</TableCell>
                                            <TableCell>{order.type}</TableCell>
                                            <TableCell>{order.table}</TableCell>
                                            <TableCell>{order.items}</TableCell>
                                            <TableCell>
                                                {order.status === "Ready" && <Badge>Ready</Badge>}
                                                {order.status === "In Progress" && <Badge variant="outline">In Progress</Badge>}
                                                {order.status === "Pending" && <Badge variant="secondary">Pending</Badge>}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button size="sm" variant="outline">Update</Button>
                                                <Button size="sm">Complete</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Completed Orders */}
                <TabsContent value="completed" className="mt-4">
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
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {completedOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>{order.id}</TableCell>
                                            <TableCell>{order.type}</TableCell>
                                            <TableCell>{order.table}</TableCell>
                                            <TableCell>{order.items}</TableCell>
                                            <TableCell><Badge>Completed</Badge></TableCell>
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
