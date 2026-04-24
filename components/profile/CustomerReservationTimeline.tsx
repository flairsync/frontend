import React from "react";
import { CustomerTimelineEvent, CustomerEventType } from "@/features/discovery/types";
import { formatDistanceToNow } from "date-fns";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

interface CustomerReservationTimelineProps {
    events: CustomerTimelineEvent[];
    timezone?: string;
}

interface EventConfig {
    label: string;
    icon: string;
}

const EVENT_CONFIG: Record<CustomerEventType, EventConfig> = {
    created:                         { label: "Reservation received",          icon: "📅" },
    confirmed:                       { label: "Reservation confirmed",         icon: "✅" },
    seated:                          { label: "You've been seated — enjoy!",   icon: "🪑" },
    completed:                       { label: "Thank you for dining with us",  icon: "🏁" },
    cancelled:                       { label: "Reservation cancelled",         icon: "❌" },
    rejected:                        { label: "Reservation rejected",          icon: "⛔" },
    updated:                         { label: "Details updated",               icon: "✏️" },
    no_show:                         { label: "Marked as no-show",             icon: "🚫" },
    expired:                         { label: "Reservation expired",           icon: "⏰" },
    table_assigned:                  { label: "Table assigned",                icon: "🪑" },
    table_reassigned:                { label: "Table reassigned",              icon: "🔄" },
    reminder_sent:                   { label: "Reminder sent",                 icon: "🔔" },
    customer_late:                   { label: "Running late noted",            icon: "🏃" },
    delay_noticed:                   { label: "Delay noticed",                 icon: "⏳" },
    customer_confirmed_attendance:   { label: "You confirmed attendance",      icon: "👍" },
    customer_running_late:           { label: "You reported running late",     icon: "🏃" },
    customer_requested_cancellation: { label: "You requested cancellation",    icon: "🙋" },
    customer_requested_modification: { label: "You requested a change",        icon: "✏️" },
    customer_acknowledged_delay:     { label: "You acknowledged the wait",     icon: "👋" },
};

function getMetaSub(event: CustomerTimelineEvent): string | null {
    const m = event.metadata;
    if (!m) return null;

    switch (event.type) {
        case 'customer_running_late':
            return m.estimatedDelayMinutes ? `~${m.estimatedDelayMinutes} min behind schedule` : null;
        case 'reminder_sent':
            return m.minutesBefore ? `Sent ${m.minutesBefore} min before your reservation` : null;
        case 'customer_requested_modification': {
            const parts: string[] = [];
            if (m.requestedTime) parts.push(`New time: ${m.requestedTime}`);
            if (m.requestedGuestCount) parts.push(`Party of ${m.requestedGuestCount}`);
            return parts.length > 0 ? parts.join(' · ') : null;
        }
        case 'customer_requested_cancellation':
            return m.notes ? m.notes : null;
        default:
            return null;
    }
}

export const CustomerReservationTimeline: React.FC<CustomerReservationTimelineProps> = ({
    events,
    timezone: tz,
}) => {
    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm">
                <span className="text-3xl mb-3">📅</span>
                <p>No updates yet. Check back soon!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 py-2 px-2">
            {events.map((event) => {
                const isCustomer = event.source === 'customer';
                const config = EVENT_CONFIG[event.type] ?? { label: event.type, icon: "•" };
                const metaSub = getMetaSub(event);
                const formattedTime = tz
                    ? dayjs(event.createdAt).tz(tz).format("h:mm A")
                    : formatDistanceToNow(new Date(event.createdAt), { addSuffix: true });

                return (
                    <div
                        key={event.id}
                        className={`flex flex-col max-w-[80%] ${isCustomer ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                        {/* Bubble */}
                        <div
                            className={`
                                rounded-2xl px-4 py-2.5 shadow-sm
                                ${isCustomer
                                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                                    : 'bg-muted text-foreground rounded-bl-sm border'
                                }
                            `}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-base leading-none select-none">{config.icon}</span>
                                <span className="text-sm font-medium">{config.label}</span>
                            </div>
                            {metaSub && (
                                <p className={`text-xs mt-1 ${isCustomer ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>
                                    {metaSub}
                                </p>
                            )}
                        </div>
                        {/* Timestamp */}
                        <span className="text-[10px] text-muted-foreground mt-1 px-1">{formattedTime}</span>
                    </div>
                );
            })}
        </div>
    );
};
