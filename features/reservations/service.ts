import flairapi from "@/lib/flairapi";
import { CreateOrderDto } from "../orders/service";

const getReservationsUrl = (businessId: string) => {
    return `${import.meta.env.BASE_URL}/businesses/${businessId}/reservations`;
};

// DTOs
export interface CreateReservationDto {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    reservationTime: string;
    guestCount: number;
    notes?: string;
    tableId?: string; // Optional at creation
    userId?: string; // Optional, links reservation to a known user profile
    order?: CreateOrderDto; // Optional pre-order
}

export interface FetchReservationsDto {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
}

export interface UpdateReservationDto {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    reservationTime?: string;
    guestCount?: number;
    notes?: string;
    tableId?: string;
    status?: "pending" | "confirmed" | "rejected" | "cancelled" | "completed";
}

// API Calls
export const fetchReservationsApiCall = (businessId: string, params?: FetchReservationsDto) => {
    return flairapi.get(getReservationsUrl(businessId), { params });
};

export const createReservationApiCall = (businessId: string, data: CreateReservationDto) => {
    return flairapi.post(getReservationsUrl(businessId), data);
};

export const fetchReservationDetailsApiCall = (businessId: string, reservationId: string) => {
    return flairapi.get(`${getReservationsUrl(businessId)}/${reservationId}`);
};

export const updateReservationApiCall = (businessId: string, reservationId: string, data: UpdateReservationDto) => {
    return flairapi.patch(`${getReservationsUrl(businessId)}/${reservationId}`, data);
};

export const findAvailabilityApiCall = (businessId: string, date: string, guestCount: number) => {
    return flairapi.get(`${getReservationsUrl(businessId)}/availability`, {
        params: { date, guestCount }
    });
};

export const lookupUserApiCall = (email?: string, phone?: string) => {
    return flairapi.get(`${import.meta.env.BASE_URL}/users/lookup`, {
        params: { email, phone }
    });
};
