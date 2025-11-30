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
import { useProfile } from '@/features/profile/useProfile';
import { BusinessManageHubSidebar } from '@/components/management/layouts/BusinessManageHubSidebar';

const ProfilePagesLayout = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setsidebarOpen] = useState(true);
    const {
        userProfile
    } = useProfile();

    return (<div>

        <SidebarProvider
            onOpenChange={setsidebarOpen}
            open={sidebarOpen}
            className="flex h-screen w-full overflow-hidden "
        >
            <BusinessManageHubSidebar
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
                    Welcome back to your Business Hub, {userProfile?.getFullName()}

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
