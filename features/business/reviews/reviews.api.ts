import flairapi from "@/lib/flairapi";
import { unwrap, unwrapPaginated, PaginatedData } from "@/features/shared/api-response";

const baseUrl = (businessId: string) =>
    `${'https://api.flairsync.com/api/v1'}/businesses/${businessId}/reviews`;

export interface FetchStaffReviewsParams {
    page?: number;
    limit?: number;
    rating?: number;
}

export const fetchStaffReviewsApiCall = async (businessId: string, params?: FetchStaffReviewsParams): Promise<PaginatedData<any>> =>
    unwrapPaginated(await flairapi.get(baseUrl(businessId), { params }));

export const fetchStaffReviewStatsApiCall = async (businessId: string): Promise<any> =>
    unwrap(await flairapi.get(`${baseUrl(businessId)}/stats`));

export const deleteStaffReviewApiCall = (businessId: string, reviewId: string) =>
    flairapi.delete(`${baseUrl(businessId)}/${reviewId}`);
