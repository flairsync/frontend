import type { ElementType } from "react";
import { NAV_GROUPS, OVERVIEW_ITEM, NavItem } from "@/components/management/BusinessOwnerManagementSidebar";
import { staffNavData } from "@/components/staff/StaffMemberSidebar";

export interface PinnableItem {
  path: string;
  titleKey: string;
  icon: ElementType;
}

export function getOwnerPinnableItems(): PinnableItem[] {
  const items: NavItem[] = [OVERVIEW_ITEM, ...NAV_GROUPS.flatMap((g) => g.items)];
  return items.map((item) => ({
    path: `owner/${item.key}`,
    titleKey: item.titleKey,
    icon: item.icon,
  }));
}

export function getStaffPinnableItems(
  hasPermission: (key: string, action: "read" | "create" | "update" | "delete") => boolean,
): PinnableItem[] {
  return staffNavData.navMain
    .flatMap((group) => group.items)
    .filter((item: any) => !item.requiredPermission || hasPermission(item.requiredPermission, item.requiredAction))
    .map((item) => ({
      path: `staff/${item.key}`,
      titleKey: item.titleKey,
      icon: item.icon,
    }));
}
