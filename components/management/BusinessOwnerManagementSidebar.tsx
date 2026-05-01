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
    Briefcase,
    LayoutGrid,
    ClipboardList,
    Tablet,
} from "lucide-react"
import { BusinessSwitcher } from "./BusinessSwitcher"
import { useMyBusinesses } from "@/features/business/useMyBusinesses"
import { cn } from "@/lib/utils"

// ─── Nav structure ────────────────────────────────────────────────────────────

const POS_ITEM = {
    key: "pos",
    title: "Launch Station",
    url: "/station/pos",
    icon: MonitorSmartphone,
    external: true,
}

interface NavItem {
    key: string
    title: string
    url: string
    icon: React.ElementType
}

interface NavGroup {
    title: string
    icon: React.ElementType
    items: NavItem[]
}

const OVERVIEW_ITEM: NavItem = {
    key: "dashboard",
    title: "Dashboard",
    url: "/manage/:id/owner/dashboard",
    icon: LayoutDashboard,
}

const NAV_GROUPS: NavGroup[] = [
    {
        title: "Business",
        icon: Settings,
        items: [
            { key: "branding", title: "Business Branding", url: "/manage/:id/owner/branding", icon: Images },
            { key: "settings", title: "Business Settings", url: "/manage/:id/owner/settings", icon: Settings },
        ],
    },
    {
        title: "Team & Workforce",
        icon: Users,
        items: [
            { key: "staff", title: "Staff Management", url: "/manage/:id/owner/staff", icon: Users },
            { key: "schedule", title: "Schedule", url: "/manage/:id/owner/schedule", icon: CalendarCheck },
            { key: "attendance", title: "Attendance", url: "/manage/:id/owner/attendance", icon: ClockFadingIcon },
            { key: "payroll", title: "Payroll", url: "/manage/:id/owner/payroll", icon: Banknote },
            { key: "jobs", title: "Job Postings", url: "/manage/:id/owner/jobs", icon: Briefcase },
        ],
    },
    {
        title: "Operations",
        icon: LayoutGrid,
        items: [
            { key: "inventory", title: "Inventory", url: "/manage/:id/owner/inventory", icon: PackageOpen },
            { key: "menu", title: "Menu", url: "/manage/:id/owner/menu", icon: Utensils },
            { key: "floor-plan", title: "Floor Plan", url: "/manage/:id/owner/floor-plan", icon: LayoutDashboard },
            { key: "orders", title: "Orders", url: "/manage/:id/owner/orders", icon: ShoppingBag },
            { key: "reservations", title: "Reservations", url: "/manage/:id/owner/reservations", icon: CalendarCheck },
            { key: "tasks", title: "Tasks", url: "/manage/:id/owner/tasks", icon: ClipboardList },
            { key: "stations", title: "Stations", url: "/manage/:id/owner/stations", icon: Tablet },
        ],
    },
    {
        title: "Insights",
        icon: BarChart3,
        items: [
            { key: "analytics", title: "Analytics & Reports", url: "/manage/:id/owner/analytics", icon: BarChart3 },
            { key: "reviews", title: "Reviews", url: "/manage/:id/owner/reviews", icon: Star },
        ],
    },
    {
        title: "System",
        icon: ScrollText,
        items: [
            { key: "audit-logs", title: "Audit Logs", url: "/manage/:id/owner/audit-logs", icon: ScrollText },
            { key: "danger", title: "Danger Zone", url: "/manage/:id/owner/danger", icon: ShieldAlert },
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
}: {
    group: NavGroup
    businessId: string
    defaultOpen: boolean
}) {
    const [open, setOpen] = useState(defaultOpen)

    return (
        <SidebarGroup className="py-0">
            {/* Trigger */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between px-2 py-2 rounded-md text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
                <span className="flex items-center gap-2">
                    <group.icon className="h-3.5 w-3.5" />
                    {group.title}
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
                            {group.items.map((item) => (
                                <SidebarMenuItem key={item.key}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActiveLink(item.key)}
                                        className="pl-7"
                                    >
                                        <a href={item.url.replace(":id", businessId)}>
                                            <item.icon />
                                            {item.title}
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
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

    const businesses = myBusinesses?.map((b) => ({ id: b.id, name: b.name })) ?? []

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <BusinessSwitcher businesses={businesses} selectedBusiness={businessId} />
            </SidebarHeader>

            <SidebarContent className="gap-0">
                {/* POS — always visible */}
                <SidebarGroup className="pb-2 border-b border-sidebar-border mb-1">
                    <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                        Point of Sale
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <a
                                        href={POS_ITEM.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold text-primary"
                                    >
                                        <POS_ITEM.icon />
                                        {POS_ITEM.title}
                                    </a>
                                </SidebarMenuButton>
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
                                        {OVERVIEW_ITEM.title}
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Collapsible groups */}
                {NAV_GROUPS.map((group) => (
                    <CollapsibleNavGroup
                        key={group.title}
                        group={group}
                        businessId={businessId}
                        defaultOpen={groupHasActiveItem(group)}
                    />
                ))}
            </SidebarContent>

            <SidebarRail />
        </Sidebar>
    )
}
