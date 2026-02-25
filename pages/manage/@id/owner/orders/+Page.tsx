import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/features/orders/useOrders";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Send, CheckCircle, CheckSquare, PlusCircle, CreditCard } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddItemsModal } from "@/components/staff/orders/AddItemsModal";
import { StaffAddOrderDrawer } from "@/components/staff/orders/StaffAddOrderDrawer";
import { OrderDetailsModal } from "@/components/staff/orders/OrderDetailsModal";
import { PaymentModal } from "@/components/staff/orders/PaymentModal";
import { Order } from "@/features/orders/service";

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

    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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

    const {
        orders,
        fetchingOrders,
        updateOrder,
        isUpdatingOrder,
        sendOrder,
        isSendingOrder,
        serveOrder,
        isServingOrder,
        closeOrder,
        isClosingOrder
    } = useOrders(businessId);

    const [filterType, setFilterType] = useState<string>("All");

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

    const filteredOrders = filterType === "All" ? orders : orders?.filter((o: any) => o.type === filterType.toLowerCase());

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{t("orders.title")}</h1>
                <Button className="gap-2" onClick={() => setCreateOrderOpen(true)}>
                    <Plus className="w-4 h-4" />
                    {t("orders.create_order")}
                </Button>
            </div>

            <Separator />

            {/* Filter */}
            <div className="flex items-center gap-2">
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
                                <TableHead>ID</TableHead>
                                <TableHead>{t("orders.order_type")}</TableHead>
                                <TableHead>{t("shared.tags.cozy") || "Customer"}</TableHead>
                                <TableHead>{t("orders.total")}</TableHead>
                                <TableHead>{t("orders.status")}</TableHead>
                                <TableHead className="text-right">{t("shared.actions.all")}</TableHead>
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
                                        <TableCell className="font-mono text-xs">{o.id.substring(0, 8)}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {o.type.replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{o.customerName || "Walk-in"}</TableCell>
                                        <TableCell>${Number(o.totalAmount || 0).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 items-start">
                                                <Badge variant={getStatusVariant(o.status)} className="capitalize">
                                                    {o.status}
                                                </Badge>
                                                <Badge variant={o.paymentStatus === 'paid' ? 'default' : o.paymentStatus === 'partially_paid' ? 'outline' : 'secondary'} className="capitalize text-[10px] h-4">
                                                    {o.paymentStatus || 'pending'}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            {o.paymentStatus !== "paid" && o.status !== "closed" && o.status !== "cancelled" && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-1 h-8 bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700"
                                                    onClick={() => handleOpenPayment(o)}
                                                >
                                                    <CreditCard className="w-3.5 h-3.5" />
                                                    Add Payment
                                                </Button>
                                            )}
                                            {o.status === "open" && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="gap-1 h-8"
                                                    onClick={() => sendOrder(o.id)}
                                                    disabled={isSendingOrder}
                                                >
                                                    <Send className="w-3.5 h-3.5" />
                                                    Send to Kitchen
                                                </Button>
                                            )}
                                            {o.status === "sent" && (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    className="gap-1 h-8 bg-amber-600 hover:bg-amber-700"
                                                    onClick={() => serveOrder(o.id)}
                                                    disabled={isServingOrder}
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Mark Served
                                                </Button>
                                            )}
                                            {o.status === "served" && o.paymentStatus === "paid" && (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    className="gap-1 h-8 bg-green-600 hover:bg-green-700"
                                                    onClick={() => closeOrder(o.id)}
                                                    disabled={isClosingOrder}
                                                >
                                                    <CheckSquare className="w-3.5 h-3.5" />
                                                    Close Order
                                                </Button>
                                            )}
                                            {(o.status === "open" || o.status === "sent") && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-1 h-8"
                                                    onClick={() => handleOpenAddItems(o.id)}
                                                >
                                                    <PlusCircle className="w-3.5 h-3.5" />
                                                    Add Items
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1 h-8"
                                                onClick={() => handleViewDetails(o)}
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

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
                order={selectedOrderDetails}
                open={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
            />

            <PaymentModal
                businessId={businessId}
                order={selectedOrderForPayment}
                open={paymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
            />
        </div>
    );
};

export default OwnerOrdersPage;
