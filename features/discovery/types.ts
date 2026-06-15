import { ReservationSummary } from "@/features/reservations/types";

export type CustomerActionType =
    | 'confirm_attendance'
    | 'running_late'
    | 'request_cancellation'
    | 'request_modification'
    | 'acknowledge_delay';

export type CustomerEventType =
    | 'created'
    | 'confirmed'
    | 'updated'
    | 'cancelled'
    | 'rejected'
    | 'seated'
    | 'completed'
    | 'no_show'
    | 'expired'
    | 'table_assigned'
    | 'table_reassigned'
    | 'reminder_sent'
    | 'customer_late'
    | 'delay_noticed'
    | 'customer_confirmed_attendance'
    | 'customer_running_late'
    | 'customer_requested_cancellation'
    | 'customer_requested_modification'
    | 'customer_acknowledged_delay';

export type CustomerEventSource = 'staff' | 'customer' | 'system';

export interface CustomerTimelineEvent {
    id: string;
    type: CustomerEventType;
    source: CustomerEventSource;
    createdAt: string;
    metadata: Record<string, any>;
}

export interface CustomerTimelineResponse {
    reservation: ReservationSummary;
    events: CustomerTimelineEvent[];
    availableActions: CustomerActionType[];
}

export interface CustomerActionPayload {
    type: CustomerActionType;
    estimatedDelayMinutes?: number;
    requestedTime?: string;
    requestedGuestCount?: number;
    notes?: string;
}

export interface CustomerActionResponse {
    event: CustomerTimelineEvent;
    availableActions: CustomerActionType[];
}
