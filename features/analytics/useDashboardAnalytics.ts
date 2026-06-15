import { useQuery } from "@tanstack/react-query";
import { getDashboardAnalytics } from "./analytics.api";
import { DashboardAnalyticsData } from "@/models/analytics";

interface UseDashboardAnalyticsProps {
    businessId: string;
    startDate?: string;
    endDate?: string;
    enabled?: boolean;
}

export const useDashboardAnalytics = ({
    businessId,
    startDate,
    endDate,
    enabled = true,
}: UseDashboardAnalyticsProps) => {
    return useQuery({
        queryKey: ["analytics", "dashboard", businessId, startDate, endDate],
        queryFn: async () => {
            const response = await getDashboardAnalytics(businessId, {
                startDate,
                endDate,
            });
            // Validating response logic if needed e.g. throw error on fetch failure
            if (!response.success) {
                throw new Error(response.message || "Failed to fetch analytics dashboard data");
            }
            return response.data;
        },
        enabled: enabled && !!businessId,
    });
};
