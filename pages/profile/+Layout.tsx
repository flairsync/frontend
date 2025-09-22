export { ProfilePagesLayout }

import PublicFeedHeader from '@/components/feed/PublicFeedHeader'
import React from 'react'

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
    return (
        <div className="flex min-h-screen">
            <PublicFeedHeader />
            <div
                className="flex min-h-screen pt-14 w-full"
            >
                {/* Sidebar */}
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

                {/* Main Content */}
                <main className="flex-1 p-6 bg-muted/30">{children}</main>
            </div>

        </div>
    )
}

export default ProfilePagesLayout