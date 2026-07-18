import * as React from "react"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    BarChart3,
    CalendarCheck,
    Images,
    LayoutDashboard,
    PackageOpen,
    Settings,
    ShieldAlert,
    ShoppingBag,
    ClockFadingIcon,
    Utensils,
    Users,
    ScrollText,
    Star,
    Banknote,
    MonitorSmartphone,
    ChefHat,
    Briefcase,
    LayoutGrid,
    ClipboardList,
    Tablet,
    Store,
    Megaphone,
    Globe,
    HandCoins,
    Tag,
    Network,
} from "lucide-react"
import { BusinessSwitcher } from "./BusinessSwitcher"
import { SidebarPinToggle } from "./SidebarPinToggle"
import { useMyBusinesses } from "@/features/business/useMyBusinesses"
import {
    MAX_PINNED_LINKS,
} from "@/features/dashboard/pinnedLinks/pinnableItems"
import {
    useAddPinnedLink,
    usePinnedLinks,
    useRemovePinnedLink,
} from "@/features/dashboard/pinnedLinks/usePinnedLinks"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

// ─── Nav structure ────────────────────────────────────────────────────────────

const STATION_OPTIONS = [
    {
        key: "pos",
        labelKey: "sidebar.station_pos_label",
        tooltipKey: "sidebar.station_pos_tooltip",
        url: "/station/pos",
        icon: MonitorSmartphone,
    },
    {
        key: "kds",
        labelKey: "sidebar.station_kds_label",
        tooltipKey: "sidebar.station_kds_tooltip",
        url: "/station/kds",
        icon: ChefHat,
    },
] as const

export interface NavItem {
    key: string
    titleKey: string
    url: string
    icon: React.ElementType
}

interface NavGroup {
    titleKey: string
    icon: React.ElementType
    items: NavItem[]
}

export const OVERVIEW_ITEM: NavItem = {
    key: "dashboard",
    titleKey: "sidebar.items.dashboard",
    url: "/manage/:id/owner/dashboard",
    icon: LayoutDashboard,
}

