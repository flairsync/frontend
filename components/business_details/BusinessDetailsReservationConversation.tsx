"use client";
import React, { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessagesSquare, CalendarDays, Clock, Users, Table2 } from "lucide-react";
import { useReservationTimeline } from "@/features/discovery/useDiscovery";
import { CustomerReservationTimeline } from "@/components/profile/CustomerReservationTimeline";
import { CustomerReservationActionBar } from "@/components/profile/CustomerReservationActionBar";
import { getStatusBadge } from "@/features/reservations/reservationUtils";
import { formatInTimezone } from "@/lib/dateUtils";

interface BusinessDetailsReservationConversationProps {
    businessId: string;
    reservationId: string;
    timezone?: string;
}

const TERMINAL_STATUSES = ["completed", "cancelled", "no_show", "expired"];

export const BusinessDetailsReservationConversation: React.FC<BusinessDetailsReservationConversationProps> = ({
    businessId,
    reservationId,
    timezone,
}) => {
    const [open, setOpen] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const { data: timeline, isLoading } = useReservationTimeline(
        open ? businessId : "",
        open ? reservationId : ""
    );

    useEffect(() => {
        if (timeline?.events?.length) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [timeline?.events?.length]);

    const reservation = timeline?.reservation;
    const isTerminal = reservation
        ? TERMINAL_STATUSES.includes(reservation.status?.toLowerCase())
        : false;

    return (
        <>
            <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs border-primary/40 text-primary hover:bg-primary/5"
                onClick={() => setOpen(true)}
            >
                <MessagesSquare className="w-3.5 h-3.5" />
                Conversation
            </Button>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">
                    <SheetHeader className="px-5 pt-5 pb-3 border-b shrink-0">
                        <SheetTitle className="flex items-center gap-2 flex-wrap">
                            {isLoading ? (
                                <Skeleton className="h-5 w-40" />
                            ) : (
                                <>
                                    <span>Reservation</span>
                                    {reservation && getStatusBadge(reservation.status)}
                                </>
                            )}
                        </SheetTitle>

                        {!isLoading && reservation && (
                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap pt-1">
                                <span className="flex items-center gap-1">
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    {formatInTimezone(reservation.reservationTime, "MMM D, YYYY", timezone)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatInTimezone(reservation.reservationTime, "h:mm A", timezone)}
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
                    </SheetHeader>

                    {/* Scrollable timeline */}
                    <div className="flex-1 overflow-y-auto px-3 py-2">
                        {isLoading ? (
                            <div className="space-y-3 p-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                                        <Skeleton className="h-12 w-48 rounded-2xl" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <CustomerReservationTimeline
                                events={timeline?.events ?? []}
                                timezone={timezone}
                            />
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Action bar pinned to bottom */}
                    <div className="px-4 pb-4 shrink-0">
                        {!isLoading && !isTerminal && timeline?.availableActions && timeline.availableActions.length > 0 && (
                            <CustomerReservationActionBar
                                businessId={businessId}
                                reservationId={reservationId}
                                availableActions={timeline.availableActions}
                            />
                        )}
                        {!isLoading && isTerminal && (
                            <p className="py-3 text-center text-sm text-muted-foreground border-t">
                                This reservation is {reservation?.status?.toLowerCase().replace("_", "-")}.
                            </p>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
};
