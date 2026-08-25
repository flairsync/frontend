import React from "react";
import { Badge } from "@/components/ui/badge";
import { ReservationStatus } from "./types";

export type ReservationAction = 'confirm' | 'cancel' | 'seat' | 'complete' | 'no_show' | 'assign_table' | 'customer_late';

const VALID_TRANSITIONS: Record<ReservationStatus, ReservationAction[]> = {
    pending:   ['confirm', 'cancel'],
    waitlist:  ['confirm', 'cancel'],
    confirmed: ['seat', 'cancel', 'no_show', 'assign_table', 'customer_late'],
    seated:    ['complete'],
    completed: [],
    cancelled: [],
    no_show:   [],
    expired:   [],
    rejected:  [],
};

export function getAvailableActions(status: string): ReservationAction[] {
    return VALID_TRANSITIONS[status?.toLowerCase() as ReservationStatus] ?? [];
}

export function isTerminalStatus(status: string): boolean {
    return ['completed', 'cancelled', 'no_show', 'expired', 'rejected'].includes(status?.toLowerCase());
}

const STATUS_BADGE_CLASSES: Record<string, string> = {
    pending:   "bg-yellow-50 text-yellow-700 border-yellow-200",
    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    seated:    "bg-green-50 text-green-700 border-green-200",
    completed: "bg-gray-50 text-gray-700 border-gray-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    no_show:   "bg-orange-50 text-orange-700 border-orange-200",
    expired:   "bg-gray-50 text-gray-500 border-gray-200",
    waitlist:  "bg-purple-50 text-purple-700 border-purple-200",
    rejected:  "bg-red-50 text-red-600 border-red-200",
};

// `t` must come from the caller's own useTranslation() — this util is shared across the
// management/profile/feed namespaces, each of which carries its own copy of
// `reservation_status.*` (namespaces can't share keys across an i18next instance).
export function getStatusBadge(status: string, t: (key: string) => string) {
    const key = status?.toLowerCase();
    const className = STATUS_BADGE_CLASSES[key] ?? "";
    const label = STATUS_BADGE_CLASSES[key] ? t(`reservation_status.${key}`) : status;
    return (
        <Badge variant="outline" className={`${className} uppercase text-[10px]`}>
            {label}
        </Badge>
    );
}
