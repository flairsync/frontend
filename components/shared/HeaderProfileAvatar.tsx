import React, { useEffect } from 'react'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useTheme } from './theme-provider'
import { useTextSize, type TextSize } from './text-size-provider'
import { AlertTriangle, CheckCircle, CheckCircle2 } from 'lucide-react'
// Import SVGs (place them in /src/assets/flags/)
import EnFlag from "@/assets/flags/gb.svg";
import FrFlag from "@/assets/flags/fr.svg";
import EsFlag from "@/assets/flags/es.svg";
import CatFlag from "@/assets/flags/ad.svg";
import { useTranslation } from "react-i18next";
import { useAuth } from '@/features/auth/useAuth'
import { useProfile } from '@/features/profile/useProfile'
import { NotificationBubble } from '@/components/notifications/NotificationBubble'
import { usePageContext } from 'vike-react/usePageContext'
import { setLangCookie } from '@/utils/cookies'
import { useMyBusinesses } from '@/features/business/useMyBusinesses'
import { useMyEmployments } from '@/features/business/employment/useMyEmployments'


const languages = [
    { code: "en", label: "English", flag: EnFlag },
    { code: "fr", label: "Français", flag: FrFlag },
    { code: "es", label: "Español", flag: EsFlag },
    { code: "cat", label: "Català", flag: CatFlag },
];
const HeaderProfileAvatar = () => {

    const { setTheme, theme } = useTheme();
    const { setTextSize, textSize } = useTextSize();
    const {
        logoutUser, loggingOut
    } = useAuth();

    const { userProfile, loadingUserProfile, updateUserProfile } = useProfile();
    const { user } = usePageContext() as any;

    const { myBusinesses } = useMyBusinesses(1, 50);
    const { myEmployments } = useMyEmployments(1, 50);
    const joinedBusinesses = (myEmployments || []).filter(
        (emp) => emp.type === "INVITED" && emp.status === "ACTIVE" && emp.business
    );
    const hasOwnedBusinesses = myBusinesses.length > 0;
    const hasJoinedBusinesses = joinedBusinesses.length > 0;

    const {
        i18n
    } = useTranslation();
    useEffect(() => {
        i18n.on("languageChanged", (lng) => {
        })
    }, []);

    const handleSelect = (code: string) => {
        i18n.changeLanguage(code);
        setLangCookie(code);
        updateUserProfile({ language: code });
    };

    const textSizeOptions: { value: TextSize; labelKey: string; fallback: string }[] = [
        { value: "default", labelKey: "shared.text_size.default", fallback: "Default" },
        { value: "large", labelKey: "shared.text_size.large", fallback: "Large" },
        { value: "xlarge", labelKey: "shared.text_size.xlarge", fallback: "Extra Large" },
    ];


    return (
        <div className="flex items-center gap-2">
            <NotificationBubble />
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <div className="relative">
                        <Avatar className='hover:cursor-pointer'>
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {userProfile?.getInitials() ?? "?"}
                            </AvatarFallback>
                        </Avatar>
                        {user && user.verified === false && (
                            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                        )}
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel className="flex flex-col">
                        <span>{userProfile?.getFullName() ?? i18n.t("shared.user_menu.default_user", "User")}</span>
                        {user && user.verified === false && (
                            <span className="text-xs text-red-500 font-normal flex items-center gap-1 mt-1">
                                <AlertTriangle className="w-3 h-3" />
                                {i18n.t("shared.user_menu.unverified_account", "Unverified Account")}
                            </span>
                        )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {user && user.verified === false && (
                        <>
                            <a href='/verify'>
                                <DropdownMenuItem className='hover:cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50'>
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    {i18n.t("shared.user_menu.verify_email", "Verify Email")}
                                </DropdownMenuItem>
                            </a>
                            <DropdownMenuSeparator />
                        </>
                    )}

                    <a
                        href='/profile/overview'
                    >
                        <DropdownMenuItem className='hover:cursor-pointer'>
                            {i18n.t("shared.user_menu.profile", "Profile")}
                        </DropdownMenuItem>
                    </a>

                    <a href='/profile/settings'>
                        <DropdownMenuItem className='hover:cursor-pointer'>
                            {i18n.t("shared.user_menu.settings", "Settings")}
                        </DropdownMenuItem>
                    </a>

                    <a href='/profile/jobs'>
                        <DropdownMenuItem className='hover:cursor-pointer'>
                            {i18n.t("shared.user_menu.jobs", "Jobs")}
                        </DropdownMenuItem>
                    </a>

                    <DropdownMenuGroup>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>{i18n.t("shared.user_menu.language", "Language")}</DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>

                                    {languages.map((lang) => (
                                        <DropdownMenuItem
                                            key={lang.code}
                                            onClick={() => handleSelect(lang.code)}
                                            className="flex items-center gap-2 hover:cursor-pointer"

                                        >
                                            {i18n.language == lang.code && <CheckCircle />}
                                            <img src={lang.flag} alt={lang.label} className="w-5 h-5" />
                                            {lang.label}
                                        </DropdownMenuItem>
                                    ))}

                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    </DropdownMenuGroup>
                    <DropdownMenuGroup>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>{i18n.t("shared.user_menu.theme", "Theme")}</DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => setTheme("light")}>
                                        {theme == "light" && <CheckCircle2 />}
                                        {i18n.t("shared.theme.light", "Light")}</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                                        {theme == "dark" && <CheckCircle2 />}
                                        {i18n.t("shared.theme.dark", "Dark")}</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("system")}>
                                        {theme == "system" && <CheckCircle2 />}
                                        {i18n.t("shared.theme.auto", "Auto")}</DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    </DropdownMenuGroup>
                    <DropdownMenuGroup>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>{i18n.t("shared.user_menu.text_size", "Text Size")}</DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    {textSizeOptions.map(({ value, labelKey, fallback }) => (
                                        <DropdownMenuItem key={value} onClick={() => setTextSize(value)}>
                                            {textSize == value && <CheckCircle2 />}
                                            {i18n.t(labelKey, fallback)}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />

                    {hasOwnedBusinesses || hasJoinedBusinesses ? (
                        <DropdownMenuGroup>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    {i18n.t("shared.user_menu.business_hub", "BusinessHub")}
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                        {hasOwnedBusinesses && hasJoinedBusinesses ? (
                                            <>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>
                                                        {i18n.t("shared.user_menu.owned_businesses", "Owned")}
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent>
                                                            {myBusinesses.map((biz) => (
                                                                <a key={biz.id} href={`/manage/${biz.id}/owner/dashboard`}>
                                                                    <DropdownMenuItem className='hover:cursor-pointer'>
                                                                        {biz.name}
                                                                    </DropdownMenuItem>
                                                                </a>
                                                            ))}
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuPortal>
                                                </DropdownMenuSub>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>
                                                        {i18n.t("shared.user_menu.joined_businesses", "Joined")}
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent>
                                                            {joinedBusinesses.map((emp) => (
                                                                <a key={emp.id} href={`/manage/${emp.business.id}/staff/dashboard`}>
                                                                    <DropdownMenuItem className='hover:cursor-pointer'>
                                                                        {emp.business.name}
                                                                    </DropdownMenuItem>
                                                                </a>
                                                            ))}
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuPortal>
                                                </DropdownMenuSub>
                                            </>
                                        ) : hasOwnedBusinesses ? (
                                            myBusinesses.map((biz) => (
                                                <a key={biz.id} href={`/manage/${biz.id}/owner/dashboard`}>
                                                    <DropdownMenuItem className='hover:cursor-pointer'>
                                                        {biz.name}
                                                    </DropdownMenuItem>
                                                </a>
                                            ))
                                        ) : (
                                            joinedBusinesses.map((emp) => (
                                                <a key={emp.id} href={`/manage/${emp.business.id}/staff/dashboard`}>
                                                    <DropdownMenuItem className='hover:cursor-pointer'>
                                                        {emp.business.name}
                                                    </DropdownMenuItem>
                                                </a>
                                            ))
                                        )}
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                        </DropdownMenuGroup>
                    ) : (
                        <a
                            href='/manage/overview'
                        >
                            <DropdownMenuItem className='hover:cursor-pointer'>
                                {i18n.t("shared.user_menu.business_hub", "BusinessHub")}
                            </DropdownMenuItem>
                        </a>
                    )}

                    <DropdownMenuSeparator />


                    <DropdownMenuItem
                        onClick={() => {
                            logoutUser();
                        }}
                    >{i18n.t("shared.user_menu.logout", "Logout")}</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export default HeaderProfileAvatar