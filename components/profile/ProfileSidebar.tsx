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
import { BarChart3, Calendar, CreditCard, Heart, LayoutDashboard, Plug, Settings, ShieldAlert, ShoppingBag, SlidersHorizontal, Star, User, Users, Utensils } from "lucide-react"
import WebsiteLogo from "../shared/WebsiteLogo"

// This is sample data.
const ownerNavData = {
    navMain: [
        {
            title: "Manage your profile",
            url: "#",
            items: [
                {
                    key: "overview",
                    title: "Overview",
                    url: "/profile/overview",
                    icon: User,
                },
                {
                    key: "favorites",

                    title: "Favorites",
                    url: "/profile/favorites",
                    icon: Heart,
                },
                {
                    key: "reviews",

                    title: "Reviews",
                    url: "/profile/reviews",
                    icon: Star,
                },
                {
                    key: "reservations",

                    title: "Reservations",
                    url: "/profile/reservations",
                    icon: Calendar,
                },
                {
                    key: "settings",

                    title: "Settings",
                    url: "/profile/settings",
                    icon: Settings,
                },
                {
                    key: "preferences",

                    title: "Preferences",
                    url: "/profile/preferences",
                    icon: SlidersHorizontal,
                },
                {
                    key: "danger",

                    title: "Danger zone",
                    url: "/profile/danger",
                    icon: ShieldAlert,
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


export function ProfileSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
