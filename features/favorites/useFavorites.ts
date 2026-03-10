import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFavoriteApiCall, getFavoritesApiCall, removeFavoriteApiCall, FetchFavoritesParams } from "./favorites.api";
import { DiscoveryBusiness } from "@/models/discovery/DiscoveryBusiness";

export const useFavorites = () => {
    const queryClient = useQueryClient();

    const useGetFavorites = (params: FetchFavoritesParams = {}) => {
        return useQuery({
            queryKey: ["favorites", params],
            queryFn: async () => {
                const response = await getFavoritesApiCall(params);
                const data = response.data.data || {};
                return {
                    items: DiscoveryBusiness.parseApiArrayResponse(data.data || []),
                    total: data.total || 0,
                    page: data.page || 1,
                    limit: data.limit || 10,
                };
            },
        });
    };

    const addFavoriteMutation = useMutation({
        mutationFn: (businessId: string) => addFavoriteApiCall(businessId),
        onMutate: async (businessId) => {
            await queryClient.cancelQueries({ queryKey: ["favorites"] });
            await queryClient.cancelQueries({ queryKey: ["discovery_search"] });
            await queryClient.cancelQueries({ queryKey: ["discovery_search_infinite"] });
            await queryClient.cancelQueries({ queryKey: ["discovery_profile"] });

            const previousFavorites = queryClient.getQueryData(["favorites"]);

            // Helper to update business in any data structure
            const updateBusiness = (b: any) => b.id === businessId || b.link === businessId ? { ...b, isFavorite: true } : b;

            // Update Discovery Profile
            queryClient.setQueriesData({ queryKey: ["discovery_profile", businessId] }, (old: any) => old ? { ...old, isFavorite: true } : old);

            // Update Discovery Search
            queryClient.setQueriesData({ queryKey: ["discovery_search"] }, (old: any) => {
                if (!old) return old;
                return { ...old, businesses: old.businesses.map(updateBusiness) };
            });

            // Update Infinite Discovery Search
            queryClient.setQueriesData({ queryKey: ["discovery_search_infinite"] }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        businesses: page.businesses.map(updateBusiness)
                    }))
                };
            });

            return { previousFavorites };
        },
        onError: (err, businessId, context: any) => {
            if (context?.previousFavorites) {
                queryClient.setQueryData(["favorites"], context.previousFavorites);
            }
        },
        onSettled: (data, error, businessId) => {
            queryClient.invalidateQueries({ queryKey: ["favorites"] });
            queryClient.invalidateQueries({ queryKey: ["discovery_search"] });
            queryClient.invalidateQueries({ queryKey: ["discovery_search_infinite"] });
            queryClient.invalidateQueries({ queryKey: ["discovery_profile", businessId] });
        },
    });

    const removeFavoriteMutation = useMutation({
        mutationFn: (businessId: string) => removeFavoriteApiCall(businessId),
        onMutate: async (businessId) => {
            await queryClient.cancelQueries({ queryKey: ["favorites"] });
            await queryClient.cancelQueries({ queryKey: ["discovery_search"] });
            await queryClient.cancelQueries({ queryKey: ["discovery_search_infinite"] });
            await queryClient.cancelQueries({ queryKey: ["discovery_profile"] });

            const previousFavorites = queryClient.getQueryData(["favorites"]);

            // Helper to update business in any data structure
            const updateBusiness = (b: any) => b.id === businessId || b.link === businessId ? { ...b, isFavorite: false } : b;

            // Update Favorites List (Optimistic Removal)
            queryClient.setQueriesData({ queryKey: ["favorites"] }, (old: any) => {
                if (!old) return old;
                return { ...old, items: old.items.filter((item: any) => item.id !== businessId) };
            });

            // Update Discovery Profile
            queryClient.setQueriesData({ queryKey: ["discovery_profile", businessId] }, (old: any) => old ? { ...old, isFavorite: false } : old);

            // Update Discovery Search
            queryClient.setQueriesData({ queryKey: ["discovery_search"] }, (old: any) => {
                if (!old) return old;
                return { ...old, businesses: old.businesses.map(updateBusiness) };
            });

            // Update Infinite Discovery Search
            queryClient.setQueriesData({ queryKey: ["discovery_search_infinite"] }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        businesses: page.businesses.map(updateBusiness)
                    }))
                };
            });

            return { previousFavorites };
        },
        onError: (err, businessId, context: any) => {
            if (context?.previousFavorites) {
                queryClient.setQueryData(["favorites"], context.previousFavorites);
            }
        },
        onSettled: (data, error, businessId) => {
            queryClient.invalidateQueries({ queryKey: ["favorites"] });
            queryClient.invalidateQueries({ queryKey: ["discovery_search"] });
            queryClient.invalidateQueries({ queryKey: ["discovery_search_infinite"] });
            queryClient.invalidateQueries({ queryKey: ["discovery_profile", businessId] });
        },
    });

    return {
        useGetFavorites,
        addFavorite: addFavoriteMutation.mutateAsync,
        isAdding: addFavoriteMutation.isPending,
        removeFavorite: removeFavoriteMutation.mutateAsync,
        isRemoving: removeFavoriteMutation.isPending,
    };
};
