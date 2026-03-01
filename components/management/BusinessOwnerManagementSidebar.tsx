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
import { BarChart3, CalendarCheck, CreditCard, Images, LayoutDashboard, PackageOpen, Plug, Settings, ShieldAlert, ShoppingBag, Users, Utensils } from "lucide-react"
import { BusinessSwitcher } from "./BusinessSwitcher"
import { useMyBusinesses } from "@/features/business/useMyBusinesses"
import { usePageContext } from "vike-react/usePageContext"

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
                    key: "branding",
                    title: "Business Branding",
                    url: "/manage/:id/owner/branding",
                    icon: Images,
                    requiredPermission: "BUSINESS_SETTINGS",
                    requiredAction: "read",
                },
                {
                    key: "settings",
                    title: "Business Settings",
                    url: "/manage/:id/owner/settings",
                    icon: Settings,
                    requiredPermission: "BUSINESS_SETTINGS",
                    requiredAction: "read",
                },
                {
                    key: "billing",
                    title: "Billing & Subscription",
                    url: "/manage/:id/owner/billing",
                    icon: CreditCard,
                    requiredPermission: "BUSINESS_SETTINGS", // Maybe owner only later
                    requiredAction: "read",
                },
                {
                    key: "staff",
                    title: "Staff Management",
                    url: "/manage/:id/owner/staff",
                    icon: Users,
                    requiredPermission: "STAFF",
                    requiredAction: "read",
                },
                {
                    key: "schedule",
                    title: "Schedule Management",
                    url: "/manage/:id/owner/schedule",
                    icon: CalendarCheck,
                    requiredPermission: "OPENING_HOURS",
                    requiredAction: "read",
                },
                {
                    key: "inventory",
                    title: "Inventory Management",
                    url: "/manage/:id/owner/inventory",
                    icon: PackageOpen,
                    requiredPermission: "INVENTORY",
                    requiredAction: "read",
                },
                {
                    key: "menu",
                    title: "Menu Management",
                    url: "/manage/:id/owner/menu",
                    icon: Utensils,
                    requiredPermission: "MENU",
                    requiredAction: "read",
                },
                {
                    key: "floor-plan",
                    title: "Floor Plan",
                    url: "/manage/:id/owner/floor-plan",
                    icon: LayoutDashboard,
                    requiredPermission: "BUSINESS_SETTINGS",
                    requiredAction: "read",
                },
                {
                    key: "orders",
                    title: "Orders",
                    url: "/manage/:id/owner/orders",
                    icon: ShoppingBag,
                    requiredPermission: "ORDERS",
                    requiredAction: "read",
                },
                {
                    key: "reservations",
                    title: "Reservations",
                    url: "/manage/:id/owner/reservations",
                    icon: CalendarCheck,
                    requiredPermission: "RESERVATIONS",
                    requiredAction: "read",
                },
                {
                    key: "analytics",
                    title: "Analytics & Reports",
                    url: "/manage/:id/owner/analytics",
                    icon: BarChart3,
                    requiredPermission: "ORDERS", // Or specific analytics perm
                    requiredAction: "read",
                },
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

    return currentPath.includes(`/owner/${key}`);
}


export function BusinessOwnerManagementSidebar({ ...props }: React.ComponentProps<typeof Sidebar> & {
    businessId: string
}) {

    const {
        myBusinesses
    } = useMyBusinesses();



    const getListOfBusinesses = () => {
        if (myBusinesses) {
            return myBusinesses.map(val => {
                return {
                    id: val.id,
                    name: val.name
                }
            })
        } else {
            return [];
        }
    }

    return (
        <Sidebar {...props}
        >
            <SidebarHeader>
                <BusinessSwitcher

                    businesses={getListOfBusinesses()}
                    selectedBusiness={props.businessId}

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
                                            <a href={item.url.replace(":id", props.businessId)}>
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
