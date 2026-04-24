export type ReservationStatus =
    | 'pending'
    | 'confirmed'
    | 'seated'
    | 'completed'
    | 'cancelled'
    | 'no_show'
    | 'expired'
    | 'waitlist';

export type EventSource = 'staff' | 'customer' | 'system';
export type EventVisibility = 'staff_only' | 'customer_visible';

export type ReservationEventType =
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

export interface ReservationEvent {
    id: string;
    reservationId: string;
    type: ReservationEventType;
    source: EventSource;
    visibility: EventVisibility;
    createdById: string | null;
    createdBy: { id: string; firstName: string; lastName: string } | null;
    metadata: Record<string, any>;
    createdAt: string;
}

export interface ReservationSummary {
    id: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    guestCount: number;
    reservationTime: string;
    status: ReservationStatus;
    durationMinutes?: number;
    notes?: string;
    table?: {
        id: string;
        name?: string;
        number?: number;
        capacity: number;
        status: string;
    };
    noShowMarkedAt?: string;
    cancelledAt?: string;
    cancelReason?: string;
}

export interface DashboardStats {
    totalToday: number;
    confirmed: number;
    seated: number;
    completed: number;
    noShow: number;
    cancelled: number;
}

export interface DashboardResponse {
    todayReservations: ReservationSummary[];
    currentlySeated: ReservationSummary[];
    upcoming: ReservationSummary[];
    noShowsToday: ReservationSummary[];
    stats: DashboardStats;
}

export interface WalkInReservationDto {
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    guestCount: number;
    tableId: string;
    notes?: string;
    durationMinutes?: number;
}

export interface AssignTableDto {
    tableId: string;
}

export interface CustomerLateDto {
    estimatedDelayMinutes?: number;
    notes?: string;
}
