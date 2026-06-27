import React from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { usePageContext } from "vike-react/usePageContext";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { PinnedLinksWidget } from "@/components/dashboard/PinnedLinksWidget";

const OwnerDashboardPage: React.FC = () => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

            <Separator />

            {businessId ? (
                <>
                    <PinnedLinksWidget businessId={businessId} role="owner" />
                    <AnalyticsDashboard businessId={businessId} showTimeFilter={false} />
                </>
            ) : (
                <div>Loading dashboard...</div>
            )}
        </div>
    );
};

export default OwnerDashboardPage;
