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
import { BarChart3, CreditCard, LayoutDashboard, Plug, Settings, ShieldAlert, ShoppingBag, Users, Utensils } from "lucide-react"
import { BusinessSwitcher } from "./BusinessSwitcher"

// This is sample data.
const ownerNavData = {
    navMain: [
        {
            title: "Manage your business",
            url: "#",
            items: [
                {
                    key: "dashboard",
                    title: "Dashboard",
                    url: "/manage/:id/owner/dashboard",
                    icon: LayoutDashboard,
                },
                {
                    key: "settings",

                    title: "Business Settings",
                    url: "/manage/:id/owner/settings",
                    icon: Settings,
                },
                {
                    key: "billing",

                    title: "Billing & Subscription",
                    url: "/manage/:id/owner/billing",
                    icon: CreditCard,
                },
                {
                    key: "staff",

                    title: "Staff Management",
                    url: "/manage/:id/owner/staff",
                    icon: Users,
                },
                {
                    key: "menu",

                    title: "Menu Management",
                    url: "/manage/:id/owner/menu",
                    icon: Utensils,
                },
                {
                    key: "orders",

                    title: "Orders & Reservations",
                    url: "/manage/:id/owner/orders",
                    icon: ShoppingBag,
                },
                {
                    key: "analytics",

                    title: "Analytics & Reports",
                    url: "/manage/:id/owner/analytics",
                    icon: BarChart3,
                },
                /*  {
                     key: "integrations",
 
                     title: "Integrations",
                     url: "/manage/:id/owner/integrations",
                     icon: Plug,
                 }, */
                {
                    key: "danger",

                    title: "Danger Zone",
                    url: "/manage/:id/owner/danger",
                    icon: ShieldAlert,
                },
            ],
        },
    ],
}

export function isActiveLink(key: string): boolean {
    if (typeof window === "undefined") return false; // SSR safety

    const currentPath = window.location.pathname;
    // Example: "/manage/123/owner/staff"

    return currentPath.includes(`/owner/${key}`);
}


export function BusinessOwnerManagementSidebar({ ...props }: React.ComponentProps<typeof Sidebar> & {
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
                {ownerNavData.navMain.map((item) => (
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
