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
            const res = await getUserUsageApiCall();
            return res.data as UsageData ?? null;
        },
        enabled: !!user,
    });

    return {
        usage,
        isLoading,
        refetch,
    };
};
