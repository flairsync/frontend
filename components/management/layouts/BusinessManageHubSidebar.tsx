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
import { BarChart3, Building, Building2, Calendar, CreditCard, Heart, HelpCircle, LayoutDashboard, LucideNewspaper, Plug, Settings, ShieldAlert, ShoppingBag, SlidersHorizontal, Star, User, Users, Utensils } from "lucide-react"
import WebsiteLogo from "@/components/shared/WebsiteLogo"

// This is sample data.
const ownerNavData = {
    navMain: [
        {
            title: "Manage your businesses",
            url: "#",
            items: [
                {
                    key: "overview",
                    title: "Overview",
                    url: "/manage/overview",
                    icon: Building2,
                },
                {
                    key: "joined",
                    title: "Joined",
                    url: "/manage/joined",
                    icon: Heart,
                },
                {
                    key: "my_business",

                    title: "My businesses",
                    url: "/manage/owned",
                    icon: Building,
                },
                {
                    key: "billing",

                    title: "Billing",
                    url: "/manage/billing",
                    icon: LucideNewspaper,
                },
                {
                    key: "help",
                    title: "Help",
                    url: "/manage/help",
                    icon: HelpCircle,
                },
            ],
        },
    ],
}

export function isActiveLink(key: string): boolean {
    if (typeof window === "undefined") return false; // SSR safety
    const currentPath = window.location.pathname;
    return currentPath.includes(`/profile/${key}`);
}


export function BusinessManageHubSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar {...props}
        >
            <SidebarHeader>
                <a
                    href="/feed"
                >
                    <WebsiteLogo />
                </a>
            </SidebarHeader>
            <SidebarContent>
                {/* We create a SidebarGroup for each parent. */}
                {ownerNavData.navMain.map((item) => (
                    <SidebarGroup key={item.title}>
                        <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {item.items.map((item) => (
                                    <SidebarMenuItem key={item.title} >
                                        <SidebarMenuButton asChild isActive={isActiveLink(item.key)} >
                                            <a href={item.url}>
                                                <item.icon />
                                                {item.title}</a>
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
