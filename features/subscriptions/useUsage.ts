import { useQuery } from "@tanstack/react-query";
import { getUserUsageApiCall } from "./service";
import { usePageContext } from "vike-react/usePageContext";

export interface UsageData {
    allowed: {
        businesses: number;
        menus: number;
        products: number;
        employees: number;
    };
    current: {
        businesses: number;
        menus: number;
        products: number;
        employees: number;
    };
    canCreateBusiness: boolean;
    canCreateMenu: boolean;
    canCreateProduct: boolean;
    canAddEmployee: boolean;
}

export const useUsage = () => {
    const { user } = usePageContext();

    const { data: usage, isLoading, refetch } = useQuery<UsageData | null>({
        queryKey: ["user_usage"],
        queryFn: async () => {
            const res = await getUserUsageApiCall();
            if (res.data.success) {
                return res.data.data;
            }
            return null;
        },
        enabled: !!user,
    });

    return {
        usage,
        isLoading,
        refetch,
    };
};
