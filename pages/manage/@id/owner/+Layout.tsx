export { ManagePagesLayout }

import React, { useEffect, useState } from 'react'
import { navigate } from 'vike/client/router'

import { usePageContext } from 'vike-react/usePageContext';

import { AppSidebar } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { BusinessOwnerManagementSidebar } from '@/components/management/BusinessOwnerManagementSidebar';
import { QuickLinksDropdown } from '@/components/management/QuickLinksDropdown';
import HeaderProfileAvatar from '@/components/shared/HeaderProfileAvatar';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { useMyBusiness } from '@/features/business/useMyBusiness';

import { Loader } from 'lucide-react';

const PAGE_LABELS: Record<string, string> = {
    dashboard: "Dashboard",
    branding: "Business Branding",
    settings: "Business Settings",
    staff: "Staff Management",
    schedule: "Schedule",
    attendance: "Attendance",
    payroll: "Payroll",
    jobs: "Job Postings",
    inventory: "Inventory",
    menu: "Menu",
    "floor-plan": "Floor Plan",
    orders: "Orders",
    reservations: "Reservations",
    tasks: "Tasks",
    stations: "Stations",
    analytics: "Analytics & Reports",
    reviews: "Reviews",
    "audit-logs": "Audit Logs",
    danger: "Danger Zone",
    integrations: "Integrations",
    marketplace: "Marketplace",
}

function getCurrentPageLabel(): string {
    if (typeof window === "undefined") return "Dashboard"
    const match = window.location.pathname.match(/\/owner\/([^/]+)/)
    const key = match?.[1]
    return key ? (PAGE_LABELS[key] ?? key) : "Dashboard"
}


const ManagePagesLayout = ({ children }: { children: React.ReactNode }) => {

    const {
        i18n
    } = useTranslation("management");
    const {
        routeParams,
        data
    } = usePageContext();


    const {
        myBusinessFullDetails,
        fetchingMyBusinessFullDetails,
        businessLoadError,
    } = useMyBusiness(routeParams.id);

    useEffect(() => {
        if (businessLoadError) {
            navigate('/manage/overview');
        }
    }, [businessLoadError]);





    const [sidebarOpen, setsidebarOpen] = useState(true);


    if (!i18n.isInitialized || fetchingMyBusinessFullDetails || businessLoadError) return (
        <div className="flex items-center justify-center h-screen w-full">
            <div className="flex flex-col items-center gap-2">
                <Loader className="h-8 w-8 animate-spin" />
            </div>
        </div>
    )
    return (
        <div>

            <SidebarProvider
                onOpenChange={setsidebarOpen}
                open={sidebarOpen}
                className="flex h-screen w-full overflow-hidden "
            >
                <BusinessOwnerManagementSidebar
                    businessId={routeParams.id}
                    className={`relative hidden md:flex  flex-col ${sidebarOpen ? "w-64" : "w-0"}  `}
                />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:flex items-center gap-2">
                                    <BreadcrumbLink>
                                        {myBusinessFullDetails?.name}
                                    </BreadcrumbLink>
                                    {!fetchingMyBusinessFullDetails && myBusinessFullDetails && (
                                        myBusinessFullDetails.isPublished ? (
                                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20 font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                Live
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/manage/${routeParams.id}/owner/settings?section=general-info`)}
                                                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 font-medium hover:bg-amber-500/20 transition-colors cursor-pointer"
                                                title="Business is not published — click to publish it"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                Draft
                                            </button>
                                        )
                                    )}
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{getCurrentPageLabel()}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <div className="flex flex-1 items-center justify-end gap-1 mr-10">
                            <QuickLinksDropdown businessId={routeParams.id} role="owner" />
                            <HeaderProfileAvatar />
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4 overflow-scroll">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>

    )
}

export default ManagePagesLayout




/*  <div className="flex min-h-screen">
      
           <PublicFeedHeader />
           <div
               className="flex min-h-screen pt-14 w-full"
           >
             
               <aside className="w-64 border-r bg-sidebar text-sidebar-foreground p-4">
                   <h2 className="text-lg font-bold mb-4">Business name</h2>
                   <nav className="space-y-2">
                       {ownerMenuItems.map(({ key, label, icon: Icon }) => (
                           <a key={key} href={`/manage/${routeParams.id}/owner/${key}`}>
                               <button
                                   className="flex items-center w-full gap-2 rounded-lg px-3 py-2 text-sm font-medium 
                    hover:bg-sidebar-accent hover:text-sidebar-accent-foreground 
                    hover:cursor-pointer hover:scale-105 transition-all ease-in-out duration-300"
                               >
                                   <Icon className="w-4 h-4" />
                                   {label}
                               </button>
                           </a>
                       ))}
                   </nav>
               </aside>
 
               <main className="flex-1 p-6 bg-muted/30">{children}</main>
           </div>
 
       </div> */