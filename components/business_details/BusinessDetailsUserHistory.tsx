"use client";
import React, { useState } from "react";
import { useMyOrders, useMyReservations, useCancelReservation, useDiscoveryProfile, useSingleOrder, useReorder } from "@/features/discovery/useDiscovery";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Clock, Calendar, Utensils, XCircle, RotateCcw, ChevronRight, Loader2, Receipt } from "lucide-react";
import { motion } from "framer-motion";
import { formatInTimezone } from "@/lib/dateUtils";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { toast } from "sonner";
import { BusinessDetailsReservationConversation } from "@/components/business_details/BusinessDetailsReservationConversation";

interface BusinessDetailsUserHistoryProps {
    businessId: string;
}

const ORDER_STATUS_STYLES: Record<string, string> = {
    pending_confirmation: "bg-yellow-100 text-yellow-800 border-yellow-200",
    open: "bg-blue-100 text-blue-800 border-blue-200",
    preparing: "bg-orange-100 text-orange-800 border-orange-200",
    completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    canceled: "bg-gray-100 text-gray-600 border-gray-200",
    ready: "bg-teal-100 text-teal-800 border-teal-200",
};

const RESERVATION_STATUS_STYLES: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    seated: "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-gray-100 text-gray-600 border-gray-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    no_show: "bg-red-100 text-red-800 border-red-200",
    expired: "bg-gray-100 text-gray-500 border-gray-200",
};

function StatusBadge({ status, styleMap }: { status: string; styleMap: Record<string, string> }) {
    const cls = styleMap[status.toLowerCase()] ?? "bg-gray-100 text-gray-600 border-gray-200";
    return (
        <Badge variant="secondary" className={`uppercase font-black text-[10px] px-2 py-0.5 rounded-md ${cls}`}>
            {status.replace(/_/g, " ")}
        </Badge>
    );
}

function OrderDetailSheet({ businessId, orderId, timezone, open, onClose }: {
    businessId: string;
    orderId: string;
    timezone?: string;
    open: boolean;
    onClose: () => void;
}) {
    const { data: order, isLoading } = useSingleOrder(open ? businessId : undefined, open ? orderId : undefined);

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Order Details</SheetTitle>
                </SheetHeader>
                {isLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
                ) : order ? (
                    <div className="mt-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</span>
                            <StatusBadge status={order.status} styleMap={ORDER_STATUS_STYLES} />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock size={12} />
                            <span>{formatInTimezone(order.createdAt, 'MMM D, YYYY HH:mm', timezone)}</span>
                            <span>• {order.type?.replace(/_/g, ' ')}</span>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Items</p>
                            {order.items?.map((item: any, i: number) => (
                                <div key={i} className="flex items-start justify-between gap-3 py-2 border-b border-border/30 last:border-0">
                                    <div className="space-y-0.5">
                                        <p className="font-semibold text-sm">{item.nameSnapshot}</p>
                                        {item.selectedModifiers?.length > 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                {item.selectedModifiers.map((m: any) => m.name).join(", ")}
                                            </p>
                                        )}
                                        {item.notes && <p className="text-xs text-muted-foreground italic">"{item.notes}"</p>}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold">${item.totalPrice}</p>
                                        <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <span className="font-black text-sm">Total</span>
                            <span className="font-black text-lg">${order.totalAmount}</span>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground mt-6">Order not found.</p>
                )}
            </SheetContent>
        </Sheet>
    );
}

