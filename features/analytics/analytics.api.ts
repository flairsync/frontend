import api from "@/lib/flairapi";
import { DashboardAnalyticsResponse } from "@/models/analytics";

const baseUrl = `${'https://api.flairsync.com/api/v1'}`;

export const getDashboardAnalytics = async (
    businessId: string,
    params?: { startDate?: string; endDate?: string }
): Promise<DashboardAnalyticsResponse> => {
    const { data } = await api.get<DashboardAnalyticsResponse>(
        `${baseUrl}/analytics/dashboard`,
        {
            params: {
                businessId,
                ...params,
            },
        }
    );
    return data;
};
