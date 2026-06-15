import flairapi from "@/lib/flairapi";
import { WalkInReservationDto, AssignTableDto, CustomerLateDto } from "./types";
import { unwrap, unwrapPaginated } from "../shared/api-response";

const getReservationsUrl = (businessId: string) => {
    return `${import.meta.env.BASE_URL}/businesses/${businessId}/reservations`;
};

export interface PreOrderItem {
    menuItemId: string;
    quantity: number;
    notes?: string;
}

// DTOs
export interface CreateReservationDto {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    reservationTime: string;
    guestCount: number;
    notes?: string;
    tableId?: string;
    userId?: string;
    preOrderItems?: PreOrderItem[];
    reservationSource?: string;
    durationMinutes?: number;
}

export interface FetchReservationsDto {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: "reservationTime" | "createdAt" | string;
    sortOrder?: "DESC" | "ASC" | string;
}

export interface UpdateReservationDto {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    reservationTime?: string;
    guestCount?: number;
    notes?: string;
    tableId?: string;
    status?: "PENDING" | "CONFIRMED" | "SEATED" | "COMPLETED" | "CANCELLED" | "NO_SHOW" | "EXPIRED" | "WAITLIST";
}

// API Calls
export const fetchReservationsApiCall = async (businessId: string, params?: FetchReservationsDto) =>
    unwrapPaginated(await flairapi.get(getReservationsUrl(businessId), { params }));

export const createReservationApiCall = (businessId: string, data: CreateReservationDto) => {
    return flairapi.post(getReservationsUrl(businessId), data);
};

export const fetchReservationDetailsApiCall = async (businessId: string, reservationId: string) =>
    unwrap(await flairapi.get(`${getReservationsUrl(businessId)}/${reservationId}`));

export const updateReservationApiCall = (businessId: string, reservationId: string, data: UpdateReservationDto) => {
    return flairapi.patch(`${getReservationsUrl(businessId)}/${reservationId}`, data);
};

export const cancelReservationForStaffApiCall = (businessId: string, reservationId: string, cancelReason?: string) => {
    return flairapi.patch(`${getReservationsUrl(businessId)}/${reservationId}/cancel`, { cancelReason });
};

export const markReservationNoShowApiCall = (businessId: string, reservationId: string) => {
    return flairapi.patch(`${getReservationsUrl(businessId)}/${reservationId}/no-show`);
};

export const findAvailabilityApiCall = async (businessId: string, date: string, guestCount: number) =>
    unwrap(await flairapi.get(`${getReservationsUrl(businessId)}/availability`, { params: { date, guestCount } }));

export const lookupUserApiCall = async (email?: string, phone?: string) =>
    unwrap(await flairapi.get(`${import.meta.env.BASE_URL}/users/lookup`, { params: { email, phone } }));

// V2 endpoints
export const fetchReservationDashboardApiCall = async (businessId: string) =>
    unwrap(await flairapi.get(`${getReservationsUrl(businessId)}/dashboard`));

export const createWalkInApiCall = (businessId: string, data: WalkInReservationDto) => {
    return flairapi.post(`${getReservationsUrl(businessId)}/walk-in`, data);
};

export const assignTableApiCall = (businessId: string, reservationId: string, data: AssignTableDto) => {
    return flairapi.patch(`${getReservationsUrl(businessId)}/${reservationId}/table`, data);
};

export const recordCustomerLateApiCall = (businessId: string, reservationId: string, data: CustomerLateDto) => {
    return flairapi.patch(`${getReservationsUrl(businessId)}/${reservationId}/customer-late`, data);
};

export const fetchReservationEventsApiCall = async (businessId: string, reservationId: string) =>
    unwrap(await flairapi.get(`${getReservationsUrl(businessId)}/${reservationId}/events`));
