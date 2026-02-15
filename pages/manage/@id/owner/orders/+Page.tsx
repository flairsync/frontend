import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/features/orders/useOrders";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingBag } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const OwnerOrdersPage: React.FC = () => {
    const { t } = useTranslation();
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const {
        orders,
        fetchingOrders,
        updateOrder
    } = useOrders(businessId);

    const [filterType, setFilterType] = useState<string>("All");

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "pending": return "outline";
            case "preparing": return "secondary";
            case "ready": return "default";
            case "served": return "default";
            case "completed": return "default";
            case "cancelled": return "destructive";
            default: return "outline";
        }
    };

    const filteredOrders = filterType === "All" ? orders : orders?.filter((o: any) => o.type === filterType.toLowerCase());

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{t("orders.title")}</h1>
                <Button className="gap-2">
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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fetchingOrders ? (
                                <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
                            ) : filteredOrders?.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center">No orders found.</TableCell></TableRow>
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
                                        <TableCell>${o.total?.toFixed(2) || "0.00"}</TableCell>
                                        <TableCell>
                                            <Select value={o.status} onValueChange={(val: any) => updateOrder({ orderId: o.id, data: { status: val } })}>
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="preparing">Preparing</SelectItem>
                                                    <SelectItem value="ready">Ready</SelectItem>
                                                    <SelectItem value="served">Served</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default OwnerOrdersPage;
