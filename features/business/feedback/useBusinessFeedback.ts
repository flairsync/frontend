import { useQuery } from "@tanstack/react-query";
import { fetchBusinessFeedbackApiCall, FetchBusinessFeedbackParams } from "./feedback.api";

export const useBusinessFeedback = (businessId: string | undefined, params?: FetchBusinessFeedbackParams) => {
    return useQuery({
        queryKey: ["business_feedback", businessId, params],
        queryFn: async () => {
            if (!businessId) return { data: [], page: 1, totalPages: 1 };
            const res = await fetchBusinessFeedbackApiCall(businessId, params);
            return {
                data: res.data,
                page: res.current,
                totalPages: res.pages,
            };
        },
        enabled: !!businessId,
    });
};
