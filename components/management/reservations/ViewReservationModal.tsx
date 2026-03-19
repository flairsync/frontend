import React from "react";
import { format } from "date-fns";
import { formatInTimezone } from "@/lib/dateUtils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useMyBusiness } from "@/features/business/useMyBusiness";
import { CalendarDays, Clock, Users, User, Phone, Mail, FileText, ShoppingBag, CreditCard, Table2 } from "lucide-react";

interface ViewReservationModalProps {
    businessId: string;
    reservation: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ViewReservationModal: React.FC<ViewReservationModalProps> = ({
    businessId,
    reservation,
    open,
    onOpenChange
}) => {
    const { myBusinessFullDetails } = useMyBusiness(businessId);
    if (!reservation) return null;

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 uppercase text-[10px]">Pending</Badge>;
            case 'confirmed': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase text-[10px]">Confirmed</Badge>;
            case 'waitlist': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px]">Waitlist</Badge>;
            case 'completed': return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 uppercase text-[10px]">Completed</Badge>;
            case 'no_show': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 uppercase text-[10px]">No Show</Badge>;
            case 'cancelled': return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 uppercase text-[10px]">Cancelled</Badge>;
            default: return <Badge variant="outline" className="uppercase text-[10px]">{status || 'Unknown'}</Badge>;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-center pr-4">
                        <DialogTitle>Reservation Details</DialogTitle>
                        {getStatusBadge(reservation.status)}
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Customer Info */}
                    <div>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground"><User className="w-4 h-4" /> Customer Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Name</p>
                                <p className="text-sm font-medium">{reservation.customerName || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Reservation Source</p>
                                <p className="text-sm font-medium">{reservation.reservationSource || "N/A"}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{reservation.customerPhone || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{reservation.customerEmail || "N/A"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Reservation Info */}
                    <div>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground"><CalendarDays className="w-4 h-4" /> Reservation Details</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg border">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Date</p>
                                <p className="text-sm font-medium flex items-center gap-1">
                                    <CalendarDays className="w-3 h-3" />
                                    {formatInTimezone(reservation.reservationTime, "MMM D, YYYY", myBusinessFullDetails?.timezone)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Time</p>
                                <p className="text-sm font-medium flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatInTimezone(reservation.reservationTime, "h:mm A", myBusinessFullDetails?.timezone)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Duration</p>
                                <p className="text-sm font-medium">{reservation.durationMinutes} min</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Guests</p>
                                <p className="text-sm font-medium flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {reservation.guestCount}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Table Info */}
                    <div>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground"><Table2 className="w-4 h-4" /> Table Information</h3>
                        <div className="bg-muted/30 p-4 rounded-lg border">
                            {reservation.table ? (
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Table Name</p>
                                        <p className="text-sm font-medium">{reservation.table.name || `Table ${reservation.table.number || 'N/A'}`}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Capacity</p>
                                        <p className="text-sm font-medium">{reservation.table.capacity} persons</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Table Status</p>
                                        <p className="text-sm font-medium capitalize">{reservation.table.status}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No table assigned (Unassigned / Waitlist)</p>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    {(reservation.notes || reservation.cancelReason) && (
                        <div>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground"><FileText className="w-4 h-4" /> Notes & Reasons</h3>
                            <div className="bg-muted/30 p-4 rounded-lg border space-y-3">
                                {reservation.notes && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Customer Notes</p>
                                        <p className="text-sm">{reservation.notes}</p>
                                    </div>
                                )}
                                {reservation.cancelReason && (
                                    <div>
                                        <p className="text-xs text-red-500 mb-1">Cancellation Reason</p>
                                        <p className="text-sm text-red-600">{reservation.cancelReason}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Order Info */}
                    {reservation.order && (
                        <div>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground"><ShoppingBag className="w-4 h-4" /> Linked Order</h3>
                            <div className="bg-muted/30 p-4 rounded-lg border">
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Order Status</p>
                                        <Badge variant="secondary" className="uppercase text-[10px]">{reservation.order.status}</Badge>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Payment Status</p>
                                        <div className="flex items-center gap-1">
                                            <CreditCard className="w-3 h-3 text-muted-foreground" />
                                            <span className="text-sm capitalize">{reservation.order.paymentStatus}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                                        <p className="text-sm font-bold">{myBusinessFullDetails?.currency || "$"}{Number(reservation.order.totalAmount || 0).toFixed(2)}</p>
                                    </div>
                                </div>

                                {reservation.order.items && reservation.order.items.length > 0 && (
                                    <>
                                        <Separator className="my-3 text-muted" />
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-muted-foreground">Order Items</p>
                                            {reservation.order.items.map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center text-sm bg-background p-2 rounded border">
                                                    <div>
                                                        <span className="font-medium">{item.quantity}x</span> {item.name}
                                                        {item.notes && <p className="text-xs text-muted-foreground pl-6">Note: {item.notes}</p>}
                                                    </div>
                                                    <div className="font-medium">{myBusinessFullDetails?.currency || "$"}{Number(item.totalPrice || 0).toFixed(2)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
