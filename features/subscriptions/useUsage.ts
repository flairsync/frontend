import { useQuery } from "@tanstack/react-query";
import { getUserUsageApiCall } from "./service";
import { usePageContext } from "vike-react/usePageContext";

// `businesses` is the only genuinely account-wide number — menus/products/
// employees/menu-boards are enforced per business now, so they're no longer
// part of this account-level response. See a business's own plan page
// (useBusinessPlan) for its per-business allowed/used numbers.
export interface UsageData {
    allowed: {
        businesses: number;
    };
    current: {
        businesses: number;
    };
    canCreateBusiness: boolean;
}

export const useUsage = () => {
    const { user } = usePageContext();

    const { data: usage, isLoading, refetch } = useQuery<UsageData | null>({
        queryKey: ["user_usage"],
        queryFn: async () => {
            // P1-9 (QA round 4, 2026-11-19): unlike /subscriptions/current and /subscriptions/my
            // (which double-wrap, since their service methods already return an ApiResponse that
            // the controller wraps again), GET /subscriptions/usage's controller wraps its plain
            // UsageService.getUserLimits() object only once — unwrap() already strips that one
            // envelope, so `res` IS the usage object. Reading `res.data` here read undefined for
            // every account, not just new ones, permanently showing "Usage data not available".
            const res = await getUserUsageApiCall();
            return (res as unknown as UsageData) ?? null;
        },
        enabled: !!user,
    });

    return {
        usage,
        isLoading,
        refetch,
    };
};
