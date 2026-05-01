import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchStaffReviewsApiCall,
    fetchStaffReviewStatsApiCall,
    deleteStaffReviewApiCall,
    FetchStaffReviewsParams,
} from "./reviews.api";
import { toast } from "sonner";

export const useStaffReviews = (businessId: string | undefined, params?: FetchStaffReviewsParams) => {
    return useQuery({
        queryKey: ["staff_reviews", businessId, params],
        queryFn: async () => {
            if (!businessId) return { data: [], page: 1, totalPages: 1 };
            const res = await fetchStaffReviewsApiCall(businessId, params);
            // Shape: { data: { data: [...], current: 1, pages: N } }
            const envelope = res.data?.data ?? res.data;
            const items = envelope?.data ?? envelope ?? [];
            return {
                data: Array.isArray(items) ? items : [],
                page: envelope?.current ?? envelope?.page ?? 1,
                totalPages: envelope?.pages ?? envelope?.totalPages ?? 1,
            };
        },
        enabled: !!businessId,
    });
};

export const useStaffReviewStats = (businessId: string | undefined) => {
    return useQuery({
        queryKey: ["staff_review_stats", businessId],
        queryFn: async () => {
            if (!businessId) return null;
            const res = await fetchStaffReviewStatsApiCall(businessId);
            return res.data.data ?? res.data;
        },
        enabled: !!businessId,
    });
};

export const useDeleteStaffReview = (businessId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (reviewId: string) => {
            const res = await deleteStaffReviewApiCall(businessId, reviewId);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["staff_reviews", businessId] });
            queryClient.invalidateQueries({ queryKey: ["staff_review_stats", businessId] });
        },
        onError: (error: any) => {
            const status = error.response?.status;
            if (status === 403) {
                toast.error("You don't have permission to remove this review.");
            } else {
                toast.error("Failed to remove review.");
            }
        },
    });
};
