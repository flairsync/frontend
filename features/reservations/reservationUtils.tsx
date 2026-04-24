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
};

export function getAvailableActions(status: string): ReservationAction[] {
    return VALID_TRANSITIONS[status?.toLowerCase() as ReservationStatus] ?? [];
}

export function isTerminalStatus(status: string): boolean {
    return ['completed', 'cancelled', 'no_show', 'expired'].includes(status?.toLowerCase());
}

interface StatusBadgeConfig {
    className: string;
    label: string;
}

const STATUS_CONFIG: Record<string, StatusBadgeConfig> = {
    pending:   { className: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Pending" },
    confirmed: { className: "bg-blue-50 text-blue-700 border-blue-200",       label: "Confirmed" },
    seated:    { className: "bg-green-50 text-green-700 border-green-200",     label: "Seated" },
    completed: { className: "bg-gray-50 text-gray-700 border-gray-200",        label: "Completed" },
    cancelled: { className: "bg-red-50 text-red-700 border-red-200",           label: "Cancelled" },
    no_show:   { className: "bg-orange-50 text-orange-700 border-orange-200",  label: "No Show" },
    expired:   { className: "bg-gray-50 text-gray-500 border-gray-200",        label: "Expired" },
    waitlist:  { className: "bg-purple-50 text-purple-700 border-purple-200",  label: "Waitlist" },
};

export function getStatusBadge(status: string) {
    const config = STATUS_CONFIG[status?.toLowerCase()] ?? { className: "", label: status };
    return (
        <Badge variant="outline" className={`${config.className} uppercase text-[10px]`}>
            {config.label}
        </Badge>
    );
}
