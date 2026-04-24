import React, { useEffect, useRef } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { navigate } from "vike/client/router";
import { useReservationTimeline } from "@/features/discovery/useDiscovery";
import { useDiscoveryProfile } from "@/features/discovery/useDiscovery";
import { useCancelReservation } from "@/features/discovery/useDiscovery";
import { CustomerReservationTimeline } from "@/components/profile/CustomerReservationTimeline";
import { CustomerReservationActionBar } from "@/components/profile/CustomerReservationActionBar";
import { getStatusBadge } from "@/features/reservations/reservationUtils";
import { formatInTimezone } from "@/lib/dateUtils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, CalendarDays, Clock, Users, Table2, AlertTriangle } from "lucide-react";

const TERMINAL_STATUSES = ['completed', 'cancelled', 'no_show', 'expired'];

const ReservationTimelinePage: React.FC = () => {
    const { routeParams } = usePageContext();
    const reservationId = routeParams.id;

    const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);

    // We need businessId — it's embedded in the reservation data once loaded
    // We do a two-pass: first load from "my_reservations" cache, then refine with timeline
    // For now we fetch timeline without businessId using the global endpoint approach
    // Note: the spec uses /discovery/businesses/:businessId/my-reservations/:id/timeline
    // We derive businessId from the reservation data in the timeline response
    // Since we can't call the hook without businessId, we use a placeholder strategy:
    // The ProfileReservationCard passes businessId via URL query or separate param
    // Here we read it from the URL search param ?businessId=
    const searchParams = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();
    const businessId = searchParams.get('businessId') ?? '';

    const { data: timeline, isLoading, refetch } = useReservationTimeline(businessId, reservationId);
    const { data: businessProfile } = useDiscoveryProfile(businessId);
    const { mutate: cancelReservation, isPending: cancelling } = useCancelReservation(businessId);

    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to latest event
    useEffect(() => {
        if (timeline?.events?.length) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [timeline?.events?.length]);

    const reservation = timeline?.reservation;
    const tz = businessProfile?.timezone;
    const isTerminal = reservation ? TERMINAL_STATUSES.includes(reservation.status?.toLowerCase()) : false;
    const canSelfCancel = reservation
        && ['pending', 'confirmed', 'waitlist'].includes(reservation.status?.toLowerCase());

    if (!businessId) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <AlertTriangle className="w-10 h-10 text-amber-500" />
                <p className="text-muted-foreground">Could not identify the restaurant for this reservation.</p>
                <Button variant="outline" onClick={() => navigate('/profile/reservations')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Reservations
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate('/profile/reservations')}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                    {isLoading ? (
                        <Skeleton className="h-5 w-40" />
                    ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="font-semibold">{businessProfile?.name ?? 'Reservation'}</h1>
                            {reservation && getStatusBadge(reservation.status)}
                        </div>
                    )}
                </div>
                {!isLoading && canSelfCancel && (
                    <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-50 text-xs"
                        onClick={() => setCancelDialogOpen(true)}>
                        Cancel
                    </Button>
                )}
            </div>

            {/* Reservation summary bar */}
            {!isLoading && reservation && (
                <div className="flex items-center gap-4 py-3 border-b text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {formatInTimezone(reservation.reservationTime, "MMM D, YYYY", tz)}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatInTimezone(reservation.reservationTime, "h:mm A", tz)}
                    </span>
                    <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {reservation.guestCount} guests
                    </span>
                    {reservation.table && (
                        <span className="flex items-center gap-1">
                            <Table2 className="w-3.5 h-3.5" />
                            {reservation.table.name || `Table ${reservation.table.number}`}
                        </span>
                    )}
                </div>
            )}

            {/* Timeline — scrollable */}
            <div className="flex-1 overflow-y-auto py-2">
                {isLoading ? (
                    <div className="space-y-3 p-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                                <Skeleton className="h-12 w-48 rounded-2xl" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <CustomerReservationTimeline
                        events={timeline?.events ?? []}
                        timezone={tz}
                    />
                )}
                <div ref={bottomRef} />
            </div>

            {/* Action bar — pinned to bottom */}
            {!isLoading && !isTerminal && timeline?.availableActions && timeline.availableActions.length > 0 && (
                <CustomerReservationActionBar
                    businessId={businessId}
                    reservationId={reservationId}
                    availableActions={timeline.availableActions}
                />
            )}

            {/* Terminal state message */}
            {!isLoading && isTerminal && (
                <div className="py-3 text-center text-sm text-muted-foreground border-t">
                    This reservation is {reservation?.status?.toLowerCase().replace('_', '-')}.
                </div>
            )}

            {/* Self-cancel dialog */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Cancel Reservation</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this reservation? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setCancelDialogOpen(false)}>Back</Button>
                        <Button
                            variant="destructive"
                            disabled={cancelling}
                            onClick={() => {
                                cancelReservation(
                                    { businessId, reservationId },
                                    { onSuccess: () => { setCancelDialogOpen(false); refetch(); } }
                                );
                            }}
                        >
                            {cancelling ? "Cancelling…" : "Yes, Cancel"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ReservationTimelinePage;
