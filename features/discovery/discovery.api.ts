import flairapi from "@/lib/flairapi";

const baseUrl = `${import.meta.env.BASE_URL}/discovery`;

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

export const fetchDiscoveryBusinessesApiCall = (params: FetchDiscoveryBusinessesParams) => {
    return flairapi.get(`${baseUrl}/businesses`, { params });
};

export const fetchDiscoveryProfileApiCall = (businessId: string) => {
    return flairapi.get(`${baseUrl}/businesses/${businessId}`);
};

export const fetchDiscoveryMenuApiCall = (businessId: string) => {
    return flairapi.get(`${baseUrl}/businesses/${businessId}/menu`);
};

export const fetchDiscoveryTablesApiCall = (businessId: string) => {
    return flairapi.get(`${baseUrl}/businesses/${businessId}/tables`);
};

export const checkDiscoveryTableAvailabilityApiCall = (businessId: string, params: { date: string, guestCount: number }) => {
    return flairapi.get(`${baseUrl}/businesses/${businessId}/tables/availability`, { params });
};

export const submitReservationApiCall = (businessId: string, payload: Record<string, any>) => {
    return flairapi.post(`${baseUrl}/businesses/${businessId}/reservations`, payload);
};

export const submitOrderApiCall = (businessId: string, payload: Record<string, any>) => {
    return flairapi.post(`${baseUrl}/businesses/${businessId}/orders`, payload);
};

export interface FetchMyReservationsParams {
    businessId?: string;
    sortBy?: "reservationTime" | "createdAt" | string;
    sortOrder?: "DESC" | "ASC" | string;
}

export const fetchMyReservationsApiCall = (params?: FetchMyReservationsParams) => {
    const queryParams: any = {};
    if (params?.sortBy) queryParams.sortBy = params.sortBy;
    if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

    if (params?.businessId) {
        return flairapi.get(`${baseUrl}/businesses/${params.businessId}/my-reservations`, { params: queryParams });
    }
    return flairapi.get(`${baseUrl}/my-reservations`, { params: queryParams });
};

export interface FetchMyOrdersParams {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
}

export const fetchMyOrdersApiCall = (businessId: string, params?: FetchMyOrdersParams) => {
    return flairapi.get(`${baseUrl}/businesses/${businessId}/my-orders`, { params });
};

export const fetchSingleOrderApiCall = (businessId: string, orderId: string) => {
    return flairapi.get(`${baseUrl}/businesses/${businessId}/my-orders/${orderId}`);
};

export const reorderApiCall = (businessId: string, orderId: string, payload?: { type?: string; tableId?: string }) => {
    return flairapi.post(`${baseUrl}/businesses/${businessId}/my-orders/${orderId}/reorder`, payload || {});
};

export const cancelReservationApiCall = (businessId: string, reservationId: string) => {
    return flairapi.patch(`${baseUrl}/businesses/${businessId}/my-reservations/${reservationId}/cancel`);
};

export const fetchReservationTimelineApiCall = (businessId: string, reservationId: string) => {
    return flairapi.get(`${baseUrl}/businesses/${businessId}/my-reservations/${reservationId}/timeline`);
};

// Reviews
export interface FetchReviewsParams {
    page?: number;
    limit?: number;
    rating?: number;
}

export const fetchReviewsApiCall = (businessId: string, params?: FetchReviewsParams) => {
    return flairapi.get(`${baseUrl}/businesses/${businessId}/reviews`, { params });
};

export const fetchReviewStatsApiCall = (businessId: string) => {
    return flairapi.get(`${baseUrl}/businesses/${businessId}/reviews/stats`);
};

export const fetchMyReviewApiCall = (businessId: string) => {
    return flairapi.get(`${baseUrl}/businesses/${businessId}/reviews/mine`);
};

export const createReviewApiCall = (businessId: string, payload: { rating: number; comment?: string }) => {
    return flairapi.post(`${baseUrl}/businesses/${businessId}/reviews`, payload);
};

export const updateReviewApiCall = (businessId: string, reviewId: string, payload: { rating?: number; comment?: string }) => {
    return flairapi.patch(`${baseUrl}/businesses/${businessId}/reviews/${reviewId}`, payload);
};

export const deleteReviewApiCall = (businessId: string, reviewId: string) => {
    return flairapi.delete(`${baseUrl}/businesses/${businessId}/reviews/${reviewId}`);
};

export const postReservationActionApiCall = (
    businessId: string,
    reservationId: string,
    payload: import('./types').CustomerActionPayload,
) => {
    return flairapi.post(
        `${baseUrl}/businesses/${businessId}/my-reservations/${reservationId}/action`,
        payload,
    );
};
