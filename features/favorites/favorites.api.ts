import flairapi from "@/lib/flairapi";
import { unwrapPaginated, PaginatedData } from "../shared/api-response";

const baseUrl = `${import.meta.env.BASE_URL}/user-favorites`;

export const addFavoriteApiCall = (businessId: string) => {
    return flairapi.post(`${baseUrl}/${businessId}`);
};

export const removeFavoriteApiCall = (businessId: string) => {
    return flairapi.delete(`${baseUrl}/${businessId}`);
};

export interface FetchFavoritesParams {
    page?: number;
    limit?: number;
}

export const getFavoritesApiCall = async (params: FetchFavoritesParams = {}): Promise<PaginatedData<any>> =>
    unwrapPaginated(await flairapi.get(baseUrl, { params }));