const BusinessDetailsUserHistory: React.FC<BusinessDetailsUserHistoryProps> = ({ businessId }) => {
    const { data: businessProfile } = useDiscoveryProfile(businessId);
    const timezone = businessProfile?.timezone;

    const { data: activeOrdersResult = { data: [], page: 1, totalPages: 1 } } = useMyOrders(businessId);
    const { data: completedOrdersResult = { data: [], page: 1, totalPages: 1 }, isLoading: isLoadingCompleted } = useMyOrders(businessId, { status: "completed", limit: 20 });
    const { data: reservations = [] } = useMyReservations(businessId);
    const cancelReservation = useCancelReservation(businessId);
    const reorder = useReorder(businessId);

    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    const activeOrders = Array.isArray(activeOrdersResult.data)
        ? activeOrdersResult.data.filter((o: any) => ['pending_confirmation', 'open', 'preparing', 'ready'].includes(o.status))
        : [];

    const completedOrders = Array.isArray(completedOrdersResult.data) ? completedOrdersResult.data : [];

    const upcomingReservations = Array.isArray(reservations)
        ? reservations.filter((r: any) => ['pending', 'confirmed'].includes((r.status || "").toLowerCase()))
        : [];

    const pastReservations = Array.isArray(reservations)
        ? reservations.filter((r: any) => !['pending', 'confirmed'].includes((r.status || "").toLowerCase()))
        : [];

    const handleCancel = async (id: string, customerName: string) => {
        try {
            await cancelReservation.mutateAsync({ businessId, reservationId: id });
            toast.success(`Reservation for ${customerName} cancelled`);
        } catch (error: any) {
            if (error.response?.status === 403) {
                toast.error(error.response?.data?.message || "Cannot cancel within the cancellation window.");
            } else {
                toast.error("Failed to cancel reservation.");
            }
        }
    };

    const handleReorder = async (orderId: string) => {
        try {
            const newOrder = await reorder.mutateAsync({ orderId });
            toast.success("Order placed! Redirecting...");
            if (newOrder?.id) {
                window.location.href = `/business/${businessId}?order=${newOrder.id}`;
            }
        } catch (error: any) {
            if (error.response?.status === 403) {
                toast.error("This business isn't accepting orders right now.");
            } else {
                toast.error("Failed to place reorder. Please try again.");
            }
        }
    };

    const hasActivity = activeOrders.length > 0 || completedOrders.length > 0 || reservations.length > 0;
    if (!hasActivity) return null;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center gap-3 ml-1">
                <div className="h-8 w-1 bg-primary rounded-full" />
                <h3 className="text-xl font-bold tracking-tight">Your Activity</h3>
            </div>

            <Tabs defaultValue={activeOrders.length > 0 || completedOrders.length > 0 ? "orders" : "reservations"}>
                <TabsList className="rounded-2xl h-auto p-1 gap-1">
                    <TabsTrigger value="orders" className="rounded-xl text-xs font-black uppercase tracking-widest px-4 py-2">
                        Orders
                        {activeOrders.length > 0 && (
                            <span className="ml-2 bg-primary text-primary-foreground rounded-full text-[10px] w-4 h-4 flex items-center justify-center">
                                {activeOrders.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="reservations" className="rounded-xl text-xs font-black uppercase tracking-widest px-4 py-2">
                        Reservations
                        {upcomingReservations.length > 0 && (
                            <span className="ml-2 bg-primary text-primary-foreground rounded-full text-[10px] w-4 h-4 flex items-center justify-center">
                                {upcomingReservations.length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Orders Tab */}
                <TabsContent value="orders" className="mt-4 space-y-4">
                    {/* Active orders */}
                    {activeOrders.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Active</p>
                            {activeOrders.map((order: any) => (
                                <Card key={order.id} className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 text-primary rounded-xl">
                                                <Utensils size={20} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold text-sm">Order #{order.id.slice(0, 8)}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock size={12} />
                                                    <span>{formatInTimezone(order.createdAt, 'HH:mm', timezone)}</span>
                                                    <span className="capitalize">• {order.type?.replace(/_/g, ' ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <StatusBadge status={order.status} styleMap={ORDER_STATUS_STYLES} />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Past orders */}
                    {isLoadingCompleted ? (
                        <div className="flex justify-center py-6"><Loader2 className="animate-spin text-muted-foreground" size={20} /></div>
                    ) : completedOrders.length > 0 ? (
                        <div className="space-y-3">
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Past Orders</p>
                            {completedOrders.map((order: any) => (
                                <Card
                                    key={order.id}
                                    className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-all rounded-2xl cursor-pointer"
                                    onClick={() => setSelectedOrderId(order.id)}
                                >
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-muted/60 rounded-xl">
                                                <Receipt size={18} className="text-muted-foreground" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold text-sm">Order #{order.id.slice(0, 8)}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock size={12} />
                                                    <span>{formatInTimezone(order.createdAt, 'MMM D, HH:mm', timezone)}</span>
                                                    {order.totalAmount && <span>• ${order.totalAmount}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-xl h-8 text-xs font-bold gap-1.5"
                                                disabled={reorder.isPending}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReorder(order.id);
                                                }}
                                            >
                                                {reorder.isPending ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                                                Reorder
                                            </Button>
                                            <ChevronRight size={16} className="text-muted-foreground" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : activeOrders.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground text-sm">No orders yet at this business.</div>
                    ) : null}
                </TabsContent>

                {/* Reservations Tab */}
                <TabsContent value="reservations" className="mt-4 space-y-4">
                    {upcomingReservations.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Upcoming</p>
                            {upcomingReservations.map((res: any) => (
                                <Card key={res.id} className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 text-primary rounded-xl">
                                                <Calendar size={20} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold text-sm">
                                                    Table {res.table?.name || res.table?.number || res.tableName || 'TBD'}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock size={12} />
                                                    <span>{formatInTimezone(res.reservationTime, 'MMM D, HH:mm', timezone)}</span>
                                                    <span>• {res.guestCount} guests</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={res.status} styleMap={RESERVATION_STATUS_STYLES} />
                                            <BusinessDetailsReservationConversation
                                                businessId={businessId}
                                                reservationId={res.id}
                                                timezone={timezone}
                                            />
                                            <ConfirmAction
                                                onConfirm={() => handleCancel(res.id, res.customerName)}
                                                title="Cancel Reservation?"
                                                description="Are you sure you want to cancel this reservation? This cannot be undone."
                                                confirmText="Yes, Cancel"
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                                                    disabled={cancelReservation.isPending}
                                                >
                                                    <XCircle size={18} />
                                                </Button>
                                            </ConfirmAction>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {pastReservations.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Past</p>
                            {pastReservations.map((res: any) => (
                                <Card key={res.id} className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-muted/60 rounded-xl">
                                                <Calendar size={18} className="text-muted-foreground" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold text-sm">
                                                    Table {res.table?.name || res.table?.number || res.tableName || 'TBD'}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock size={12} />
                                                    <span>{formatInTimezone(res.reservationTime, 'MMM D, YYYY HH:mm', timezone)}</span>
                                                    <span>• {res.guestCount} guests</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={res.status} styleMap={RESERVATION_STATUS_STYLES} />
                                            <BusinessDetailsReservationConversation
                                                businessId={businessId}
                                                reservationId={res.id}
                                                timezone={timezone}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {upcomingReservations.length === 0 && pastReservations.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground text-sm">No reservations yet at this business.</div>
                    )}
                </TabsContent>
            </Tabs>

            {selectedOrderId && (
                <OrderDetailSheet
                    businessId={businessId}
                    orderId={selectedOrderId}
                    timezone={timezone}
                    open={!!selectedOrderId}
                    onClose={() => setSelectedOrderId(null)}
                />
            )}
        </motion.div>
    );
};

export default BusinessDetailsUserHistory;
