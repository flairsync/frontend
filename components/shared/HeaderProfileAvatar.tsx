import React from 'react'

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
import { CheckCircle2 } from 'lucide-react'


const HeaderProfileAvatar = () => {

    const { setTheme, theme } = useTheme()
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
                                <DropdownMenuItem>English</DropdownMenuItem>
                                <DropdownMenuItem>French</DropdownMenuItem>
                                <DropdownMenuItem>Spanish</DropdownMenuItem>
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