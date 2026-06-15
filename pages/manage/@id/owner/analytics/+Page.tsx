import React from "react";
import { Separator } from "@/components/ui/separator";
import { usePageContext } from "vike-react/usePageContext";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

const OwnerAnalyticsPage: React.FC = () => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>

            <Separator />

            {businessId ? (
                <AnalyticsDashboard businessId={businessId} showTimeFilter={true} />
            ) : (
                <div>Loading analytics...</div>
            )}
        </div>
    );
};

export default OwnerAnalyticsPage;
