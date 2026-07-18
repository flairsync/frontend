import * as React from "react"
import { useTranslation } from "react-i18next"

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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Building, Building2, ChevronRight, CreditCard, Heart, HelpCircle, LucideNewspaper, Briefcase } from "lucide-react"
import WebsiteLogo from "@/components/shared/WebsiteLogo"

// This is sample data.
const ownerNavData = {
    navMain: [
        {
            titleKey: "hub_sidebar.groups.manage_businesses",
            url: "#",
            items: [
                {
                    key: "overview",
                    titleKey: "hub_sidebar.items.overview",
                    url: "/manage/overview",
                    icon: Building2,
                },
                {
                    key: "joined",
                    titleKey: "hub_sidebar.items.joined",
                    url: "/manage/joined",
                    icon: Heart,
                },
                {
                    key: "owned",
                    titleKey: "hub_sidebar.items.owned",
                    url: "/manage/owned",
                    icon: Building,
                },
                {
                    key: "organizations",
                    titleKey: "hub_sidebar.items.organization",
                    url: "/manage/organizations",
                    icon: Building2,
                    subItems: [
                        {
                            key: "organizations",
                            titleKey: "hub_sidebar.items.organizations",
                            url: "/manage/organizations",
                        },
                        {
                            key: "regions",
                            titleKey: "hub_sidebar.items.regions",
                            url: "/manage/regions",
                        },
                        {
                            key: "requests",
                            titleKey: "hub_sidebar.items.requests",
                            url: "/manage/requests",
                        },
                        {
                            key: "company-guide",
                            titleKey: "hub_sidebar.items.company_guide",
                            url: "/manage/company-guide",
                        },
                    ],
                },
                {
                    key: "billing",
                    titleKey: "hub_sidebar.items.billing",
                    url: "/manage/billing",
                    icon: LucideNewspaper,
                },
                {
                    key: "plans",
                    titleKey: "hub_sidebar.items.plans",
                    url: "/manage/plans",
                    icon: CreditCard,
                },
                {
                    key: "professional-profile",
                    titleKey: "hub_sidebar.items.professional_profile",
                    url: "/manage/professional-profile",
                    icon: Briefcase,
                },
                {
                    key: "help",
                    titleKey: "hub_sidebar.items.help",
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
    const { t } = useTranslation("management");
    const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

    const isExpanded = (key: string, defaultOpen: boolean) => expanded[key] ?? defaultOpen;
    const toggleExpanded = (key: string, defaultOpen: boolean) =>
        setExpanded((prev) => ({ ...prev, [key]: !isExpanded(key, defaultOpen) }));

    return (
        <TooltipProvider delayDuration={300}>
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
                    {ownerNavData.navMain.map((group) => (
                        <SidebarGroup key={group.titleKey}>
                            <SidebarGroupLabel className="truncate">{t(group.titleKey)}</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {group.items.map((item) => {
                                        const hasSubItems = "subItems" in item && !!item.subItems;
                                        const subActive = hasSubItems && item.subItems!.some((sub) => isActiveLink(sub.key));
                                        const parentActive = isActiveLink(item.key) || subActive;
                                        const open = hasSubItems && isExpanded(item.key, subActive);
                                        const label = t(item.titleKey);

                                        return (
                                            <SidebarMenuItem key={item.key} >
                                                {hasSubItems ? (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <SidebarMenuButton
                                                                isActive={parentActive}
                                                                onClick={() => toggleExpanded(item.key, subActive)}
                                                                aria-expanded={open}
                                                            >
                                                                <item.icon />
                                                                <span className="min-w-0 flex-1 truncate text-left">{label}</span>
                                                                <ChevronRight
                                                                    className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
                                                                />
                                                            </SidebarMenuButton>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="right">{label}</TooltipContent>
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <SidebarMenuButton asChild isActive={parentActive} >
                                                                <a href={item.url}>
                                                                    <item.icon />
                                                                    <span className="min-w-0 flex-1 truncate text-left">{label}</span>
                                                                </a>
                                                            </SidebarMenuButton>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="right">{label}</TooltipContent>
                                                    </Tooltip>
                                                )}
                                                {hasSubItems && open && (
                                                    <SidebarMenuSub>
                                                        {item.subItems!.map((subItem) => {
                                                            const subLabel = t(subItem.titleKey);
                                                            return (
                                                                <SidebarMenuSubItem key={subItem.key}>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <SidebarMenuSubButton asChild isActive={isActiveLink(subItem.key)}>
                                                                                <a href={subItem.url}>
                                                                                    <span className="min-w-0 flex-1 truncate text-left">{subLabel}</span>
                                                                                </a>
                                                                            </SidebarMenuSubButton>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="right">{subLabel}</TooltipContent>
                                                                    </Tooltip>
                                                                </SidebarMenuSubItem>
                                                            );
                                                        })}
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
        </TooltipProvider>
    )
}
