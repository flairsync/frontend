import * as React from "react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { Calendar, ClipboardList, LayoutDashboard, MessageSquare, PackageOpen, ShoppingBag, Users, Utensils } from "lucide-react"
import { BusinessSwitcher } from "../management/BusinessSwitcher"
import { usePermissions } from "@/features/auth/usePermissions"
import { useTranslation } from "react-i18next"

// This is sample data.
export const staffNavData = {
    navMain: [
        {
            titleKey: "staff_sidebar.workspace_group",
            url: "#",
            items: [
                {
                    key: "dashboard",
                    titleKey: "staff_sidebar.items.dashboard",
                    url: "/manage/:id/staff/dashboard",
                    icon: LayoutDashboard,
                },
                {
                    key: "shifts",
                    titleKey: "staff_sidebar.items.my_shifts",
                    url: "/manage/:id/staff/shifts",
                    icon: Calendar,
                },
                {
                    key: "schedule",
                    titleKey: "staff_sidebar.items.schedule",
                    url: "/manage/:id/staff/schedule",
                    icon: Calendar,
                    requiredPermission: "STAFF",
                    requiredAction: "read",
                },
                {
                    key: "staff",
                    titleKey: "staff_sidebar.items.staff",
                    url: "/manage/:id/staff/staff",
                    icon: Users,
                    requiredPermission: "STAFF",
                    requiredAction: "read",
                },
                {
                    key: "tasks",
                    titleKey: "staff_sidebar.items.tasks",
                    url: "/manage/:id/staff/tasks",
                    icon: ClipboardList,
                    requiredPermission: "STAFF",
                    requiredAction: "read",
                },
                {
                    key: "orders",
                    titleKey: "staff_sidebar.items.orders",
                    url: "/manage/:id/staff/orders",
                    icon: ShoppingBag,
                    requiredPermission: "ORDERS",
                    requiredAction: "read",
                },
                {
                    key: "reservations",
                    titleKey: "staff_sidebar.items.reservations",
                    url: "/manage/:id/staff/reservations",
                    icon: ShoppingBag,
                    requiredPermission: "RESERVATIONS",
                    requiredAction: "read",
                },
                {
                    key: "inventory",
                    titleKey: "staff_sidebar.items.inventory",
                    url: "/manage/:id/staff/inventory",
                    icon: PackageOpen,
                    requiredPermission: "INVENTORY",
                    requiredAction: "read",
                },
                {
                    key: "menu",
                    titleKey: "staff_sidebar.items.menu",
                    url: "/manage/:id/staff/menu",
                    icon: Utensils,
                    requiredPermission: "MENU",
                    requiredAction: "read",
                },
                {
                    key: "messages",
                    titleKey: "staff_sidebar.items.messages",
                    url: "/manage/:id/staff/messages",
                    icon: MessageSquare,
                    requiredPermission: "BUSINESS_SETTINGS",
                    requiredAction: "read",
                },
            ],
        },
    ],
}


export function isActiveLink(key: string): boolean {
    if (typeof window === "undefined") return false; // SSR safety

    const currentPath = window.location.pathname;
    // Example: "/manage/123/owner/staff"

    return currentPath.includes(`/staff/${key}`);
}


export function StaffMemberSidebar({ businessId, ...props }: React.ComponentProps<typeof Sidebar> & {
    businessId: string
}) {
    const { hasPermission, isLoading: loadingPermissions } = usePermissions(businessId);
    const { t } = useTranslation("management");

    return (
        <Sidebar {...props}
        >
            <SidebarHeader>
                <BusinessSwitcher
                    businesses={[{
                        id: businessId,
                        name: t("staff_sidebar.current_business_fallback")
                    }]}
                    selectedBusiness={businessId}
                />
            </SidebarHeader>
            <SidebarContent>
                {/* We create a SidebarGroup for each parent. */}
                {staffNavData.navMain.map((group) => (
                    <SidebarGroup key={group.titleKey}>
                        <SidebarGroupLabel>{t(group.titleKey)}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items
                                    .filter(item => {
                                        if (!(item as any).requiredPermission) return true;
                                        if (loadingPermissions) return false;
                                        return hasPermission((item as any).requiredPermission as any, (item as any).requiredAction as any);
                                    })
                                    .map((item) => (
                                        <SidebarMenuItem key={item.key}>
                                            <SidebarMenuButton asChild isActive={isActiveLink(item.key)}>
                                                <a href={item.url.replace(":id", businessId)}>
                                                    <item.icon className="h-4 w-4" />
                                                    <span>{t(item.titleKey)}</span>
                                                </a>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
