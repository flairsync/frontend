import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ManagerScheduleShiftsTab from "@/components/management/schedule/ManagerScheduleShiftsTab";
import ManagerScheduleStaffSchedulingTab from "@/components/management/schedule/ManagerScheduleStaffSchedulingTab";
import ManagerScheduleRecurringRulesTab from "@/components/management/schedule/ManagerScheduleRecurringRulesTab";
import ManagerScheduleTimeOffTab from "@/components/management/schedule/ManagerScheduleTimeOffTab";
import ManagerScheduleSwapsTab from "@/components/management/schedule/ManagerScheduleSwapsTab";
import ManagerScheduleBidsTab from "@/components/management/schedule/ManagerScheduleBidsTab";
import ScheduleWorkflowGuide from "@/components/management/schedule/ScheduleWorkflowGuide";
import { usePageTour } from "@/features/tour/usePageTour";
import type { TourStep } from "@/features/tour/types";
import { useParamFromAction } from "@/features/navigation/actionBus";

// Ordered the way you'd actually set scheduling up, not the order the tabs were built in.
const SCHEDULE_TOUR_STEPS: TourStep[] = [
    {
        target: '[data-tour="schedule-tab-manage"]',
        title: 'The Rota',
        description: 'Where the week is actually built. Right-click any cell to add one shift, use Add shifts for a person or a whole team at once, then Publish to make it visible to staff.',
        position: 'bottom',
    },
    {
        target: '[data-tour="schedule-tab-rules"]',
        title: 'Recurring Rules',
        description: 'A standing pattern for one person: "Amina works Mondays 09:00–17:00". Rules never create shifts by themselves — the Generate button on the Rota turns them into draft shifts for the week you are looking at.',
        position: 'bottom',
    },
    {
        target: '[data-tour="schedule-tab-shifts"]',
        title: 'Shift Presets',
        description: 'Just saved start/end times, e.g. "Morning 08:00–16:00". Pick one instead of retyping the hours when you add a shift, set up a recurring rule, or bulk-schedule. A preset on its own schedules nobody.',
        position: 'bottom',
    },
    {
        target: '[data-tour="schedule-tab-bids"]',
        title: 'Open Shift Bids',
        description: 'Post a shift with nobody assigned and let staff bid for it. Review the bids here and approve one — good for filling gaps without chasing people.',
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
    const { t } = useTranslation("management");
    usePageTour(SCHEDULE_TOUR_STEPS);

    const [activeTab, setActiveTab] = useState("manage");
    const [isInitialized, setIsInitialized] = useState(false);
    // Easy View's action bar publishes the tab in place rather than navigating.
    useParamFromAction("tab", (tab) => setActiveTab(tab));

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get("tab");
            if (tab) setActiveTab(tab);

            // Cleanup non-schedule parameters
            // "action" is the Easy View deep link (see useActionParam); it is
            // consumed and removed by whichever child handles it, so it must
            // survive this cleanup rather than being stripped on arrival.
            const allowedParams = ["tab", "date", "view", "staffId", "action"];
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
                <h1 className="text-3xl font-bold tracking-tight">{t("schedule_page.title")}</h1>
            </div>

            <Separator />

            <ScheduleWorkflowGuide onJumpToTab={setActiveTab} />

            {/* Tabs — ordered by the workflow (build → automate → requests), not by build date.
                The `value`s are a deep-link contract: Easy View's action bar and the tour both
                address these tabs by name, so they must not be renamed. */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="w-full flex justify-start overflow-x-auto whitespace-nowrap bg-muted/50 p-1">
                        <TabsTrigger data-tour="schedule-tab-manage" value="manage" className="flex-1">{t("schedule_page.tabs.staff_scheduling")}</TabsTrigger>
                        <TabsTrigger data-tour="schedule-tab-rules" value="rules" className="flex-1">{t("schedule_page.tabs.recurring_rules")}</TabsTrigger>
                        <TabsTrigger data-tour="schedule-tab-shifts" value="shifts" className="flex-1">{t("schedule_page.tabs.shift_presets")}</TabsTrigger>
                        <TabsTrigger data-tour="schedule-tab-bids" value="bids" className="flex-1">{t("schedule_page.tabs.open_shift_bids")}</TabsTrigger>
                        <TabsTrigger data-tour="schedule-tab-time-off" value="time-off" className="flex-1">{t("schedule_page.tabs.time_off")}</TabsTrigger>
                        <TabsTrigger data-tour="schedule-tab-swaps" value="swaps" className="flex-1">{t("schedule_page.tabs.swaps")}</TabsTrigger>
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

