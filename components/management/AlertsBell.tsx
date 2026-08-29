import React from "react";
import { navigate } from "vike/client/router";
import { TriangleAlert, ChevronRight } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useAlerts } from "@/features/alerts/useAlerts";

type Props = {
    businessId: string;
};

export function AlertsBell({ businessId }: Props) {
    const { alerts, alertCount } = useAlerts(businessId);

    if (alertCount === 0) return null;

    const handleViewAll = () => navigate(`/manage/${businessId}/owner/alerts`);

    const handleFixNow = (ctaPath: string) => navigate(`/manage/${businessId}/owner${ctaPath}`);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors flex items-center justify-center"
                >
                    <TriangleAlert className="w-5 h-5 text-amber-600" />
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-amber-600 rounded-full border-2 border-background transform translate-x-1/4 -translate-y-1/4">
                        {alertCount > 99 ? "99+" : alertCount}
                    </span>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 max-w-[90vw] p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">Alerts & Warnings</h4>
                </div>

                <div className="max-h-[300px] overflow-y-auto flex flex-col divide-y">
                    {alerts.map((alert) => (
                        <div key={alert.key} className="p-3 flex gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                <TriangleAlert className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{alert.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                    {alert.message}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleFixNow(alert.ctaPath)}
                                    className="text-xs text-primary hover:underline mt-1"
                                >
                                    {alert.ctaLabel}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-2 border-t text-center">
                    <button
                        type="button"
                        onClick={handleViewAll}
                        className="text-xs text-primary hover:underline flex items-center justify-center w-full gap-1 py-1"
                    >
                        View all alerts <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
