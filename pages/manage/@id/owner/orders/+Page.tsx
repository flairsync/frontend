import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/features/orders/useOrders";
import { useFloors } from "@/features/floor-plan/useFloorPlan";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, CheckCircle, CheckSquare, PlusCircle, CreditCard, Clock, Utensils, Hash, MoreHorizontal, XCircle, ArrowRightLeft, ChefHat, ThumbsDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddItemsModal } from "@/components/staff/orders/AddItemsModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StaffAddOrderDrawer } from "@/components/staff/orders/StaffAddOrderDrawer";
import { OrderDetailsModal } from "@/components/staff/orders/OrderDetailsModal";
import { PaymentModal } from "@/components/staff/orders/PaymentModal";
import { CancelOrderModal } from "@/components/staff/orders/CancelOrderModal";
import { ForceCloseOrderModal } from "@/components/staff/orders/ForceCloseOrderModal";
import { TransferTableModal } from "@/components/staff/orders/TransferTableModal";
import { Order } from "@/features/orders/service";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActiveOrdersView } from "@/components/management/orders/ActiveOrdersView";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";

const OwnerOrdersPage: React.FC = () => {
    const { t } = useTranslation();
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const [addItemsModalOpen, setAddItemsModalOpen] = useState(false);
    const [createOrderOpen, setCreateOrderOpen] = useState(false);

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
    const [statusFilter, setStatusFilter] = useState<"ongoing" | "all">("ongoing");
    const [filterType, setFilterType] = useState<string>("All");
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const t = params.get("type");
            const s = params.get("status");
            const start = params.get("startDate");
            const end = params.get("endDate");

            if (t) setFilterType(t);
            if (s === "ongoing" || s === "all") setStatusFilter(s);
            if (start || end) {
                setDateRange({
                    from: start ? new Date(`${start}T00:00:00`) : undefined,
                    to: end ? new Date(`${end}T00:00:00`) : undefined
                });
            }

            // Cleanup non-order parameters
            const allowedParams = ["type", "status", "startDate", "endDate"];
            let changed = false;
            for (const key of Array.from(params.keys())) {
                if (!allowedParams.includes(key)) {
                    params.delete(key);
                    changed = true;
                }
            }
            if (changed) {
                const url = new URL(window.location.href);
                url.search = params.toString();
                window.history.replaceState({}, "", url.toString());
            }
        }
    }, []);

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            if (filterType && filterType !== "All") url.searchParams.set("type", filterType);
            else url.searchParams.delete("type");

            url.searchParams.set("status", statusFilter);

            if (dateRange?.from) url.searchParams.set("startDate", format(dateRange.from, "yyyy-MM-dd"));
            else url.searchParams.delete("startDate");

            if (dateRange?.to) url.searchParams.set("endDate", format(dateRange.to, "yyyy-MM-dd"));
            else url.searchParams.delete("endDate");

            window.history.replaceState({}, "", url.toString());
        }
    }, [filterType, statusFilter, dateRange]);

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

    const {
        orders,
        fetchingOrders,
        acceptOrder,
        isAcceptingOrder,
        rejectOrder,
        isRejectingOrder,
        prepareOrder,
        isPreparingOrder,
        readyOrder,
        isMarkingReady,
        completeOrder,
        isCompletingOrder,
    } = useOrders(
        businessId,
        statusFilter,
        dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined
    );

    // Fetch floors to get table mappings
    const { floors } = useFloors(businessId);
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
            case "created": return "secondary";
            case "accepted": return "outline";
            case "preparing": return "secondary";
            case "ready": return "default";
            case "completed": return "default";
            case "rejected": return "destructive";
            case "canceled": return "destructive";
            default: return "outline";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "created": return "Pending";
            case "accepted": return "Accepted";
            case "preparing": return "Preparing";
            case "ready": return "Ready";
            case "completed": return "Completed";
            case "rejected": return "Rejected";
            case "canceled": return "Canceled";
            default: return status;
        }
    };

    const isTerminal = (status: string) => ["completed", "rejected", "canceled"].includes(status);

    const filteredOrders = filterType === "All" ? orders : orders?.filter((o: any) => o.type === filterType.toLowerCase());

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">{t("orders.title")}</h1>
                <Button className="gap-2" onClick={() => setCreateOrderOpen(true)}>
                    <Plus className="w-4 h-4" />
                    {t("orders.create_order")}
                </Button>
            </div>

            <Separator />

            <Tabs defaultValue="list" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="list">{t("orders.title")}</TabsTrigger>
                    <TabsTrigger value="live">Live Tables</TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                    {/* Filter */}
                    <div className="flex items-center gap-2 mb-4 justify-between">
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">{t("shared.actions.all")}</SelectItem>
                                <SelectItem value="dine_in">{t("orders.dine_in")}</SelectItem>
                                <SelectItem value="takeaway">{t("orders.takeaway")}</SelectItem>
                                <SelectItem value="delivery">{t("orders.delivery")}</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2">
                            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                            <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ongoing">Ongoing Orders</SelectItem>
                                    <SelectItem value="all">Order History</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("orders.title")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>{t("orders.total")}</TableHead>
                                        <TableHead>{t("orders.status")}</TableHead>
                                        <TableHead className="text-center">{t("shared.actions.all")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fetchingOrders ? (
                                        <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
                                    ) : filteredOrders?.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center">No orders found.</TableCell></TableRow>
                                    ) : (
                                        filteredOrders?.map((o: any) => (
                                            <TableRow key={o.id}>
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
                                                            {getStatusLabel(o.status)}
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
                                                                {o.paymentStatus !== "paid" && !isTerminal(o.status) && (
                                                                    <DropdownMenuItem onClick={() => handleOpenPayment(o)} className="text-emerald-600 focus:text-emerald-700">
                                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                                        <span>Add Payment</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {o.status === "created" && (
                                                                    <DropdownMenuItem onClick={() => acceptOrder(o.id)} disabled={isAcceptingOrder} className="text-blue-600 focus:text-blue-700">
                                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                                        <span>Accept</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {o.status === "created" && (
                                                                    <DropdownMenuItem onClick={() => rejectOrder({ orderId: o.id })} disabled={isRejectingOrder} className="text-red-600 focus:text-red-700">
                                                                        <ThumbsDown className="mr-2 h-4 w-4" />
                                                                        <span>Reject</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {o.status === "accepted" && (
                                                                    <DropdownMenuItem onClick={() => prepareOrder(o.id)} disabled={isPreparingOrder} className="text-orange-600 focus:text-orange-700">
                                                                        <ChefHat className="mr-2 h-4 w-4" />
                                                                        <span>Start Preparing</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {o.status === "preparing" && (
                                                                    <DropdownMenuItem onClick={() => readyOrder(o.id)} disabled={isMarkingReady} className="text-green-600 focus:text-green-700">
                                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                                        <span>Mark Ready</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {o.status === "ready" && o.paymentStatus === "paid" && (
                                                                    <DropdownMenuItem onClick={() => completeOrder({ orderId: o.id })} disabled={isCompletingOrder} className="text-green-600 focus:text-green-700">
                                                                        <CheckSquare className="mr-2 h-4 w-4" />
                                                                        <span>Complete</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {o.status === "ready" && o.paymentStatus !== "paid" && (
                                                                    <DropdownMenuItem onClick={() => handleOpenForceClose(o)} className="text-green-600 focus:text-green-700">
                                                                        <CheckSquare className="mr-2 h-4 w-4" />
                                                                        <span>Force Complete</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {(o.status === "created" || o.status === "accepted") && (
                                                                    <DropdownMenuItem onClick={() => handleOpenAddItems(o.id)}>
                                                                        <PlusCircle className="mr-2 h-4 w-4" />
                                                                        <span>Add Items</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {o.type === "dine_in" && !isTerminal(o.status) && (
                                                                    <DropdownMenuItem onClick={() => handleOpenTransfer(o)}>
                                                                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                                                                        <span>Transfer Table</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {["created", "accepted", "preparing", "ready"].includes(o.status) && (
                                                                    <DropdownMenuItem onClick={() => handleOpenCancel(o)} className="text-red-600 focus:text-red-700">
                                                                        <XCircle className="mr-2 h-4 w-4" />
                                                                        <span>Cancel</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem onClick={() => handleViewDetails(o)}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    <span>View Details</span>
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

                <TabsContent value="live">
                    <ActiveOrdersView businessId={businessId} />
                </TabsContent>
            </Tabs>

            <AddItemsModal
                businessId={businessId}
                orderId={selectedOrderId}
                open={addItemsModalOpen}
                onClose={() => setAddItemsModalOpen(false)}
            />

            <StaffAddOrderDrawer
                businessId={businessId}
                open={createOrderOpen}
                onOpenChange={setCreateOrderOpen}
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
    );
};

export default OwnerOrdersPage;
