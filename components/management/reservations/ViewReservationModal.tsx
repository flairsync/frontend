import React, { useState } from "react";
import { formatInTimezone } from "@/lib/dateUtils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMyBusiness } from "@/features/business/useMyBusiness";
import { getAvailableActions, getStatusBadge, isTerminalStatus } from "@/features/reservations/reservationUtils";
import { useReservationDetails } from "@/features/reservations/useReservations";
import { ReservationActionButtons } from "./ReservationActionButtons";
import { AssignTableModal } from "./AssignTableModal";
import { CustomerLatePopover } from "./CustomerLatePopover";
import { ReservationTimeline } from "./ReservationTimeline";
import {
    CalendarDays, Clock, Users, User, Phone, Mail, FileText,
    ShoppingBag, CreditCard, Table2, History, Loader, AlertCircle
} from "lucide-react";

interface ViewReservationModalProps {
    businessId: string;
    reservation: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onActionComplete?: () => void;
}

export const ViewReservationModal: React.FC<ViewReservationModalProps> = ({
    businessId,
    reservation,
    open,
    onOpenChange,
    onActionComplete,
}) => {
    const { myBusinessFullDetails } = useMyBusiness(businessId);
    const [assignOpen, setAssignOpen] = useState(false);

    const { data: fullReservation, isLoading: loadingDetail } = useReservationDetails(
        businessId,
        reservation?.id || "",
        { enabled: open && !!reservation?.id }
    );

    const tz = myBusinessFullDetails?.timezone;

    // Use freshly fetched data; fall back to list-state only while loading
    const res = fullReservation ?? null;
    const actions = getAvailableActions(res?.status ?? reservation?.status ?? "");
    const hasActions = actions.length > 0;
    const showAssign = actions.includes("assign_table");
    const showCustomerLate = actions.includes("customer_late");
    const terminal = isTerminalStatus(res?.status ?? reservation?.status ?? "");

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex justify-between items-center pr-4">
                            <DialogTitle>Reservation Details</DialogTitle>
                            {getStatusBadge(res?.status ?? reservation?.status ?? "")}
                        </div>
                    </DialogHeader>

                    {/* Loading state */}
                    {loadingDetail && (
                        <div className="flex items-center justify-center py-16">
                            <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {/* Error state — fetch completed but returned nothing */}
                    {!loadingDetail && !res && open && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                            <AlertCircle className="h-8 w-8" />
                            <p className="text-sm">Failed to load reservation details.</p>
                            <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                        </div>
                    )}

                    {/* Full content — only render once fresh data is available */}
                    {!loadingDetail && res && (
                        <>
                            {/* Terminal status notice */}
                            {terminal && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2 border">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    This reservation is closed and cannot be modified.
                                </div>
                            )}

                            {/* Action bar — only for non-terminal */}
                            {hasActions && (
                                <div className="flex flex-wrap gap-2 px-1 pb-1 border-b">
                                    <ReservationActionButtons
                                        businessId={businessId}
                                        reservation={res}
                                        onActionComplete={() => { onActionComplete?.(); onOpenChange(false); }}
                                    />
                                    {showAssign && (
                                        <Button size="sm" variant="outline" onClick={() => setAssignOpen(true)}>
                                            {res.table ? "Reassign Table" : "Assign Table"}
                                        </Button>
                                    )}
                                    {showCustomerLate && (
                                        <CustomerLatePopover businessId={businessId} reservationId={res.id} />
                                    )}
                                </div>
                            )}

                            <Tabs defaultValue="details">
                                <TabsList>
                                    <TabsTrigger value="details">Details</TabsTrigger>
                                    <TabsTrigger value="timeline" className="flex items-center gap-1">
                                        <History className="w-3.5 h-3.5" /> Timeline
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="details">
                                    <div className="space-y-6 py-4">
                                        {/* Customer Info */}
                                        <div>
                                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                                                <User className="w-4 h-4" /> Customer Information
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border">
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Name</p>
                                                    <p className="text-sm font-medium">{res.customerName || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Reservation Source</p>
                                                    <p className="text-sm font-medium">{res.reservationSource || "N/A"}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm">{res.customerPhone || "N/A"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm">{res.customerEmail || "N/A"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reservation Info */}
                                        <div>
                                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                                                <CalendarDays className="w-4 h-4" /> Reservation Details
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg border">
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Date</p>
                                                    <p className="text-sm font-medium flex items-center gap-1">
                                                        <CalendarDays className="w-3 h-3" />
                                                        {formatInTimezone(res.reservationTime, "MMM D, YYYY", tz)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Time</p>
                                                    <p className="text-sm font-medium flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatInTimezone(res.reservationTime, "h:mm A", tz)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Duration</p>
                                                    <p className="text-sm font-medium">{res.durationMinutes} min</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Guests</p>
                                                    <p className="text-sm font-medium flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {res.guestCount}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Table Info */}
                                        <div>
                                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                                                <Table2 className="w-4 h-4" /> Table Information
                                            </h3>
                                            <div className="bg-muted/30 p-4 rounded-lg border">
                                                {res.table ? (
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">Table Name</p>
                                                            <p className="text-sm font-medium">
                                                                {res.table.name || `Table ${res.table.number || "N/A"}`}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">Capacity</p>
                                                            <p className="text-sm font-medium">{res.table.capacity} persons</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">Table Status</p>
                                                            <p className="text-sm font-medium capitalize">{res.table.status}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">No table assigned</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Notes & Reasons */}
                                        {(res.notes || res.cancelReason || res.cancelledAt) && (
                                            <div>
                                                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                                                    <FileText className="w-4 h-4" /> Notes & Reasons
                                                </h3>
                                                <div className="bg-muted/30 p-4 rounded-lg border space-y-3">
                                                    {res.notes && (
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">Customer Notes</p>
                                                            <p className="text-sm">{res.notes}</p>
                                                        </div>
                                                    )}
                                                    {res.cancelReason && (
                                                        <div>
                                                            <p className="text-xs text-red-500 mb-1">Cancellation Reason</p>
                                                            <p className="text-sm text-red-600">{res.cancelReason}</p>
                                                        </div>
                                                    )}
                                                    {res.cancelledAt && (
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">Cancelled At</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {formatInTimezone(res.cancelledAt, "MMM D, YYYY [at] h:mm A", tz)}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Order Info */}
                                        {res.order && (
                                            <div>
                                                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                                                    <ShoppingBag className="w-4 h-4" /> Linked Order
                                                </h3>
                                                <div className="bg-muted/30 p-4 rounded-lg border">
                                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">Order Status</p>
                                                            <Badge variant="secondary" className="uppercase text-[10px]">{res.order.status}</Badge>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">Payment Status</p>
                                                            <div className="flex items-center gap-1">
                                                                <CreditCard className="w-3 h-3 text-muted-foreground" />
                                                                <span className="text-sm capitalize">{res.order.paymentStatus}</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                                                            <p className="text-sm font-bold">
                                                                {myBusinessFullDetails?.currency || "$"}{Number(res.order.totalAmount || 0).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <Separator className="my-3" />
                                                    <div className="space-y-2">
                                                        <p className="text-xs font-semibold text-muted-foreground">Order Items</p>
                                                        {res.order.items?.length > 0 ? (
                                                            res.order.items.map((item: any, idx: number) => (
                                                                <div key={idx} className="flex justify-between items-center text-sm bg-background p-2 rounded border">
                                                                    <div>
                                                                        <span className="font-medium">{item.quantity}x</span> {item.name}
                                                                        {item.notes && <p className="text-xs text-muted-foreground pl-6">Note: {item.notes}</p>}
                                                                    </div>
                                                                    <div className="font-medium">
                                                                        {myBusinessFullDetails?.currency || "$"}{Number(item.totalPrice || 0).toFixed(2)}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground">No items selected.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="timeline">
                                    <ReservationTimeline
                                        businessId={businessId}
                                        reservationId={res.id}
                                        timezone={tz}
                                    />
                                </TabsContent>
                            </Tabs>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <AssignTableModal
                businessId={businessId}
                reservation={res ?? reservation}
                open={assignOpen}
                onOpenChange={setAssignOpen}
                onSuccess={() => { onActionComplete?.(); }}
            />
        </>
    );
};