export const NAV_GROUPS: NavGroup[] = [
    {
        titleKey: "sidebar.groups.business",
        icon: Settings,
        items: [
            { key: "branding", titleKey: "sidebar.items.branding", url: "/manage/:id/owner/branding", icon: Images },
            { key: "settings", titleKey: "sidebar.items.settings", url: "/manage/:id/owner/settings", icon: Settings },
            { key: "company-guide", titleKey: "sidebar.items.company_guide", url: "/manage/:id/owner/company-guide", icon: Network },
        ],
    },
    {
        titleKey: "sidebar.groups.team_workforce",
        icon: Users,
        items: [
            { key: "staff", titleKey: "sidebar.items.staff", url: "/manage/:id/owner/staff", icon: Users },
            { key: "announcements", titleKey: "sidebar.items.announcements", url: "/manage/:id/owner/announcements", icon: Megaphone },
            { key: "schedule", titleKey: "sidebar.items.schedule", url: "/manage/:id/owner/schedule", icon: CalendarCheck },
            { key: "attendance", titleKey: "sidebar.items.attendance", url: "/manage/:id/owner/attendance", icon: ClockFadingIcon },
            { key: "payroll", titleKey: "sidebar.items.payroll", url: "/manage/:id/owner/payroll", icon: Banknote },
            { key: "tip-pooling", titleKey: "sidebar.items.tip_pooling", url: "/manage/:id/owner/tip-pooling", icon: HandCoins },
            { key: "jobs", titleKey: "sidebar.items.jobs", url: "/manage/:id/owner/jobs", icon: Briefcase },
        ],
    },
    {
        titleKey: "sidebar.groups.operations",
        icon: LayoutGrid,
        items: [
            { key: "inventory", titleKey: "sidebar.items.inventory", url: "/manage/:id/owner/inventory", icon: PackageOpen },
            { key: "marketplace", titleKey: "sidebar.items.marketplace", url: "/manage/:id/owner/marketplace", icon: Store },
            { key: "menu", titleKey: "sidebar.items.menu", url: "/manage/:id/owner/menu", icon: Utensils },
            { key: "discounts", titleKey: "sidebar.items.discounts", url: "/manage/:id/owner/discounts", icon: Tag },
            { key: "floor-plan", titleKey: "sidebar.items.floor_plan", url: "/manage/:id/owner/floor-plan", icon: LayoutDashboard },
            { key: "website", titleKey: "sidebar.items.website", url: "/manage/:id/owner/website", icon: Globe },
            { key: "orders", titleKey: "sidebar.items.orders", url: "/manage/:id/owner/orders", icon: ShoppingBag },
            { key: "reservations", titleKey: "sidebar.items.reservations", url: "/manage/:id/owner/reservations", icon: CalendarCheck },
            { key: "tasks", titleKey: "sidebar.items.tasks", url: "/manage/:id/owner/tasks", icon: ClipboardList },
            { key: "stations", titleKey: "sidebar.items.stations", url: "/manage/:id/owner/stations", icon: Tablet },
        ],
    },
    {
        titleKey: "sidebar.groups.insights",
        icon: BarChart3,
        items: [
            { key: "analytics", titleKey: "sidebar.items.analytics", url: "/manage/:id/owner/analytics", icon: BarChart3 },
            { key: "reviews", titleKey: "sidebar.items.reviews", url: "/manage/:id/owner/reviews", icon: Star },
        ],
    },
    {
        titleKey: "sidebar.groups.system",
        icon: ScrollText,
        items: [
            { key: "audit-logs", titleKey: "sidebar.items.audit_logs", url: "/manage/:id/owner/audit-logs", icon: ScrollText },
            { key: "danger", titleKey: "sidebar.items.danger", url: "/manage/:id/owner/danger", icon: ShieldAlert },
        ],
    },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function isActiveLink(key: string): boolean {
    if (typeof window === "undefined") return false
    return window.location.pathname.includes(`/owner/${key}`)
}

function groupHasActiveItem(group: NavGroup): boolean {
    return group.items.some((item) => isActiveLink(item.key))
}

// ─── Collapsible group ────────────────────────────────────────────────────────

function CollapsibleNavGroup({
    group,
    businessId,
    defaultOpen,
    pinnedPaths,
    atMax,
    onTogglePin,
}: {
    group: NavGroup
    businessId: string
    defaultOpen: boolean
    pinnedPaths: Set<string>
    atMax: boolean
    onTogglePin: (path: string) => void
}) {
    const [open, setOpen] = useState(defaultOpen)
    const { t } = useTranslation("management")

    return (
        <SidebarGroup className="py-0">
            {/* Trigger */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between px-2 py-2 rounded-md text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
                <span className="flex items-center gap-2">
                    <group.icon className="h-3.5 w-3.5" />
                    {t(group.titleKey)}
                </span>
                <ChevronDown
                    className={cn(
                        "h-3.5 w-3.5 transition-transform duration-200",
                        open ? "rotate-0" : "-rotate-90"
                    )}
                />
            </button>

            {/* Animated content */}
            <div
                className={cn(
                    "grid transition-[grid-template-rows] duration-200 ease-in-out",
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
            >
                <div className="overflow-hidden">
                    <SidebarGroupContent className="pt-1 pb-2">
                        <SidebarMenu>
                            {group.items.map((item) => {
                                const path = `owner/${item.key}`
                                return (
                                    <SidebarMenuItem key={item.key}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActiveLink(item.key)}
                                            className="pl-7"
                                        >
                                            <a href={item.url.replace(":id", businessId)}>
                                                <item.icon />
                                                {t(item.titleKey)}
                                            </a>
                                        </SidebarMenuButton>
                                        <SidebarPinToggle
                                            pinned={pinnedPaths.has(path)}
                                            atMax={atMax}
                                            onToggle={() => onTogglePin(path)}
                                        />
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </div>
            </div>
        </SidebarGroup>
    )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function BusinessOwnerManagementSidebar({
    businessId,
    ...props
}: React.ComponentProps<typeof Sidebar> & { businessId: string }) {
    const { myBusinesses } = useMyBusinesses()
    const { t } = useTranslation("management")

    const businesses = myBusinesses?.map((b) => ({ id: b.id, name: b.name })) ?? []

    const { pinnedLinks } = usePinnedLinks(businessId)
    const { addPinnedLink } = useAddPinnedLink(businessId)
    const { removePinnedLink } = useRemovePinnedLink(businessId)
    const pinnedByPath = new Map(pinnedLinks.map((p) => [p.path, p.id]))
    const atMax = pinnedLinks.length >= MAX_PINNED_LINKS
    const togglePin = (path: string) => {
        const pinId = pinnedByPath.get(path)
        if (pinId) removePinnedLink(pinId)
        else addPinnedLink(path)
    }

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <BusinessSwitcher businesses={businesses} selectedBusiness={businessId} />
            </SidebarHeader>

            <SidebarContent className="gap-0">
                {/* Launch Station — dropdown for POS / KDS */}
                <SidebarGroup className="pb-2 border-b border-sidebar-border mb-1">
                    <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                        {t("sidebar.pos_section_label")}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <SidebarMenuButton className="font-semibold text-primary">
                                            <MonitorSmartphone />
                                            {t("sidebar.launch_station")}
                                            <ChevronDown className="ml-auto h-3.5 w-3.5" />
                                        </SidebarMenuButton>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="right" align="start" className="w-44">
                                        <TooltipProvider>
                                            {STATION_OPTIONS.map((opt) => (
                                                <Tooltip key={opt.key}>
                                                    <TooltipTrigger asChild>
                                                        <DropdownMenuItem asChild>
                                                            <a
                                                                href={opt.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2"
                                                            >
                                                                <opt.icon className="h-4 w-4" />
                                                                {t(opt.labelKey)}
                                                            </a>
                                                        </DropdownMenuItem>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right">
                                                        {t(opt.tooltipKey)}
                                                    </TooltipContent>
                                                </Tooltip>
                                            ))}
                                        </TooltipProvider>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Dashboard — always visible, no toggle */}
                <SidebarGroup className="py-1">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActiveLink(OVERVIEW_ITEM.key)}>
                                    <a href={OVERVIEW_ITEM.url.replace(":id", businessId)}>
                                        <OVERVIEW_ITEM.icon />
                                        {t(OVERVIEW_ITEM.titleKey)}
                                    </a>
                                </SidebarMenuButton>
                                <SidebarPinToggle
                                    pinned={pinnedByPath.has(`owner/${OVERVIEW_ITEM.key}`)}
                                    atMax={atMax}
                                    onToggle={() => togglePin(`owner/${OVERVIEW_ITEM.key}`)}
                                />
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Collapsible groups */}
                {NAV_GROUPS.map((group) => (
                    <CollapsibleNavGroup
                        key={group.titleKey}
                        group={group}
                        businessId={businessId}
                        defaultOpen={groupHasActiveItem(group)}
                        pinnedPaths={new Set(pinnedByPath.keys())}
                        atMax={atMax}
                        onTogglePin={togglePin}
                    />
                ))}
            </SidebarContent>

            <SidebarRail />
        </Sidebar>
    )
}
