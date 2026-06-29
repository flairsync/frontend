import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StaffSection from "./StaffSection";
import RolesSection from "./RolesSection";
import InvitationsSection from "./InvitationsSection";
import TeamsSection from "@/components/management/staff/teams/TeamsSection";
import MessagesSection from "./MessagesSection";
import { usePageTour } from "@/features/tour/usePageTour";
import type { TourStep } from "@/features/tour/types";

const STAFF_TOUR_STEPS: TourStep[] = [
    {
        target: '[data-tour="staff-tab-staff"]',
        title: 'Staff Management',
        description: 'View all active employees, manage their assigned roles, set hourly rates, schedule individual shifts, and configure per-staff settings like their POS PIN.',
        position: 'bottom',
    },
    {
        target: '[data-tour="staff-tab-invitations"]',
        title: 'Staff Invitations',
        description: 'Invite new team members to join your restaurant. Track pending, accepted, and expired invitations and resend them as needed.',
        position: 'bottom',
    },
    {
        target: '[data-tour="staff-tab-roles"]',
        title: 'Roles Management',
        description: 'Create and manage roles that define what each staff member can do. Assign granular permissions (read, create, update, delete) per feature area.',
        position: 'bottom',
    },
    {
        target: '[data-tour="staff-tab-teams"]',
        title: 'Teams Management',
        description: 'Organise staff into teams for easier scheduling and communication. Assign team leads and manage team rosters from here.',
        position: 'bottom',
    },
    {
        target: '[data-tour="staff-tab-messages"]',
        title: 'Messages & Announcements',
        description: 'Send announcements or direct messages to all staff, a specific team, or individual employees, and track who has read them.',
        position: 'bottom',
    },
]

const VALID_TABS = ["staff", "invitations", "roles", "teams", "messages"] as const;
type TabValue = typeof VALID_TABS[number];

const OwnerStaffManagementPage: React.FC = () => {
    usePageTour(STAFF_TOUR_STEPS);
    const { t } = useTranslation("management");

    const [activeTab, setActiveTab] = useState<TabValue>("staff");
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get("tab") as TabValue | null;
            if (tab && VALID_TABS.includes(tab)) setActiveTab(tab);
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
            <h1 className="text-3xl font-bold tracking-tight">{t("staff_management_page.heading")}</h1>

            <Separator />

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="space-y-6">
                <TabsList className="flex flex-wrap sm:flex-nowrap gap-2 overflow-x-auto scrollbar-none">
                    <TabsTrigger data-tour="staff-tab-staff" value="staff" className="flex-1 sm:flex-none min-w-[120px] text-center">
                        {t("staff_management_page.owner_tabs.staff")}
                    </TabsTrigger>
                    <TabsTrigger data-tour="staff-tab-invitations" value="invitations" className="flex-1 sm:flex-none min-w-[120px] text-center">
                        {t("staff_management_page.owner_tabs.invitations")}
                    </TabsTrigger>
                    <TabsTrigger data-tour="staff-tab-roles" value="roles" className="flex-1 sm:flex-none min-w-[120px] text-center">
                        {t("staff_management_page.owner_tabs.roles")}
                    </TabsTrigger>
                    <TabsTrigger data-tour="staff-tab-teams" value="teams" className="flex-1 sm:flex-none min-w-[120px] text-center">
                        {t("staff_management_page.owner_tabs.teams")}
                    </TabsTrigger>
                    <TabsTrigger data-tour="staff-tab-messages" value="messages" className="flex-1 sm:flex-none min-w-[120px] text-center">
                        {t("staff_management_page.owner_tabs.messages")}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="staff" className="space-y-6">
                    <StaffSection />
                </TabsContent>

                <TabsContent value="invitations" className="space-y-6">
                    <InvitationsSection />
                </TabsContent>

                <TabsContent value="roles" className="space-y-6">
                    <RolesSection />
                </TabsContent>

                <TabsContent value="teams" className="space-y-6">
                    <TeamsSection />
                </TabsContent>

                <TabsContent value="messages" className="space-y-6">
                    <MessagesSection />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default OwnerStaffManagementPage;
