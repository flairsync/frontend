"use client";
import React from "react";
import { useMyOrders, useMyReservations, useCancelReservation, useDiscoveryProfile } from "@/features/discovery/useDiscovery";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Utensils, X, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { formatInTimezone } from "@/lib/dateUtils";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface BusinessDetailsUserHistoryProps {
    businessId: string;
}

const BusinessDetailsUserHistory: React.FC<BusinessDetailsUserHistoryProps> = ({ businessId }) => {
    const { t } = useTranslation();
    const { data: orders = [] } = useMyOrders(businessId);
    const { data: reservations = [] } = useMyReservations(businessId);
    const cancelReservation = useCancelReservation(businessId);

    // Fetch business profile to get timezone
    const { data: businessProfile } = useDiscoveryProfile(businessId);
    const timezone = businessProfile?.timezone;

    const activeOrders = Array.isArray(orders) ? orders.filter((o: any) =>
        ['pending_confirmation', 'open', 'preparing'].includes(o.status)
    ) : [];
    const pendingReservations = Array.isArray(reservations) ? reservations.filter((r: any) => {
        const status = (r.status || "").toLowerCase();
        return ['pending', 'confirmed'].includes(status);
    }) : [];

    const handleCancel = async (id: string, customerName: string) => {
        try {
            await cancelReservation.mutateAsync({ businessId, reservationId: id });
            toast.success(`Reservation for ${customerName} cancelled successfully`);
        } catch (error: any) {
            console.error("Cancellation error:", error);
            if (error.response?.status === 403) {
                toast.error(error.response?.data?.message || "Cannot cancel reservation within the cancellation window.");
            } else {
                toast.error("An error occurred while trying to cancel your reservation.");
            }
        }
    };

    if (activeOrders.length === 0 && pendingReservations.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-3 ml-1">
                <div className="h-8 w-1 bg-primary rounded-full" />
                <h3 className="text-xl font-bold tracking-tight">Your Activity</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Orders */}
                {activeOrders.length > 0 && (
                    <div className="space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Active Orders</p>
                        <div className="space-y-3">
                            {activeOrders.map((order: any) => (
                                <Card key={order.id} className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all rounded-2xl">
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
                                                    <span className="capitalize">• {order.type.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className={`
                                                uppercase font-black text-[10px] px-2 py-0.5 rounded-md
                                                ${order.status === 'pending_confirmation' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                    order.status === 'open' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                        'bg-emerald-100 text-emerald-800 border-emerald-200'}
                                            `}
                                        >
                                            {order.status.replace('_', ' ')}
                                        </Badge>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pending Reservations */}
                {pendingReservations.length > 0 && (
                    <div className="space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Upcoming Reservations</p>
                        <div className="space-y-3">
                            {pendingReservations.map((res: any) => (
                                <Card key={res.id} className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all rounded-2xl">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 text-primary rounded-xl">
                                                <Calendar size={20} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold text-sm">Table {res.table?.name || res.table?.number || res.tableName || 'TBD'}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock size={12} />
                                                    <span>{formatInTimezone(res.reservationTime, 'MMM D, HH:mm', timezone)}</span>
                                                    <span>• {res.guestCount} Guests</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="secondary"
                                                className={`
                                                    uppercase font-black text-[10px] px-2 py-0.5 rounded-md
                                                    ${res.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                        'bg-emerald-100 text-emerald-800 border-emerald-200'}
                                                `}
                                            >
                                                {res.status}
                                            </Badge>
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
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default BusinessDetailsUserHistory;
