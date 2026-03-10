import React from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { usePageContext } from "vike-react/usePageContext";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

const OwnerDashboardPage: React.FC = () => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
                        Dashboard
                    </h1>
                    {/* <Button>Generate Report</Button> */}
                </div>

                <Separator />

                {businessId ? (
                    <AnalyticsDashboard businessId={businessId} showTimeFilter={false} />
                ) : (
                    <div>Loading dashboard...</div>
                )}
            </div>
        </div>
    );
};

export default OwnerDashboardPage;
