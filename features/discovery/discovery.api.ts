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

export const fetchMyOrdersApiCall = (businessId: string) => {
    return flairapi.get(`${baseUrl}/businesses/${businessId}/my-orders`);
};

export const cancelReservationApiCall = (businessId: string, reservationId: string) => {
    return flairapi.patch(`${baseUrl}/businesses/${businessId}/my-reservations/${reservationId}/cancel`);
};

export const fetchReservationTimelineApiCall = (businessId: string, reservationId: string) => {
    return flairapi.get(`${baseUrl}/businesses/${businessId}/my-reservations/${reservationId}/timeline`);
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
