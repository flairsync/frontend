import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation("management");
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
                            <DialogTitle>{t("view_reservation_modal.title")}</DialogTitle>
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
                            <p className="text-sm">{t("view_reservation_modal.load_failed")}</p>
                            <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>{t("view_reservation_modal.close")}</Button>
                        </div>
                    )}

                    {/* Full content — only render once fresh data is available */}
                    {!loadingDetail && res && (
                        <>
                            {/* Terminal status notice */}
                            {terminal && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2 border">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    {t("view_reservation_modal.closed_notice")}
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
                                            {res.table ? t("view_reservation_modal.reassign_table") : t("view_reservation_modal.assign_table")}
                                        </Button>
                                    )}
                                    {showCustomerLate && (
                                        <CustomerLatePopover businessId={businessId} reservationId={res.id} />
                                    )}
                                </div>
                            )}

                            <Tabs defaultValue="details">
                                <TabsList>
                                    <TabsTrigger value="details">{t("view_reservation_modal.tabs.details")}</TabsTrigger>
                                    <TabsTrigger value="timeline" className="flex items-center gap-1">
                                        <History className="w-3.5 h-3.5" /> {t("view_reservation_modal.tabs.timeline")}
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="details">
                                    <div className="space-y-6 py-4">
                                        {/* Customer Info */}
                                        <div>
                                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                                                <User className="w-4 h-4" /> {t("view_reservation_modal.customer_info.heading")}
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border">
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">{t("view_reservation_modal.customer_info.name")}</p>
                                                    <p className="text-sm font-medium">{res.customerName || t("view_reservation_modal.not_available")}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">{t("view_reservation_modal.customer_info.source")}</p>
                                                    <p className="text-sm font-medium">{res.reservationSource ? t(`booking_flow_modal.source_options.${res.reservationSource}`, { defaultValue: res.reservationSource }) : t("view_reservation_modal.not_available")}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm">{res.customerPhone || t("view_reservation_modal.not_available")}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm">{res.customerEmail || t("view_reservation_modal.not_available")}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reservation Info */}
                                        <div>
                                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                                                <CalendarDays className="w-4 h-4" /> {t("view_reservation_modal.reservation_info.heading")}
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg border">
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">{t("view_reservation_modal.reservation_info.date")}</p>
                                                    <p className="text-sm font-medium flex items-center gap-1">
                                                        <CalendarDays className="w-3 h-3" />
                                                        {formatInTimezone(res.reservationTime, "MMM D, YYYY", tz)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">{t("view_reservation_modal.reservation_info.time")}</p>
                                                    <p className="text-sm font-medium flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatInTimezone(res.reservationTime, "h:mm A", tz)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">{t("view_reservation_modal.reservation_info.duration")}</p>
                                                    <p className="text-sm font-medium">{t("view_reservation_modal.reservation_info.duration_value", { count: res.durationMinutes })}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">{t("view_reservation_modal.reservation_info.guests")}</p>
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
                                                <Table2 className="w-4 h-4" /> {t("view_reservation_modal.table_info.heading")}
                                            </h3>
                                            <div className="bg-muted/30 p-4 rounded-lg border">
                                                {res.table ? (
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">{t("view_reservation_modal.table_info.table_name")}</p>
                                                            <p className="text-sm font-medium">
                                                                {res.table.name || t("view_reservation_modal.table_info.table_number_fallback", { number: res.table.number || t("view_reservation_modal.not_available") })}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">{t("view_reservation_modal.table_info.capacity")}</p>
                                                            <p className="text-sm font-medium">{t("view_reservation_modal.table_info.capacity_value", { count: res.table.capacity })}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">{t("view_reservation_modal.table_info.status")}</p>
                                                            <p className="text-sm font-medium capitalize">{res.table.status}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">{t("view_reservation_modal.table_info.no_table")}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Notes & Reasons */}
                                        {(res.notes || res.cancelReason || res.cancelledAt) && (
                                            <div>
                                                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                                                    <FileText className="w-4 h-4" /> {t("view_reservation_modal.notes.heading")}
                                                </h3>
                                                <div className="bg-muted/30 p-4 rounded-lg border space-y-3">
                                                    {res.notes && (
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">{t("view_reservation_modal.notes.customer_notes")}</p>
                                                            <p className="text-sm">{res.notes}</p>
                                                        </div>
                                                    )}
                                                    {res.cancelReason && (
                                                        <div>
                                                            <p className="text-xs text-destructive mb-1">{t("view_reservation_modal.notes.cancel_reason")}</p>
                                                            <p className="text-sm text-destructive">{res.cancelReason}</p>
                                                        </div>
                                                    )}
                                                    {res.cancelledAt && (
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">{t("view_reservation_modal.notes.cancelled_at")}</p>
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
                                                    <ShoppingBag className="w-4 h-4" /> {t("view_reservation_modal.order.heading")}
                                                </h3>
                                                <div className="bg-muted/30 p-4 rounded-lg border">
                                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">{t("view_reservation_modal.order.status")}</p>
                                                            <Badge variant="secondary" className="uppercase text-[10px]">{res.order.status}</Badge>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">{t("view_reservation_modal.order.payment_status")}</p>
                                                            <div className="flex items-center gap-1">
                                                                <CreditCard className="w-3 h-3 text-muted-foreground" />
                                                                <span className="text-sm capitalize">{res.order.paymentStatus}</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">{t("view_reservation_modal.order.total_amount")}</p>
                                                            <p className="text-sm font-bold">
                                                                {myBusinessFullDetails?.currency || "$"}{Number(res.order.totalAmount || 0).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <Separator className="my-3" />
                                                    <div className="space-y-2">
                                                        <p className="text-xs font-semibold text-muted-foreground">{t("view_reservation_modal.order.items_heading")}</p>
                                                        {res.order.items?.length > 0 ? (
                                                            res.order.items.map((item: any, idx: number) => (
                                                                <div key={idx} className="flex justify-between items-center text-sm bg-background p-2 rounded border">
                                                                    <div>
                                                                        <span className="font-medium">{item.quantity}x</span> {item.name}
                                                                        {item.notes && <p className="text-xs text-muted-foreground pl-6">{t("view_reservation_modal.order.item_note", { note: item.notes })}</p>}
                                                                    </div>
                                                                    <div className="font-medium">
                                                                        {myBusinessFullDetails?.currency || "$"}{Number(item.totalPrice || 0).toFixed(2)}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground">{t("view_reservation_modal.order.no_items")}</p>
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
