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

export default function StaffSchedulePage() {
    const { t } = useTranslation("management");
    const [activeTab, setActiveTab] = useState("manage");
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get("tab");
            if (tab) setActiveTab(tab);

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
                <h1 className="text-3xl font-bold tracking-tight">{t("staff_schedule_page.title")}</h1>
            </div>

            <Separator />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="w-full flex overflow-x-auto whitespace-nowrap bg-muted/50 p-1">
                    <TabsTrigger value="manage" className="flex-1">{t("schedule_page.tabs.staff_scheduling")}</TabsTrigger>
                    <TabsTrigger value="bids" className="flex-1">{t("schedule_page.tabs.open_shift_bids")}</TabsTrigger>
                    <TabsTrigger value="rules" className="flex-1">{t("schedule_page.tabs.recurring_rules")}</TabsTrigger>
                    <TabsTrigger value="shifts" className="flex-1">{t("schedule_page.tabs.shift_templates")}</TabsTrigger>
                    <TabsTrigger value="time-off" className="flex-1">{t("schedule_page.tabs.time_off")}</TabsTrigger>
                    <TabsTrigger value="swaps" className="flex-1">{t("schedule_page.tabs.swaps")}</TabsTrigger>
                </TabsList>

                <TabsContent value="manage">
                    <ManagerScheduleStaffSchedulingTab />
                </TabsContent>

                <TabsContent value="bids">
                    <ManagerScheduleBidsTab />
                </TabsContent>

                <TabsContent value="rules">
                    <ManagerScheduleRecurringRulesTab />
                </TabsContent>

                <TabsContent value="shifts">
                    <ManagerScheduleShiftsTab />
                </TabsContent>

                <TabsContent value="time-off">
                    <ManagerScheduleTimeOffTab />
                </TabsContent>

                <TabsContent value="swaps">
                    <ManagerScheduleSwapsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
