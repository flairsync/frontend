import api from "@/lib/flairapi";
import { DashboardAnalyticsResponse } from "@/models/analytics";

const baseUrl = `${import.meta.env.BASE_URL}`;

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
