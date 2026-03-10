import flairapi from "@/lib/flairapi";

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

export const getFavoritesApiCall = (params: FetchFavoritesParams = {}) => {
    return flairapi.get(baseUrl, { params });
};
