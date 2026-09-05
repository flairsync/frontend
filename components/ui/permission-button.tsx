"use client"

import * as React from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { VariantProps } from "class-variance-authority"

type PermissionButtonProps = React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        hasPermission: boolean
        permissionMessage?: string
    }

/**
 * Button that renders normally when `hasPermission` is true, and otherwise
 * renders disabled/greyed-out with a tooltip explaining why it's disabled.
 * Use this instead of `{hasPermission && <Button>...}` wherever the user
 * should still see the action exists but can't use it.
 */
export function PermissionButton({
    hasPermission,
    permissionMessage,
    className,
    variant,
    size,
    children,
    ...props
}: PermissionButtonProps) {
    if (hasPermission) {
        return (
            <Button className={className} variant={variant} size={size} {...props}>
                {children}
            </Button>
        )
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="inline-flex" tabIndex={0}>
                    <Button className={className} variant={variant} size={size} disabled {...props}>
                        {children}
                    </Button>
                </span>
            </TooltipTrigger>
            <TooltipContent>
                {permissionMessage ?? "You don't have permission to perform this action"}
            </TooltipContent>
        </Tooltip>
    )
}
