export { ProfilePagesLayout }

import React, { useState } from 'react'

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { Separator } from '@/components/ui/separator';
import HeaderProfileAvatar from '@/components/shared/HeaderProfileAvatar';
import MobileProfileSheet from '@/components/shared/MobileProfileSheet';
import WebsiteLogo from '@/components/shared/WebsiteLogo';
import { motion, AnimatePresence } from "framer-motion"
import { useProfile } from '@/features/profile/useProfile';
import PendingDeletionScreen from '@/components/profile/PendingDeletionScreen';

const ProfilePagesLayout = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setsidebarOpen] = useState(true);
    const { userProfile } = useProfile();

    if (userProfile?.deletionRequestedAt) {
        return <PendingDeletionScreen deletionRequestedAt={userProfile.deletionRequestedAt} />;
    }

    return (
        <div>
            <SidebarProvider
                onOpenChange={setsidebarOpen}
                open={sidebarOpen}
                className="flex h-screen w-full overflow-hidden"
            >
                <ProfileSidebar
                    className={`relative hidden md:flex flex-col ${sidebarOpen ? "w-64" : "w-0"}`}
                />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
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
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                        <span className="text-sm truncate max-w-[120px] sm:max-w-none">
                            Welcome back, {userProfile?.getFullName()}
                        </span>
                        <div className="flex flex-1 justify-end items-center gap-1 mr-2 md:mr-10">
                            <div className="hidden md:flex">
                                <HeaderProfileAvatar />
                            </div>
                            <div className="flex md:hidden">
                                <MobileProfileSheet />
                            </div>
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
