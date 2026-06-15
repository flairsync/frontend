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
import { Briefcase, Calendar, Heart, Settings, Star, User, UserCog } from "lucide-react"
import WebsiteLogo from "../shared/WebsiteLogo"

const ownerNavData = {
    navMain: [
        {
            title: "Manage your profile",
            url: "#",
            items: [
                {
                    title: "Overview",
                    url: "/profile/overview",
                    icon: User,
                },
                {
                    title: "Favorites",
                    url: "/profile/favorites",
                    icon: Heart,
                },
                {
                    title: "Reviews",
                    url: "/profile/reviews",
                    icon: Star,
                },
                {
                    title: "Reservations",
                    url: "/profile/reservations",
                    icon: Calendar,
                },
                {
                    title: "Jobs",
                    url: "/profile/jobs",
                    icon: Briefcase,
                },
                {
                    title: "Settings",
                    url: "/profile/settings",
                    icon: Settings,
                },
                {
                    title: "Account",
                    url: "/profile/account",
                    icon: UserCog,
                },
            ],
        },
    ],
}

export function isActiveLink(url: string): boolean {
    if (typeof window === "undefined") return false;
    return window.location.pathname.startsWith(url);
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
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={isActiveLink(item.url)}>
                                            <a href={item.url}>
                                                <item.icon />
                                                {item.title}
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
