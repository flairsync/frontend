import React from "react";
import { useTranslation } from "react-i18next";
import { CustomerTimelineEvent, CustomerEventType } from "@/features/discovery/types";
import { formatDistanceToNow } from "date-fns";
import { formatTime } from "@/lib/dateUtils";

interface CustomerReservationTimelineProps {
    events: CustomerTimelineEvent[];
    timezone?: string;
}

const EVENT_ICONS: Record<CustomerEventType, string> = {
    created: "📅", confirmed: "✅", seated: "🪑", completed: "🏁",
    cancelled: "❌", rejected: "⛔", updated: "✏️", no_show: "🚫",
    expired: "⏰", table_assigned: "🪑", table_reassigned: "🔄",
    reminder_sent: "🔔", customer_late: "🏃", delay_noticed: "⏳",
    customer_confirmed_attendance: "👍", customer_running_late: "🏃",
    customer_requested_cancellation: "🙋", customer_requested_modification: "✏️",
    customer_acknowledged_delay: "👋",
};

function getMetaSub(event: CustomerTimelineEvent, t: (key: string, options?: Record<string, unknown>) => string): string | null {
    const m = event.metadata;
    if (!m) return null;

    switch (event.type) {
        case 'customer_running_late':
            return m.estimatedDelayMinutes ? t("customer_reservation_timeline.meta.delay_estimate", { minutes: m.estimatedDelayMinutes }) : null;
        case 'reminder_sent':
            return m.minutesBefore ? t("customer_reservation_timeline.meta.reminder_sent_before", { minutes: m.minutesBefore }) : null;
        case 'customer_requested_modification': {
            const parts: string[] = [];
            if (m.requestedTime) parts.push(t("customer_reservation_timeline.meta.new_time", { time: m.requestedTime }));
            if (m.requestedGuestCount) parts.push(t("customer_reservation_timeline.meta.party_of", { count: m.requestedGuestCount }));
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
    const { t } = useTranslation();

    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm">
                <span className="text-3xl mb-3">📅</span>
                <p>{t("customer_reservation_timeline.empty_state")}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 py-2 px-2">
            {events.map((event) => {
                const isCustomer = event.source === 'customer';
                const icon = EVENT_ICONS[event.type] ?? "•";
                const label = EVENT_ICONS[event.type]
                    ? t(`customer_reservation_timeline.event_labels.${event.type}`)
                    : event.type;
                const metaSub = getMetaSub(event, t);
                const formattedTime = tz
                    ? formatTime(event.createdAt, tz)
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
                                <span className="text-base leading-none select-none">{icon}</span>
                                <span className="text-sm font-medium">{label}</span>
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
