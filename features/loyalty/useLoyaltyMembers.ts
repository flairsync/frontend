import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getLoyaltyMembersApiCall,
    getLoyaltyStatsApiCall,
    adjustLoyaltyPointsApiCall,
    getLoyaltyMemberHistoryApiCall,
    LoyaltyMembersPage,
    LoyaltyStats,
    LoyaltyHistoryPage,
} from "./loyalty-api";

export const useLoyaltyMembers = (businessId: string, page: number, limit = 10) => {
    return useQuery({
        queryKey: ["loyalty_members", businessId, page, limit],
        queryFn: async (): Promise<LoyaltyMembersPage> => (await getLoyaltyMembersApiCall(businessId, page, limit)).data.data,
        enabled: !!businessId,
    });
};

export const useLoyaltyStats = (businessId: string) => {
    return useQuery({
        queryKey: ["loyalty_stats", businessId],
        queryFn: async (): Promise<LoyaltyStats> => (await getLoyaltyStatsApiCall(businessId)).data.data,
        enabled: !!businessId,
    });
};

export const useAdjustLoyaltyPoints = (businessId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, delta, note }: { userId: string; delta: number; note?: string }) =>
            adjustLoyaltyPointsApiCall(businessId, userId, delta, note),
        onSuccess: (_res, { userId }) => {
            queryClient.invalidateQueries({ queryKey: ["loyalty_members", businessId] });
            queryClient.invalidateQueries({ queryKey: ["loyalty_stats", businessId] });
            queryClient.invalidateQueries({ queryKey: ["loyalty_member_history", businessId, userId] });
            toast.success("Points adjusted");
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Couldn't adjust points";
            toast.error(msg);
        },
    });
};

// One member's transaction history — powers the "History" dialog on the
// owner/staff member list, for dispute/support lookups.
export const useLoyaltyMemberHistory = (businessId: string, userId: string | undefined, page: number, limit = 10) => {
    return useQuery({
        queryKey: ["loyalty_member_history", businessId, userId, page, limit],
        queryFn: async (): Promise<LoyaltyHistoryPage> => (await getLoyaltyMemberHistoryApiCall(businessId, userId!, page, limit)).data.data,
        enabled: !!businessId && !!userId,
    });
};
