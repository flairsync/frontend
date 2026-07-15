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
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { BarChart3, Building, Building2, Calendar, ChevronRight, CreditCard, Heart, HelpCircle, Inbox, LayoutDashboard, LucideNewspaper, MapPinned, Plug, Settings, ShieldAlert, ShoppingBag, SlidersHorizontal, Star, User, Users, Utensils, Briefcase } from "lucide-react"
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
                    key: "owned",
                    title: "My businesses",
                    url: "/manage/owned",
                    icon: Building,
                },
                {
                    key: "organizations",
                    title: "Organization",
                    url: "/manage/organizations",
                    icon: Building2,
                    subItems: [
                        {
                            key: "organizations",
                            title: "Organizations",
                            url: "/manage/organizations",
                        },
                        {
                            key: "regions",
                            title: "Regions",
                            url: "/manage/regions",
                        },
                        {
                            key: "requests",
                            title: "Requests",
                            url: "/manage/requests",
                        },
                    ],
                },
                {
                    key: "billing",
                    title: "Billing",
                    url: "/manage/billing",
                    icon: LucideNewspaper,
                },
                {
                    key: "plans",
                    title: "Plans",
                    url: "/manage/plans",
                    icon: CreditCard,
                },
                {
                    key: "professional-profile",
                    title: "Professional Profile",
                    url: "/manage/professional-profile",
                    icon: Briefcase,
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
    return currentPath.includes(`/manage/${key}`);
}


export function BusinessManageHubSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

    const isExpanded = (key: string, defaultOpen: boolean) => expanded[key] ?? defaultOpen;
    const toggleExpanded = (key: string, defaultOpen: boolean) =>
        setExpanded((prev) => ({ ...prev, [key]: !isExpanded(key, defaultOpen) }));

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
                                {item.items.map((item) => {
                                    const hasSubItems = "subItems" in item && !!item.subItems;
                                    const subActive = hasSubItems && item.subItems!.some((sub) => isActiveLink(sub.key));
                                    const parentActive = isActiveLink(item.key) || subActive;
                                    const open = hasSubItems && isExpanded(item.key, subActive);

                                    return (
                                        <SidebarMenuItem key={item.title} >
                                            {hasSubItems ? (
                                                <SidebarMenuButton
                                                    isActive={parentActive}
                                                    onClick={() => toggleExpanded(item.key, subActive)}
                                                    aria-expanded={open}
                                                >
                                                    <item.icon />
                                                    {item.title}
                                                    <ChevronRight
                                                        className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
                                                    />
                                                </SidebarMenuButton>
                                            ) : (
                                                <SidebarMenuButton asChild isActive={parentActive} >
                                                    <a href={item.url}>
                                                        <item.icon />
                                                        {item.title}</a>
                                                </SidebarMenuButton>
                                            )}
                                            {hasSubItems && open && (
                                                <SidebarMenuSub>
                                                    {item.subItems!.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.title}>
                                                            <SidebarMenuSubButton asChild isActive={isActiveLink(subItem.key)}>
                                                                <a href={subItem.url}>{subItem.title}</a>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            )}
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
