import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManagerScheduleShiftsTab from "@/components/management/schedule/ManagerScheduleShiftsTab";
import ManagerScheduleStaffSchedulingTab from "@/components/management/schedule/ManagerScheduleStaffSchedulingTab";
import ManagerScheduleRecurringRulesTab from "@/components/management/schedule/ManagerScheduleRecurringRulesTab";
import ManagerScheduleTimeOffTab from "@/components/management/schedule/ManagerScheduleTimeOffTab";
import ManagerScheduleSwapsTab from "@/components/management/schedule/ManagerScheduleSwapsTab";

export default function OwnerManageSchedulesPage() {
    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-slate-900">Schedule Management</h1>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="manage" className="space-y-6">
                    <TabsList className="w-full flex overflow-x-auto whitespace-nowrap bg-muted/50 p-1">
                        <TabsTrigger value="manage" className="flex-1">Staff Scheduling</TabsTrigger>
                        <TabsTrigger value="rules" className="flex-1">Recurring Rules</TabsTrigger>
                        <TabsTrigger value="shifts" className="flex-1">Shift Templates</TabsTrigger>
                        <TabsTrigger value="time-off" className="flex-1">Time Off</TabsTrigger>
                        <TabsTrigger value="swaps" className="flex-1">Swaps</TabsTrigger>
                    </TabsList>

                    {/* Manage Staff Scheduling */}
                    <TabsContent value="manage">
                        <ManagerScheduleStaffSchedulingTab />
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
        </main>
    );
}

