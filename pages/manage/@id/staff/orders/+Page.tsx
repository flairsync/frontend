"use client"

import { useState, useEffect } from "react"
import { usePageContext } from "vike-react/usePageContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, CheckCircle, Send, CheckSquare, PlusCircle, Eye, CreditCard, Hash, Utensils, MoreHorizontal, XCircle, ArrowRightLeft } from "lucide-react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { StaffAddOrderDrawer } from "@/components/staff/orders/StaffAddOrderDrawer"
import { AddItemsModal } from "@/components/staff/orders/AddItemsModal"
import { OrderDetailsModal } from "@/components/staff/orders/OrderDetailsModal"
import { PaymentModal } from "@/components/staff/orders/PaymentModal"
import { CancelOrderModal } from "@/components/staff/orders/CancelOrderModal"
import { ForceCloseOrderModal } from "@/components/staff/orders/ForceCloseOrderModal"
import { TransferTableModal } from "@/components/staff/orders/TransferTableModal"

import { useOrders } from "@/features/orders/useOrders"
import { useFloors } from "@/features/floor-plan/useFloorPlan"
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Order } from "@/features/orders/service"

export default function StaffOrdersPage() {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const [addingOrder, setAddingOrder] = useState(false);

    // Details Modal State
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

    // Payment Modal State
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);

    // Cancel & Force Close Modal States
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedOrderForCancel, setSelectedOrderForCancel] = useState<Order | null>(null);
    const [forceCloseModalOpen, setForceCloseModalOpen] = useState(false);
    const [selectedOrderForForceClose, setSelectedOrderForForceClose] = useState<Order | null>(null);

    // Transfer Table Modal State
    const [transferModalOpen, setTransferModalOpen] = useState(false);
    const [selectedOrderForTransfer, setSelectedOrderForTransfer] = useState<Order | null>(null);

    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [addItemsModalOpen, setAddItemsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("active");
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get("tab");
            const start = params.get("startDate");
            const end = params.get("endDate");

            if (tab === "active" || tab === "completed") setActiveTab(tab);
            if (start || end) {
                setDateRange({
                    from: start ? new Date(`${start}T00:00:00`) : undefined,
                    to: end ? new Date(`${end}T00:00:00`) : undefined
                });
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("tab", activeTab);

            if (dateRange?.from) url.searchParams.set("startDate", format(dateRange.from, "yyyy-MM-dd"));
            else url.searchParams.delete("startDate");

            if (dateRange?.to) url.searchParams.set("endDate", format(dateRange.to, "yyyy-MM-dd"));
            else url.searchParams.delete("endDate");

            window.history.replaceState({}, "", url.toString());
        }
    }, [activeTab, dateRange]);

    const {
        orders,
        fetchingOrders,
        sendOrder,
        isSendingOrder,
        serveOrder,
        isServingOrder,
        closeOrder,
        isClosingOrder
    } = useOrders(
        businessId,
        activeTab === "completed" ? "all" : "ongoing",
        dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined
    );

    const { floors } = useFloors(businessId);

    // Flatten tables from all floors
    const allTables = floors?.flatMap((f: any) => (f.tables || []).map((t: any) => ({ ...t, floorName: f.name }))) || [];

    const getTableLabel = (tableId?: string) => {
        if (!tableId) return null;
        const table = allTables.find((t: any) => t.id === tableId);
        if (table) {
            return `${table.floorName} - ${table.name}`;
        }
        return "Unknown Table";
    };

    const getItemsCount = (order: Order) => {
        return order.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
    };

    const formatTime = (isoString?: string) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "open": return "outline";
            case "sent": return "secondary";
            case "served": return "default";
            case "closed": return "default";
            case "cancelled": return "destructive";
            default: return "outline";
        }
    };

    const handleOpenAddItems = (orderId: string) => {
        setSelectedOrderId(orderId);
        setAddItemsModalOpen(true);
    };

    const handleViewDetails = (order: Order) => {
        setSelectedOrderDetails(order);
        setDetailsModalOpen(true);
    };

    const handleOpenPayment = (order: Order) => {
        setSelectedOrderForPayment(order);
        setPaymentModalOpen(true);
    };

    const handleOpenCancel = (order: Order) => {
        setSelectedOrderForCancel(order);
        setCancelModalOpen(true);
    };

    const handleOpenForceClose = (order: Order) => {
        setSelectedOrderForForceClose(order);
        setForceCloseModalOpen(true);
    };

    const handleOpenTransfer = (order: Order) => {
        setSelectedOrderForTransfer(order);
        setTransferModalOpen(true);
    };

    const activeOrdersList = orders?.filter(o => o.status !== "closed" && o.status !== "cancelled") || [];
    const completedOrdersList = orders?.filter(o => o.status === "closed" || o.status === "cancelled") || [];

    return (
        <div className="space-y-6 p-6">
            <StaffAddOrderDrawer
                businessId={businessId}
                open={addingOrder}
                onOpenChange={setAddingOrder}
            />
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
                    <p className="text-muted-foreground">Manage active and completed customer orders.</p>
                </div>
                <div className="flex items-center gap-2">
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                    <Button onClick={() => setAddingOrder(true)}>Add New Order</Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                                        <TableHead>Order</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-center">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fetchingOrders ? (
                                        <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
                                    ) : activeOrdersList.length === 0 ? (
                                        <TableRow><TableCell colSpan={8} className="text-center py-8">No active orders</TableCell></TableRow>
                                    ) : (
                                        activeOrdersList.map((o) => (
                                            <TableRow key={o.id} className="hover:bg-muted/50 transition-colors">
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <span className="font-mono text-xs">{o.id.substring(0, 8)}</span>
                                                        <Badge variant="outline" className="capitalize text-[10px] h-4">
                                                            {o.type.replace("_", " ")}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 items-start">
                                                        {o.type === 'dine_in' && o.table ? (
                                                            <span className="font-medium text-gray-800 text-sm">{o.table.name}</span>
                                                        ) : (
                                                            <span className="text-gray-600 italic text-sm">Walk-in</span>
                                                        )}
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Clock className="w-3 h-3" />
                                                            {formatTime(o.createdAt)}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                        <Hash className="w-3.5 h-3.5" />
                                                        {getItemsCount(o)}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="font-semibold">${Number(o.totalAmount || 0).toFixed(2)}</TableCell>

                                                <TableCell>
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <Badge variant={getStatusVariant(o.status)} className="capitalize">
                                                            {o.status}
                                                        </Badge>
                                                        <Badge variant={o.paymentStatus === 'paid' ? 'default' : o.paymentStatus === 'partially_paid' ? 'outline' : 'secondary'} className="capitalize text-[10px] h-4">
                                                            {(o.paymentStatus || 'pending').replace(/_/g, " ")}
                                                        </Badge>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="align-middle">
                                                    <div className="flex justify-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                {o.paymentStatus !== "paid" && (
                                                                    <DropdownMenuItem onClick={() => handleOpenPayment(o)} className="text-emerald-600 focus:text-emerald-700">
                                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                                        <span>Pay</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {o.status === "open" && (
                                                                    <DropdownMenuItem onClick={() => sendOrder(o.id)} disabled={isSendingOrder}>
                                                                        <Send className="mr-2 h-4 w-4" />
                                                                        <span>Send</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {o.status === "sent" && (
                                                                    <DropdownMenuItem onClick={() => serveOrder(o.id)} disabled={isServingOrder} className="text-amber-600 focus:text-amber-700">
                                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                                        <span>Serve</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {o.status === "served" && o.paymentStatus === "paid" && (
                                                                    <DropdownMenuItem onClick={() => closeOrder({ orderId: o.id })} disabled={isClosingOrder} className="text-green-600 focus:text-green-700">
                                                                        <CheckSquare className="mr-2 h-4 w-4" />
                                                                        <span>Close</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {o.status === "served" && o.paymentStatus !== "paid" && (
                                                                    <DropdownMenuItem onClick={() => handleOpenForceClose(o)} className="text-green-600 focus:text-green-700">
                                                                        <CheckSquare className="mr-2 h-4 w-4" />
                                                                        <span>Force Close</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {(o.status === "open" || o.status === "sent") && (
                                                                    <DropdownMenuItem onClick={() => handleOpenAddItems(o.id)}>
                                                                        <PlusCircle className="mr-2 h-4 w-4" />
                                                                        <span>Add</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {o.type === "dine_in" && o.status !== "closed" && o.status !== "cancelled" && (
                                                                    <DropdownMenuItem onClick={() => handleOpenTransfer(o)}>
                                                                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                                                                        <span>Transfer Table</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {o.status !== "closed" && o.status !== "cancelled" && (
                                                                    <DropdownMenuItem onClick={() => handleOpenCancel(o)} className="text-red-600 focus:text-red-700">
                                                                        <XCircle className="mr-2 h-4 w-4" />
                                                                        <span>Cancel</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem onClick={() => handleViewDetails(o)}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    <span>View</span>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
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
                                        <TableHead>Order</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-center">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fetchingOrders ? (
                                        <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
                                    ) : completedOrdersList.length === 0 ? (
                                        <TableRow><TableCell colSpan={8} className="text-center py-8">No completed orders</TableCell></TableRow>
                                    ) : (
                                        completedOrdersList.map((o) => (
                                            <TableRow key={o.id} className="hover:bg-muted/50 transition-colors">
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <span className="font-mono text-xs">{o.id.substring(0, 8)}</span>
                                                        <Badge variant="outline" className="capitalize text-[10px] h-4">
                                                            {o.type.replace("_", " ")}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 items-start">
                                                        {o.type === 'dine_in' && o.table ? (
                                                            <span className="font-medium text-gray-800 text-sm">{o.table.name}</span>
                                                        ) : (
                                                            <span className="text-gray-600 italic text-sm">Walk-in</span>
                                                        )}
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Clock className="w-3 h-3" />
                                                            {formatTime(o.createdAt)}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                        <Hash className="w-3.5 h-3.5" />
                                                        {getItemsCount(o)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold">${Number(o.totalAmount || 0).toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <Badge variant={getStatusVariant(o.status)} className="capitalize">
                                                            {o.status}
                                                        </Badge>
                                                        <Badge variant={o.paymentStatus === 'paid' ? 'default' : o.paymentStatus === 'partially_paid' ? 'outline' : 'secondary'} className="capitalize text-[10px] h-4">
                                                            {(o.paymentStatus || 'pending').replace(/_/g, " ")}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-middle">
                                                    <div className="flex justify-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleViewDetails(o)}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    <span>View</span>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <AddItemsModal
                businessId={businessId}
                orderId={selectedOrderId}
                open={addItemsModalOpen}
                onClose={() => setAddItemsModalOpen(false)}
            />

            <OrderDetailsModal
                businessId={businessId}
                order={selectedOrderDetails}
                open={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
            />

            <TransferTableModal
                open={transferModalOpen}
                onClose={() => setTransferModalOpen(false)}
                businessId={businessId}
                order={selectedOrderForTransfer}
            />

            <PaymentModal
                businessId={businessId}
                order={selectedOrderForPayment}
                open={paymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
            />

            <CancelOrderModal
                open={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                businessId={businessId}
                order={selectedOrderForCancel}
            />

            <ForceCloseOrderModal
                open={forceCloseModalOpen}
                onClose={() => setForceCloseModalOpen(false)}
                businessId={businessId}
                order={selectedOrderForForceClose}
            />
        </div>
    )
}
