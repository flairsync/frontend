import React from "react";
import { Separator } from "@/components/ui/separator";
import { usePageContext } from "vike-react/usePageContext";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

const OwnerAnalyticsPage: React.FC = () => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
                    Analytics & Reports
                </h1>

                <Separator />

                {businessId ? (
                    <AnalyticsDashboard businessId={businessId} showTimeFilter={true} />
                ) : (
                    <div>Loading analytics...</div>
                )}
            </div>
        </div>
    );
};

export default OwnerAnalyticsPage;
