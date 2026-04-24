import React from "react";
import { useReservationEvents } from "@/features/reservations/useReservationDashboard";
import { ReservationEvent } from "@/features/reservations/types";
type ReservationEventType = ReservationEvent['type'];
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Lock } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

interface ReservationTimelineProps {
    businessId: string;
    reservationId: string;
    timezone?: string;
}

const EVENT_CONFIG: Record<ReservationEventType, { label: string; icon: string }> = {
    created:          { label: "Reservation created",      icon: "📅" },
    confirmed:        { label: "Confirmed",                icon: "✅" },
    seated:           { label: "Seated",                   icon: "🪑" },
    completed:        { label: "Completed",                icon: "🏁" },
    cancelled:        { label: "Cancelled",                icon: "❌" },
    no_show:          { label: "No-show",                  icon: "🚫" },
    expired:          { label: "Expired",                  icon: "⏰" },
    updated:          { label: "Details updated",          icon: "✏️" },
    rejected:         { label: "Rejected",                 icon: "⛔" },
    table_assigned:   { label: "Table assigned",           icon: "🪑" },
    table_reassigned: { label: "Table reassigned",         icon: "🔄" },
    reminder_sent:    { label: "Reminder sent",            icon: "🔔" },
    customer_late:    { label: "Customer running late",    icon: "🏃" },
    delay_noticed:                   { label: "Delay noticed",                    icon: "⏳" },
    customer_confirmed_attendance:   { label: "Customer confirmed attendance",    icon: "👍" },
    customer_running_late:           { label: "Customer running late",            icon: "🏃" },
    customer_requested_cancellation: { label: "Customer requested cancellation",  icon: "🙋" },
    customer_requested_modification: { label: "Customer requested a change",      icon: "✏️" },
    customer_acknowledged_delay:     { label: "Customer acknowledged wait",       icon: "👋" },
};

const SOURCE_BADGE = {
    staff:    { label: "Staff",    className: "bg-blue-50 text-blue-700 border-blue-200" },
    customer: { label: "Customer", className: "bg-purple-50 text-purple-700 border-purple-200" },
    system:   { label: "System",   className: "bg-green-50 text-green-700 border-green-200" },
};

export const ReservationTimeline: React.FC<ReservationTimelineProps> = ({ businessId, reservationId, timezone: tz }) => {
    const { data: events, isLoading } = useReservationEvents(businessId, reservationId);

    if (isLoading) {
        return (
            <div className="space-y-3 py-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
            </div>
        );
    }

    if (!events || events.length === 0) {
        return (
            <div className="py-8 text-center text-sm text-muted-foreground">No events recorded yet.</div>
        );
    }

    return (
        <div className="relative py-2">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-4">
                {events.map((event: ReservationEvent, idx: number) => {
                    const config = EVENT_CONFIG[event.type] ?? { label: event.type, icon: "•" };
                    const sourceBadge = SOURCE_BADGE[event.source] ?? SOURCE_BADGE.system;
                    const actor = event.createdBy
                        ? `${event.createdBy.firstName} ${event.createdBy.lastName}`
                        : sourceBadge.label;
                    const formattedTime = tz
                        ? dayjs(event.createdAt).tz(tz).format("MMM D, h:mm A")
                        : formatDistanceToNow(new Date(event.createdAt), { addSuffix: true });

                    return (
                        <div key={event.id} className="relative flex gap-4 pl-12">
                            {/* Icon circle */}
                            <div className="absolute left-2 flex items-center justify-center w-6 h-6 rounded-full bg-background border-2 border-border text-sm select-none">
                                {config.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 bg-muted/30 border rounded-lg px-3 py-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium">{config.label}</span>
                                    <Badge variant="outline" className={`text-[9px] uppercase ${sourceBadge.className}`}>
                                        {sourceBadge.label}
                                    </Badge>
                                    {event.visibility === "staff_only" && (
                                        <Lock className="w-3 h-3 text-muted-foreground" title="Staff only" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-muted-foreground">{actor}</span>
                                    <span className="text-xs text-muted-foreground">·</span>
                                    <span className="text-xs text-muted-foreground">{formattedTime}</span>
                                </div>
                                {event.metadata && Object.keys(event.metadata).length > 0 && (
                                    <div className="mt-1.5 text-xs text-muted-foreground space-y-0.5">
                                        {event.metadata.estimatedDelayMinutes && (
                                            <p>Estimated delay: {event.metadata.estimatedDelayMinutes} min</p>
                                        )}
                                        {event.metadata.notes && (
                                            <p>Note: {event.metadata.notes}</p>
                                        )}
                                        {event.metadata.cancelReason && (
                                            <p>Reason: {event.metadata.cancelReason}</p>
                                        )}
                                        {event.metadata.tableName && (
                                            <p>Table: {event.metadata.tableName}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
