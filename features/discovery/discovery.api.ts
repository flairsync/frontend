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

export const submitReservationApiCall = (businessId: string, payload: Record<string, any>) => {
    return flairapi.post(`${baseUrl}/businesses/${businessId}/reservations`, payload);
};

export const submitOrderApiCall = (businessId: string, payload: Record<string, any>) => {
    return flairapi.post(`${baseUrl}/businesses/${businessId}/orders`, payload);
};

export const fetchMyReservationsApiCall = (businessId?: string) => {
    if (businessId) {
        return flairapi.get(`${baseUrl}/businesses/${businessId}/my-reservations`);
    }
    return flairapi.get(`${baseUrl}/my-reservations`);
};

export const fetchMyOrdersApiCall = (businessId: string) => {
    return flairapi.get(`${baseUrl}/businesses/${businessId}/my-orders`);
};

export const cancelReservationApiCall = (businessId: string, reservationId: string) => {
    return flairapi.patch(`${baseUrl}/businesses/${businessId}/my-reservations/${reservationId}/cancel`);
};
