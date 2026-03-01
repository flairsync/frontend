import * as React from "react"

import { SearchForm } from "@/components/search-form"
import { VersionSwitcher } from "@/components/version-switcher"
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
import { BarChart3, Calendar, ClipboardList, CreditCard, LayoutDashboard, MessageSquare, Plug, Settings, ShieldAlert, ShoppingBag, User, Users, Utensils } from "lucide-react"
import { BusinessSwitcher } from "../management/BusinessSwitcher"
import { usePermissions } from "@/features/auth/usePermissions"

// This is sample data.
const staffNavData = {
    navMain: [
        {
            title: "Your Workspace",
            url: "#",
            items: [
                {
                    key: "dashboard",
                    title: "Dashboard",
                    url: "/manage/:id/staff/dashboard",
                    icon: LayoutDashboard,
                    requiredPermission: "BUSINESS_SETTINGS",
                    requiredAction: "read",
                },
                {
                    key: "shifts",
                    title: "My Shifts",
                    url: "/manage/:id/staff/shifts",
                    icon: Calendar,
                    requiredPermission: "STAFF",
                    requiredAction: "read",
                },
                {
                    key: "tasks",
                    title: "Tasks & Checklists",
                    url: "/manage/:id/staff/tasks",
                    icon: ClipboardList,
                    requiredPermission: "STAFF",
                    requiredAction: "read",
                },
                {
                    key: "orders",
                    title: "Orders",
                    url: "/manage/:id/staff/orders",
                    icon: ShoppingBag,
                    requiredPermission: "ORDERS",
                    requiredAction: "read",
                },
                {
                    key: "reservations",
                    title: "Reservations",
                    url: "/manage/:id/staff/reservations",
                    icon: ShoppingBag,
                    requiredPermission: "RESERVATIONS",
                    requiredAction: "read",
                },
                {
                    key: "menu",
                    title: "Menu Lookup",
                    url: "/manage/:id/staff/menu",
                    icon: Utensils,
                    requiredPermission: "MENU",
                    requiredAction: "read",
                },
                {
                    key: "messages",
                    title: "Messages & Announcements",
                    url: "/manage/:id/staff/messages",
                    icon: MessageSquare,
                    requiredPermission: "BUSINESS_SETTINGS",
                    requiredAction: "read",
                },
                {
                    key: "profile",
                    title: "My Profile",
                    url: "/manage/:id/staff/profile",
                    icon: User,
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


export function StaffMemberSidebar({ ...props }: React.ComponentProps<typeof Sidebar> & {
    businessId: string
}) {
    const { hasPermission, isLoading: loadingPermissions } = usePermissions(props.businessId);

    return (
        <Sidebar {...props}
        >
            <SidebarHeader>
                <BusinessSwitcher
                    businesses={[{
                        id: props.businessId,
                        name: "Current Business"
                    }]}
                    selectedBusiness={props.businessId}
                />
            </SidebarHeader>
            <SidebarContent>
                {/* We create a SidebarGroup for each parent. */}
                {staffNavData.navMain.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
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
                                                <a href={item.url.replace(":id", props.businessId)}>
                                                    <item.icon className="h-4 w-4" />
                                                    <span>{item.title}</span>
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
