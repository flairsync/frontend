import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

type OrderType = "Order" | "Reservation";
type OrderStatus = "Pending" | "In Progress" | "Completed" | "Cancelled";

type Order = {
    id: string;
    type: OrderType;
    customer: string;
    date: string;
    total: string;
    status: OrderStatus;
};

const dummyOrders: Order[] = [
    { id: "O-001", type: "Order", customer: "Alice Smith", date: "2025-09-18 12:30", total: "$24.50", status: "Pending" },
    { id: "R-002", type: "Reservation", customer: "Bob Johnson", date: "2025-09-18 18:00", total: "-", status: "In Progress" },
    { id: "O-003", type: "Order", customer: "Charlie Brown", date: "2025-09-17 20:15", total: "$12.00", status: "Completed" },
    { id: "R-004", type: "Reservation", customer: "Diana Prince", date: "2025-09-19 19:00", total: "-", status: "Pending" },
];

const OwnerOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>(dummyOrders);
    const [filterType, setFilterType] = useState<OrderType | "All">("All");

    const updateStatus = (id: string, status: OrderStatus) => {
        setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
    };

    const filteredOrders = filterType === "All" ? orders : orders.filter((o) => o.type === filterType);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
                    Orders & Reservations
                </h1>

                <Separator />

                {/* Filter */}
                <div className="flex items-center gap-2">
                    <Select value={filterType} onValueChange={(val) => setFilterType(val as OrderType | "All")}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All</SelectItem>
                            <SelectItem value="Order">Order</SelectItem>
                            <SelectItem value="Reservation">Reservation</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Orders Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Current Orders / Reservations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border-b p-2">ID</th>
                                        <th className="border-b p-2">Type</th>
                                        <th className="border-b p-2">Customer</th>
                                        <th className="border-b p-2">Date</th>
                                        <th className="border-b p-2">Total</th>
                                        <th className="border-b p-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((o) => (
                                        <tr key={o.id} className="hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                            <td className="p-2">{o.id}</td>
                                            <td className="p-2">{o.type}</td>
                                            <td className="p-2">{o.customer}</td>
                                            <td className="p-2">{o.date}</td>
                                            <td className="p-2">{o.total}</td>
                                            <td className="p-2">
                                                <Select value={o.status} onValueChange={(val) => updateStatus(o.id, val as OrderStatus)}>
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Pending">Pending</SelectItem>
                                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                                        <SelectItem value="Completed">Completed</SelectItem>
                                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OwnerOrdersPage;
