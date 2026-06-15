import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ManagerScheduleShiftsTab from "@/components/management/schedule/ManagerScheduleShiftsTab";
import ManagerScheduleStaffSchedulingTab from "@/components/management/schedule/ManagerScheduleStaffSchedulingTab";
import ManagerScheduleRecurringRulesTab from "@/components/management/schedule/ManagerScheduleRecurringRulesTab";
import ManagerScheduleTimeOffTab from "@/components/management/schedule/ManagerScheduleTimeOffTab";
import ManagerScheduleSwapsTab from "@/components/management/schedule/ManagerScheduleSwapsTab";
import ManagerScheduleBidsTab from "@/components/management/schedule/ManagerScheduleBidsTab";
import { usePageTour } from "@/features/tour/usePageTour";
import type { TourStep } from "@/features/tour/types";

const SCHEDULE_TOUR_STEPS: TourStep[] = [
    {
        target: '[data-tour="schedule-tab-manage"]',
        title: 'Staff Scheduling',
        description: 'The main scheduling view. Assign shifts to staff, view the weekly calendar, and manage who is working when across your whole team.',
        position: 'bottom',
    },
    {
        target: '[data-tour="schedule-tab-bids"]',
        title: 'Open Shift Bids',
        description: 'Post open shifts that staff can bid on. Review bids and approve the best candidate — great for filling gaps without manual assignment.',
        position: 'bottom',
    },
    {
        target: '[data-tour="schedule-tab-rules"]',
        title: 'Recurring Rules',
        description: 'Define repeating schedule patterns so shifts are auto-generated each week. Reduces manual scheduling for predictable rosters.',
        position: 'bottom',
    },
    {
        target: '[data-tour="schedule-tab-shifts"]',
        title: 'Shift Templates',
        description: 'Create reusable shift templates (e.g. "Morning 8–4", "Evening 5–11") that can be quickly applied when building the schedule.',
        position: 'bottom',
    },
    {
        target: '[data-tour="schedule-tab-time-off"]',
        title: 'Time Off',
        description: 'Review and approve time-off requests from your staff. Approved requests are automatically blocked out in the schedule.',
        position: 'bottom',
    },
    {
        target: '[data-tour="schedule-tab-swaps"]',
        title: 'Swaps',
        description: 'Staff can request to swap shifts with each other. Review pending swap requests here and approve or reject them.',
        position: 'bottom',
    },
]

export default function OwnerManageSchedulesPage() {
    usePageTour(SCHEDULE_TOUR_STEPS);

    const [activeTab, setActiveTab] = useState("manage");
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get("tab");
            if (tab) setActiveTab(tab);

            // Cleanup non-schedule parameters
            const allowedParams = ["tab", "date", "view", "staffId"];
            let changed = false;
            for (const key of Array.from(params.keys())) {
                if (!allowedParams.includes(key)) {
                    params.delete(key);
                    changed = true;
                }
            }
            if (changed) {
                const url = new URL(window.location.href);
                url.search = params.toString();
                window.history.replaceState({}, "", url.toString());
            }
            setIsInitialized(true);
        }
    }, []);

    useEffect(() => {
        if (isInitialized && typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("tab", activeTab);
            window.history.replaceState({}, "", url.toString());
        }
    }, [activeTab, isInitialized]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Schedule Management</h1>
            </div>

            <Separator />

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="w-full flex overflow-x-auto whitespace-nowrap bg-muted/50 p-1">
                        <TabsTrigger data-tour="schedule-tab-manage" value="manage" className="flex-1">Staff Scheduling</TabsTrigger>
                        <TabsTrigger data-tour="schedule-tab-bids" value="bids" className="flex-1">Open Shift Bids</TabsTrigger>
                        <TabsTrigger data-tour="schedule-tab-rules" value="rules" className="flex-1">Recurring Rules</TabsTrigger>
                        <TabsTrigger data-tour="schedule-tab-shifts" value="shifts" className="flex-1">Shift Templates</TabsTrigger>
                        <TabsTrigger data-tour="schedule-tab-time-off" value="time-off" className="flex-1">Time Off</TabsTrigger>
                        <TabsTrigger data-tour="schedule-tab-swaps" value="swaps" className="flex-1">Swaps</TabsTrigger>
                    </TabsList>

                    {/* Manage Staff Scheduling */}
                    <TabsContent value="manage">
                        <ManagerScheduleStaffSchedulingTab />
                    </TabsContent>

                    {/* Shift Bids */}
                    <TabsContent value="bids">
                        <ManagerScheduleBidsTab />
                    </TabsContent>

                    {/* Recurring Rules */}
                    <TabsContent value="rules">
                        <ManagerScheduleRecurringRulesTab />
                    </TabsContent>

                    {/* Shifts overview */}
                    <TabsContent value="shifts">
                        <ManagerScheduleShiftsTab />
                    </TabsContent>

                    {/* Time Off Requests */}
                    <TabsContent value="time-off">
                        <ManagerScheduleTimeOffTab />
                    </TabsContent>

                    {/* Shift Swaps */}
                    <TabsContent value="swaps">
                        <ManagerScheduleSwapsTab />
                    </TabsContent>
                </Tabs>
        </div>
    );
}

