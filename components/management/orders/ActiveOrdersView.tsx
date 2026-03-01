import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/features/orders/useOrders";
import { useFloors } from "@/features/floor-plan/useFloorPlan";
import { Loader2, Plus, ShoppingCart, CheckCircle, Utensils, Send } from "lucide-react";
import { AddItemsModal } from "@/components/staff/orders/AddItemsModal";
import { OrderDetailsModal } from "@/components/staff/orders/OrderDetailsModal";

interface ActiveOrdersViewProps {
    businessId: string;
}

export const ActiveOrdersView: React.FC<ActiveOrdersViewProps> = ({ businessId }) => {
    const { floors, fetchingFloors } = useFloors(businessId);
    const {
        orders,
        fetchingOrders,
        sendOrder,
        serveOrder,
        isSendingOrder,
        isServingOrder
    } = useOrders(businessId);

    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [addItemsOpen, setAddItemsOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const activeOrders = orders?.filter(o => o.status !== "closed" && o.status !== "cancelled") || [];

    // Flatten tables from all floors
    const allTables = floors?.flatMap((f: any) => (f.tables || []).map((t: any) => ({ ...t, floorName: f.name }))) || [];

    const getTableOrder = (tableId: string) => {
        return activeOrders.find(o => o.tableId === tableId);
    };

    const handleAddItems = (orderId: string) => {
        setSelectedOrderId(orderId);
        setAddItemsOpen(true);
    };

    const handleViewDetails = (order: any) => {
        setSelectedOrder(order);
        setDetailsOpen(true);
    };

    if (fetchingFloors || fetchingOrders) {
        return <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {allTables.map((table: any) => {
                    const order = getTableOrder(table.id);
                    return (
                        <Card key={table.id} className={`${order ? "border-primary bg-primary/5" : "opacity-60"}`}>
                            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                                <div>
                                    <CardTitle className="text-sm font-bold">{table.name}</CardTitle>
                                    <p className="text-[10px] text-muted-foreground uppercase">{table.floorName}</p>
                                </div>
                                <Badge variant={order ? "default" : "outline"} className="text-[10px]">
                                    {order ? order.status.toUpperCase() : "VACANT"}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                {order ? (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Amount:</span>
                                            <span className="font-bold">${Number(order.totalAmount).toFixed(2)}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {order.status === "open" && (
                                                <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 gap-1" onClick={() => sendOrder(order.id)} disabled={isSendingOrder}>
                                                    <Send className="w-3 h-3" /> Send
                                                </Button>
                                            )}
                                            {order.status === "sent" && (
                                                <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 gap-1 bg-amber-50 text-amber-600 border-amber-200" onClick={() => serveOrder(order.id)} disabled={isServingOrder}>
                                                    <CheckCircle className="w-3 h-3" /> Serve
                                                </Button>
                                            )}
                                            <Button size="sm" variant="secondary" className="h-7 text-[10px] px-2 gap-1" onClick={() => handleAddItems(order.id)}>
                                                <Plus className="w-3 h-3" /> Add items
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2 gap-1" onClick={() => handleViewDetails(order)}>
                                                Details
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-4 flex flex-col items-center justify-center text-muted-foreground">
                                        <Utensils className="w-6 h-6 mb-1 opacity-20" />
                                        <span className="text-xs italic">Available</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <AddItemsModal
                businessId={businessId}
                orderId={selectedOrderId}
                open={addItemsOpen}
                onClose={() => setAddItemsOpen(false)}
            />

            <OrderDetailsModal
                businessId={businessId}
                order={selectedOrder}
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
            />
        </div>
    );
};
