import flairapi from "@/lib/flairapi";
import { unwrapPaginated, PaginatedData } from "@/features/shared/api-response";

const baseUrl = `${'https://api.flairsync.com/api/v1'}/feedback`;

export interface FetchBusinessFeedbackParams {
    page?: number;
    limit?: number;
    minRating?: number;
}

export const fetchBusinessFeedbackApiCall = async (
    businessId: string,
    params?: FetchBusinessFeedbackParams,
): Promise<PaginatedData<any>> =>
    unwrapPaginated(await flairapi.get(baseUrl, { params: { businessId, ...params } }));
