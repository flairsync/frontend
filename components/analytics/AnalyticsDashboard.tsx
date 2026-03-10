import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useDashboardAnalytics } from "@/features/analytics/useDashboardAnalytics";
import { AnalyticsTimeFilter, TimeRangePreset } from "./AnalyticsTimeFilter";
import { subDays, startOfDay, endOfDay, formatISO } from "date-fns";

// We will implement these next:
import { AnalyticsKpiCards } from "./AnalyticsKpiCards";
import { AnalyticsRevenueChart } from "./AnalyticsRevenueChart";
import { AnalyticsOrderTypesChart } from "./AnalyticsOrderTypesChart";
import { AnalyticsTopProductsTable } from "./AnalyticsTopProductsTable";

interface AnalyticsDashboardProps {
    businessId: string;
    showTimeFilter?: boolean;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
    businessId,
    showTimeFilter = true,
}) => {
    const [timeRange, setTimeRange] = useState<TimeRangePreset>("Last 7 Days");

    // Initialize dates for "Last 7 Days"
    const [startDate, setStartDate] = useState<string>(() =>
        formatISO(startOfDay(subDays(new Date(), 7)))
    );
    const [endDate, setEndDate] = useState<string>(() =>
        formatISO(endOfDay(new Date()))
    );

    const { data: analyticsData, isLoading, isError } = useDashboardAnalytics({
        businessId,
        startDate,
        endDate,
        enabled: !!businessId,
    });

    const handleTimeRangeChange = (preset: TimeRangePreset, start: string, end: string) => {
        setTimeRange(preset);
        setStartDate(start);
        setEndDate(end);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-secondary font-medium">Failed to load analytics data.</p>
            </div>
        );
    }

    const data = analyticsData;

    return (
        <div className="space-y-8">
            {showTimeFilter && (
                <div className="flex items-center gap-2">
                    <AnalyticsTimeFilter value={timeRange} onChange={handleTimeRangeChange} />
                </div>
            )}

            {data && (
                <>
                    <AnalyticsKpiCards sales={data.sales} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnalyticsRevenueChart sales={data.sales} />
                        <AnalyticsOrderTypesChart sales={data.sales} />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <AnalyticsTopProductsTable topProducts={data.topProducts} />
                    </div>
                </>
            )}
        </div>
    );
};
