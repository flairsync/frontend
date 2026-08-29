import React from "react";
import { navigate } from "vike/client/router";
import { TriangleAlert, ShieldAlert } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAlerts } from "@/features/alerts/useAlerts";
import { AlertCategory } from "@/features/alerts/types";

const getIconForSeverity = (severity: string) => {
    switch (severity) {
        case "critical":
            return <ShieldAlert className="w-5 h-5 text-red-500" />;
        default:
            return <TriangleAlert className="w-5 h-5 text-amber-500" />;
    }
};

type Props = {
    businessId: string;
    filterCategory?: AlertCategory | "all";
};

export const AlertsList = ({ businessId, filterCategory = "all" }: Props) => {
    const { alerts, fetchingAlerts } = useAlerts(businessId);

    if (fetchingAlerts) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading alerts...</div>;
    }

    const filteredAlerts = filterCategory === "all"
        ? alerts
        : alerts.filter((a) => a.category === filterCategory);

    if (filteredAlerts.length === 0) {
        return (
            <div className="bg-background rounded-lg border shadow-sm">
                <EmptyState
                    title="No alerts to show"
                    description="Everything looks good here — you'll see a warning if something needs your attention."
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full bg-background rounded-lg border shadow-sm divide-y">
            {filteredAlerts.map((alert) => (
                <div key={alert.key} className="p-4 flex gap-4">
                    <div className="flex-shrink-0 mt-1">{getIconForSeverity(alert.severity)}</div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground">{alert.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
                        <button
                            type="button"
                            onClick={() => navigate(`/manage/${businessId}/owner${alert.ctaPath}`)}
                            className="mt-2 text-sm text-primary hover:underline"
                        >
                            {alert.ctaLabel} →
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
