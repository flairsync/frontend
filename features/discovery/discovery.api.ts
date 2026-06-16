import flairapi from "@/lib/flairapi";
import { unwrap, unwrapPaginated, PaginatedData } from "../shared/api-response";
import { CustomerActionPayload } from "./types";

const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/discovery`;

export interface FetchDiscoveryBusinessesParams {
    lat?: number;
    lng?: number;
    radius?: number;
    q?: string;
    typeId?: number;
    tagIds?: string;
    countryId?: number;
    city?: string;
    state?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    page?: number;
    limit?: number;
}

export const fetchDiscoveryBusinessesApiCall = async (params: FetchDiscoveryBusinessesParams): Promise<PaginatedData<any>> =>
    unwrapPaginated(await flairapi.get(`${baseUrl}/businesses`, { params }));

export const fetchDiscoveryProfileApiCall = async (businessId: string): Promise<any> =>
    unwrap(await flairapi.get(`${baseUrl}/businesses/${businessId}`));

export const fetchDiscoveryMenuApiCall = async (businessId: string): Promise<any> =>
    unwrap(await flairapi.get(`${baseUrl}/businesses/${businessId}/menu`));

export const fetchDiscoveryTablesApiCall = async (businessId: string): Promise<any> =>
    unwrap(await flairapi.get(`${baseUrl}/businesses/${businessId}/tables`));

export const checkDiscoveryTableAvailabilityApiCall = async (
    businessId: string,
    params: { date: string; guestCount: number },
): Promise<any[]> =>
    unwrap(await flairapi.get(`${baseUrl}/businesses/${businessId}/tables/availability`, { params }));

// ─── Mutations (return raw axios so onSuccess handlers have full response) ────

export const submitReservationApiCall = (businessId: string, payload: Record<string, any>) =>
    flairapi.post(`${baseUrl}/businesses/${businessId}/reservations`, payload);

export const submitOrderApiCall = (businessId: string, payload: Record<string, any>) =>
    flairapi.post(`${baseUrl}/businesses/${businessId}/orders`, payload);

// ─── My Reservations ─────────────────────────────────────────────────────────

export interface FetchMyReservationsParams {
    businessId?: string;
    sortBy?: "reservationTime" | "createdAt" | string;
    sortOrder?: "DESC" | "ASC" | string;
}

export interface FetchAllMyReservationsParams {
    filter?: "upcoming" | "past";
    status?: string;
    page?: number;
    limit?: number;
}

export const fetchAllMyReservationsApiCall = async (params?: FetchAllMyReservationsParams): Promise<PaginatedData<any>> =>
    unwrapPaginated(await flairapi.get(`${baseUrl}/reservations/mine`, { params }));

export const fetchMyReservationsApiCall = async (params?: FetchMyReservationsParams): Promise<any[]> => {
    const queryParams: any = {};
    if (params?.sortBy) queryParams.sortBy = params.sortBy;
    if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

    if (params?.businessId) {
        return unwrap(await flairapi.get(`${baseUrl}/businesses/${params.businessId}/my-reservations`, { params: queryParams }));
    }
    return unwrap(await flairapi.get(`${baseUrl}/my-reservations`, { params: queryParams }));
};

export const cancelReservationApiCall = (businessId: string, reservationId: string) =>
    flairapi.patch(`${baseUrl}/businesses/${businessId}/my-reservations/${reservationId}/cancel`);

export const fetchReservationTimelineApiCall = async (businessId: string, reservationId: string): Promise<any> =>
    unwrap(await flairapi.get(`${baseUrl}/businesses/${businessId}/my-reservations/${reservationId}/timeline`));

export const postReservationActionApiCall = (
    businessId: string,
    reservationId: string,
    payload: CustomerActionPayload,
) =>
    flairapi.post(`${baseUrl}/businesses/${businessId}/my-reservations/${reservationId}/action`, payload);

// ─── My Orders ────────────────────────────────────────────────────────────────

export interface FetchMyOrdersParams {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
}

export const fetchMyOrdersApiCall = async (businessId: string, params?: FetchMyOrdersParams): Promise<PaginatedData<any>> =>
    unwrapPaginated(await flairapi.get(`${baseUrl}/businesses/${businessId}/my-orders`, { params }));

export const fetchSingleOrderApiCall = async (businessId: string, orderId: string): Promise<any> =>
    unwrap(await flairapi.get(`${baseUrl}/businesses/${businessId}/my-orders/${orderId}`));

export const reorderApiCall = (businessId: string, orderId: string, payload?: { type?: string; tableId?: string }) =>
    flairapi.post(`${baseUrl}/businesses/${businessId}/my-orders/${orderId}/reorder`, payload || {});

// ─── Reviews ─────────────────────────────────────────────────────────────────

export interface FetchReviewsParams {
    page?: number;
    limit?: number;
    rating?: number;
}

export const fetchReviewsApiCall = async (businessId: string, params?: FetchReviewsParams): Promise<PaginatedData<any>> =>
    unwrapPaginated(await flairapi.get(`${baseUrl}/businesses/${businessId}/reviews`, { params }));

export const fetchReviewStatsApiCall = async (businessId: string): Promise<any> =>
    unwrap(await flairapi.get(`${baseUrl}/businesses/${businessId}/reviews/stats`));

export const fetchMyReviewApiCall = async (businessId: string): Promise<any> =>
    unwrap(await flairapi.get(`${baseUrl}/businesses/${businessId}/reviews/mine`));

export const fetchMyReviewsApiCall = async (): Promise<PaginatedData<any>> =>
    unwrapPaginated(await flairapi.get(`${baseUrl}/reviews/mine`));

export const createReviewApiCall = (businessId: string, payload: { rating: number; comment?: string }) =>
    flairapi.post(`${baseUrl}/businesses/${businessId}/reviews`, payload);

export const updateReviewApiCall = (businessId: string, reviewId: string, payload: { rating?: number; comment?: string }) =>
    flairapi.patch(`${baseUrl}/businesses/${businessId}/reviews/${reviewId}`, payload);

export const deleteReviewApiCall = (businessId: string, reviewId: string) =>
    flairapi.delete(`${baseUrl}/businesses/${businessId}/reviews/${reviewId}`);

// ─── Order items (mutations) ──────────────────────────────────────────────────

export const addItemsToOrderApiCall = (
    businessId: string,
    orderId: string,
    payload: {
        items: {
            menuItemId: string;
            variantId?: string;
            quantity: number;
            modifiers?: { modifierItemId: string }[];
            notes?: string;
        }[];
    },
) =>
    flairapi.post(`${baseUrl}/businesses/${businessId}/my-orders/${orderId}/items`, payload);

// ─── Misc ─────────────────────────────────────────────────────────────────────

export const callWaiterApiCall = (businessId: string, payload: { tableId?: string; reservationId?: string }) =>
    flairapi.post(`${baseUrl}/businesses/${businessId}/call-waiter`, payload);
