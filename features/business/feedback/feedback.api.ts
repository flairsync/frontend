import flairapi, { API_URL } from "@/lib/flairapi";
import { unwrapPaginated, PaginatedData } from "@/features/shared/api-response";

const baseUrl = `${API_URL}/feedback`;

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
