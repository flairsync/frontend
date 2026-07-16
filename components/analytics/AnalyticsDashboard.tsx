import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { useDashboardAnalytics } from "@/features/analytics/useDashboardAnalytics";
import { useMyBusiness } from "@/features/business/useMyBusiness";
import { getCurrencySymbol } from "@/utils/currency";
import { AnalyticsTimeFilter, TimeRangePreset } from "./AnalyticsTimeFilter";
import { subDays, startOfDay, endOfDay, formatISO } from "date-fns";
import { clientOnly } from "vike-react/clientOnly";
import { Card, CardContent } from "@/components/ui/card";

// We will implement these next:
import { AnalyticsKpiCards } from "./AnalyticsKpiCards";
import { AnalyticsTopProductsTable } from "./AnalyticsTopProductsTable";

// recharts is a heavy dependency — defer it off the initial render path so the
// KPI cards and top-products table become interactive without waiting on it.
const AnalyticsRevenueChart = clientOnly(() =>
    import("./AnalyticsRevenueChart").then((m) => ({ default: m.AnalyticsRevenueChart }))
);
const AnalyticsOrderTypesChart = clientOnly(() =>
    import("./AnalyticsOrderTypesChart").then((m) => ({ default: m.AnalyticsOrderTypesChart }))
);
const AnalyticsBusiestHoursChart = clientOnly(() =>
    import("./AnalyticsBusiestHoursChart").then((m) => ({ default: m.AnalyticsBusiestHoursChart }))
);

const chartSkeleton = (
    <Card className="shadow-sm">
        <CardContent className="h-72 animate-pulse bg-muted rounded-md mt-6" />
    </Card>
);

interface AnalyticsDashboardProps {
    businessId: string;
    showTimeFilter?: boolean;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
    businessId,
    showTimeFilter = true,
}) => {
    const { t } = useTranslation("management");
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

    const { myBusinessFullDetails } = useMyBusiness(businessId);
    const currency = getCurrencySymbol(myBusinessFullDetails?.currency);

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
                <p className="text-secondary font-medium">{t("analytics.error_message")}</p>
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
                    <AnalyticsKpiCards sales={data.sales} currency={currency} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnalyticsRevenueChart sales={data.sales} currency={currency} fallback={chartSkeleton} />
                        <AnalyticsOrderTypesChart sales={data.sales} fallback={chartSkeleton} />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <AnalyticsBusiestHoursChart hourlyVisitors={data.hourlyVisitors} fallback={chartSkeleton} />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <AnalyticsTopProductsTable topProducts={data.topProducts} currency={currency} />
                    </div>
                </>
            )}
        </div>
    );
};
