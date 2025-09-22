"use client"

import * as React from "react"
import { Check, ChevronsUpDown, GalleryVerticalEnd } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type BusinessSwitchItem = {
  id: string,
  name: string,
}

export function BusinessSwitcher({
  businesses,
  defaultBusiness,
  onBusinessChange
}: {
  businesses: BusinessSwitchItem[]
  defaultBusiness: BusinessSwitchItem,
  onBusinessChange?: (business: BusinessSwitchItem) => void
}) {
  const [selectedVersion, setSelectedVersion] = React.useState(defaultBusiness)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Current business</span>
                <span className="">{selectedVersion.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width]"
            align="start"
          >
            {businesses.map((business) => (
              <DropdownMenuItem
                key={business.id}
                onSelect={() => {
                  setSelectedVersion(business);
                  if (onBusinessChange) onBusinessChange(business);
                }}
              >
                {business.name}{" "}
                {business.id === selectedVersion.id && <Check className="ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
