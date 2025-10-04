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


import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from './theme-provider'
import { CheckCircle, CheckCircle2 } from 'lucide-react'
// Import SVGs (place them in /src/assets/flags/)
import EnFlag from "@/assets/flags/gb.svg";
import FrFlag from "@/assets/flags/fr.svg";
import EsFlag from "@/assets/flags/es.svg";
import CatFlag from "@/assets/flags/ad.svg";
import { useTranslation } from "react-i18next";


const languages = [
    { code: "en", label: "English", flag: EnFlag },
    { code: "fr", label: "Français", flag: FrFlag },
    { code: "es", label: "Español", flag: EsFlag },
    { code: "cat", label: "Catalan", flag: CatFlag },
];
const HeaderProfileAvatar = () => {

    const { setTheme, theme } = useTheme()

    const {
        i18n
    } = useTranslation();
    useEffect(() => {
        i18n.on("languageChanged", (lng) => {
        })
    }, []);

    const handleSelect = (code: string) => {
        i18n.changeLanguage(code);
    };


    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar className='hover:cursor-pointer'>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>SC</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Semah Chriha</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <a
                    href='/profile/overview'
                >
                    <DropdownMenuItem className='hover:cursor-pointer'>
                        Profile
                    </DropdownMenuItem>
                </a>

                <a
                    href='/profile/settings'
                >
                    <DropdownMenuItem className='hover:cursor-pointer'>
                        Settings
                    </DropdownMenuItem>
                </a>

                <DropdownMenuGroup>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Language</DropdownMenuSubTrigger>
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
                        <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => setTheme("light")}>
                                    {theme == "light" && <CheckCircle2 />}
                                    Light</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("dark")}>
                                    {theme == "dark" && <CheckCircle2 />}
                                    Dark</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("system")}>
                                    {theme == "system" && <CheckCircle2 />}
                                    Auto</DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default HeaderProfileAvatar