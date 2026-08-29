import { useQuery } from "@tanstack/react-query";
import { getDashboardAnalytics, getAnalyticsExportUrl } from "./analytics.api";
import { DashboardAnalyticsData } from "@/models/analytics";

interface UseDashboardAnalyticsProps {
    businessId: string;
    startDate?: string;
    endDate?: string;
    enabled?: boolean;
    // Ask the backend to fold the equal-length preceding period's sales/productTotals
    // into this same response, so the KPI cards can render "vs previous period" deltas
    // without a second useDashboardAnalytics call.
    comparePreviousPeriod?: boolean;
}

export const useDashboardAnalytics = ({
    businessId,
    startDate,
    endDate,
    enabled = true,
    comparePreviousPeriod = false,
}: UseDashboardAnalyticsProps) => {
    return useQuery({
        queryKey: ["analytics", "dashboard", businessId, startDate, endDate, comparePreviousPeriod],
        queryFn: async () => {
            const response = await getDashboardAnalytics(businessId, {
                startDate,
                endDate,
                comparePrevious: comparePreviousPeriod,
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

export const useAnalyticsExport = (businessId: string) => {
    const exportReport = (startDate: string, endDate: string, format: 'pdf' | 'csv' = 'pdf') => {
        const url = getAnalyticsExportUrl(businessId, startDate, endDate, format);
        const a = document.createElement('a');
        a.href = url;
        a.click();
    };

    return { exportReport };
};
