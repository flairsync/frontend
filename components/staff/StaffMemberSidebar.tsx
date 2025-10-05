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
                },
                {
                    key: "shifts",
                    title: "My Shifts",
                    url: "/manage/:id/staff/shifts",
                    icon: Calendar,
                },
                {
                    key: "tasks",
                    title: "Tasks & Checklists",
                    url: "/manage/:id/staff/tasks",
                    icon: ClipboardList,
                },
                {
                    key: "orders",
                    title: "Orders",
                    url: "/manage/:id/staff/orders",
                    icon: ShoppingBag,
                },
                {
                    key: "reservations",
                    title: "Reservations",
                    url: "/manage/:id/staff/reservations",
                    icon: ShoppingBag,
                },
                {
                    key: "menu",
                    title: "Menu Lookup",
                    url: "/manage/:id/staff/menu",
                    icon: Utensils,
                },
                {
                    key: "messages",
                    title: "Messages & Announcements",
                    url: "/manage/:id/staff/messages",
                    icon: MessageSquare,
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
    return (
        <Sidebar {...props}
        >
            <SidebarHeader>
                <BusinessSwitcher
                    businesses={[{
                        id: "1",
                        name: "Business 1"
                    }, {
                        id: "2",
                        name: "Business 2"
                    }, {
                        id: "3",
                        name: "Business 3"
                    },]}
                    defaultBusiness={{
                        id: "1",
                        name: "Business 1"
                    }}

                />

            </SidebarHeader>
            <SidebarContent>
                {/* We create a SidebarGroup for each parent. */}
                {staffNavData.navMain.map((item) => (
                    <SidebarGroup key={item.title}>
                        <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {item.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={isActiveLink(item.key)}>
                                            <a href={item.url.replace(":id", props.businessId)}>{item.title}</a>
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
