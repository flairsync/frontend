export { ManagePagesLayout }

import React, { useState } from 'react'



import {
    Settings,
    SlidersHorizontal,
    ShieldAlert,
    LogOut,
    LayoutDashboard,
    CreditCard,
    Users,
    Utensils,
    ShoppingBag,
    BarChart3,
    Plug,
} from "lucide-react";
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
import PublicFeedHeader from '@/components/feed/PublicFeedHeader';
import HeaderProfileAvatar from '@/components/shared/HeaderProfileAvatar';
import { StaffMemberSidebar } from '@/components/staff/StaffMemberSidebar';




const ManagePagesLayout = ({ children }: { children: React.ReactNode }) => {
    const {
        routeParams
    } = usePageContext();

    const [sidebarOpen, setsidebarOpen] = useState(true);
    return (
        <div>

            <SidebarProvider
                onOpenChange={setsidebarOpen}
                open={sidebarOpen}
                className="flex h-screen w-full overflow-hidden "
            >
                <StaffMemberSidebar
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
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/manage">
                                        Business name
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <div
                            className=' flex flex-1  justify-end mr-10'
                        >

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