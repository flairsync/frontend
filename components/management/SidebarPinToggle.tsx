import { Pin } from "lucide-react"
import { useTranslation } from "react-i18next"

import { SidebarMenuAction } from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type Props = {
    pinned: boolean
    atMax: boolean
    onToggle: () => void
}

export function SidebarPinToggle({ pinned, atMax, onToggle }: Props) {
    const { t } = useTranslation("management")
    const disabled = !pinned && atMax
    const label = disabled
        ? t("pinned_links.max_reached")
        : t(pinned ? "pinned_links.remove" : "pinned_links.pin")

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <SidebarMenuAction
                    showOnHover={!pinned}
                    disabled={disabled}
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onToggle()
                    }}
                    aria-label={label}
                >
                    <Pin className={cn("h-3.5 w-3.5", pinned && "fill-current")} />
                </SidebarMenuAction>
            </TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
    )
}
