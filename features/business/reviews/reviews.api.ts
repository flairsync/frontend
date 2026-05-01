import flairapi from "@/lib/flairapi";

const baseUrl = (businessId: string) =>
    `${import.meta.env.BASE_URL}/businesses/${businessId}/reviews`;

export interface FetchStaffReviewsParams {
    page?: number;
    limit?: number;
    rating?: number;
}

export const fetchStaffReviewsApiCall = (businessId: string, params?: FetchStaffReviewsParams) =>
    flairapi.get(baseUrl(businessId), { params });

export const fetchStaffReviewStatsApiCall = (businessId: string) =>
    flairapi.get(`${baseUrl(businessId)}/stats`);

export const deleteStaffReviewApiCall = (businessId: string, reviewId: string) =>
    flairapi.delete(`${baseUrl(businessId)}/${reviewId}`);
