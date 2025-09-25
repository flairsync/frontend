export { ProfilePagesLayout }

import React, { useState } from 'react'

import {
    User,
    Heart,
    Star,
    Calendar,
    Settings,
    SlidersHorizontal,
    ShieldAlert,
    LogOut,
} from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from '@/components/ui/breadcrumb';
import HeaderProfileAvatar from '@/components/shared/HeaderProfileAvatar';
import WebsiteLogo from '@/components/shared/WebsiteLogo';
import { motion, AnimatePresence } from "framer-motion"
const menuItems = [
    { key: "overview", label: "Profile Overview", icon: User },
    { key: "favorites", label: "Favorites", icon: Heart },
    { key: "reviews", label: "Reviews", icon: Star },
    { key: "reservations", label: "Reservations", icon: Calendar },
    { key: "settings", label: "Settings", icon: Settings },
    { key: "preferences", label: "Preferences", icon: SlidersHorizontal },
    { key: "danger", label: "Danger Zone", icon: ShieldAlert },
];
const ProfilePagesLayout = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setsidebarOpen] = useState(true);


    return (<div>

        <SidebarProvider
            onOpenChange={setsidebarOpen}
            open={sidebarOpen}
            className="flex h-screen w-full overflow-hidden "
        >
            <ProfileSidebar
                className={`relative hidden md:flex  flex-col ${sidebarOpen ? "w-64" : "w-0"}  `}
            />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                    <AnimatePresence>
                        {!sidebarOpen && (
                            <motion.a
                                href="/feed"
                                initial={{ opacity: 0, scale: 0.5, x: -10 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.5, x: -10 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            >
                                <WebsiteLogo />
                            </motion.a>
                        )}
                    </AnimatePresence>
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                    Welcome back, Semah Chriha
                    {/* <Breadcrumb>
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
                        </Breadcrumb> */}
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

export default ProfilePagesLayout


/*

 <div className="flex min-h-screen">
            <PublicFeedHeader />
            <div
                className="flex min-h-screen pt-14 w-full"
            >
                <aside className="w-64 border-r bg-sidebar text-sidebar-foreground p-4">
                    <h2 className="text-lg font-bold mb-4">My Profile</h2>
                    <nav className="space-y-2">
                        {menuItems.map(({ key, label, icon: Icon }) => (
                            <a key={key} href={`/profile/${key}`}>
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

        </div>
*/