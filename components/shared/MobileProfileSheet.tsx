import React from "react";
import { LogOut, User, Settings, Building2, Sun, Moon, Monitor, AlertTriangle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useProfile } from "@/features/profile/useProfile";
import { useAuth } from "@/features/auth/useAuth";
import { useTheme } from "@/components/shared/theme-provider";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { NotificationBubble } from "@/components/notifications/NotificationBubble";
import { setLangCookie } from "@/utils/cookies";

import EnFlag from "@/assets/flags/gb.svg";
import FrFlag from "@/assets/flags/fr.svg";
import EsFlag from "@/assets/flags/es.svg";
import CatFlag from "@/assets/flags/ad.svg";

const languages = [
    { code: "en", label: "EN", flag: EnFlag },
    { code: "fr", label: "FR", flag: FrFlag },
    { code: "es", label: "ES", flag: EsFlag },
    { code: "cat", label: "CAT", flag: CatFlag },
];

const themes = [
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "dark" as const, label: "Dark", icon: Moon },
    { value: "system" as const, label: "Auto", icon: Monitor },
];

const MobileProfileSheet = () => {
    const { userProfile, updateUserProfile } = useProfile();
    const { logoutUser } = useAuth();
    const { setTheme, theme } = useTheme();
    const { i18n } = useTranslation();
    const { user } = usePageContext() as any;

    return (
        <div className="flex items-center gap-1">
            <NotificationBubble />
            <Sheet>
                <SheetTrigger asChild>
                    <button className="relative rounded-full" aria-label="Profile">
                        <Avatar className="h-8 w-8 hover:cursor-pointer">
                            <AvatarFallback className="text-xs">{userProfile?.getInitials()}</AvatarFallback>
                        </Avatar>
                        {user?.verified === false && (
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-background rounded-full" />
                        )}
                    </button>
                </SheetTrigger>

                <SheetContent side="bottom" className="rounded-t-3xl pb-8">
                    {/* User info */}
                    <div className="flex items-center gap-3 px-2 pt-2 pb-4 border-b mb-2">
                        <Avatar className="h-11 w-11">
                            <AvatarFallback>{userProfile?.getInitials()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-sm leading-tight">{userProfile?.getFullName() ?? "User"}</p>
                            {user?.verified === false && (
                                <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                                    <AlertTriangle className="w-3 h-3" /> Unverified Account
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1 pb-4">
                        <a href="/profile/overview" className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-primary/5 text-sm font-medium transition-colors">
                            <User className="w-4 h-4 text-muted-foreground" /> Profile
                        </a>
                        <a href="/profile/settings" className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-primary/5 text-sm font-medium transition-colors">
                            <Settings className="w-4 h-4 text-muted-foreground" /> Settings
                        </a>
                        <a href="/manage/overview" className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-primary/5 text-sm font-medium transition-colors">
                            <Building2 className="w-4 h-4 text-muted-foreground" /> BusinessHub
                        </a>

                        {/* Language */}
                        <div className="px-3 py-2">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Language</p>
                            <div className="flex gap-2 flex-wrap">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            i18n.changeLanguage(lang.code);
                                            setLangCookie(lang.code);
                                            updateUserProfile({ language: lang.code });
                                        }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                            i18n.language === lang.code
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border hover:bg-muted"
                                        }`}
                                    >
                                        <img src={lang.flag} className="w-4 h-4" alt={lang.label} />
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Theme */}
                        <div className="px-3 py-2">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Theme</p>
                            <div className="flex gap-2">
                                {themes.map(({ value, label, icon: Icon }) => (
                                    <button
                                        key={value}
                                        onClick={() => setTheme(value)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                            theme === value
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border hover:bg-muted"
                                        }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" /> {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Separator className="my-1" />

                        <button
                            onClick={() => logoutUser()}
                            className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-red-500/5 text-sm font-medium text-red-500 transition-colors"
                        >
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default MobileProfileSheet;
