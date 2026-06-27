import { Pin, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermissions } from "@/features/auth/usePermissions";
import {
    PinnableItem,
    getOwnerPinnableItems,
    getStaffPinnableItems,
    MAX_PINNED_LINKS,
} from "@/features/dashboard/pinnedLinks/pinnableItems";
import {
    useAddPinnedLink,
    usePinnedLinks,
} from "@/features/dashboard/pinnedLinks/usePinnedLinks";

type Props = {
    businessId: string;
    role: "owner" | "staff";
};

export function QuickLinksDropdown({ businessId, role }: Props) {
    const { t } = useTranslation("management");
    const { pinnedLinks, loadingPinnedLinks } = usePinnedLinks(businessId);
    const { addPinnedLink, addingPinnedLink } = useAddPinnedLink(businessId);
    const { hasPermission, isLoading: loadingPermissions } = usePermissions(
        role === "staff" ? businessId : undefined,
    );

    if (loadingPinnedLinks || (role === "staff" && loadingPermissions) || pinnedLinks.length === 0) {
        return null;
    }

    const catalog: PinnableItem[] =
        role === "owner" ? getOwnerPinnableItems() : getStaffPinnableItems(hasPermission);
    const catalogByPath = new Map(catalog.map((item) => [item.path, item]));

    const orderedPins = [...pinnedLinks].sort((a, b) => a.order - b.order);
    const pinnedPaths = new Set(orderedPins.map((p) => p.path));
    const availableItems = catalog.filter((item) => !pinnedPaths.has(item.path));
    const atMax = orderedPins.length >= MAX_PINNED_LINKS;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors flex items-center justify-center"
                    aria-label={t("pinned_links.title")}
                >
                    <Pin className="w-5 h-5" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>{t("pinned_links.title")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {orderedPins.map((pin) => {
                    const item = catalogByPath.get(pin.path);
                    if (!item) return null;
                    return (
                        <DropdownMenuItem key={pin.id} asChild>
                            <a href={`/manage/${businessId}/${item.path}`} className="cursor-pointer">
                                <item.icon className="h-4 w-4 text-muted-foreground" />
                                {t(item.titleKey)}
                            </a>
                        </DropdownMenuItem>
                    );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Plus className="h-4 w-4" />
                        {t("pinned_links.add")}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-60">
                        {atMax ? (
                            <p className="px-2 py-1.5 text-sm text-muted-foreground">
                                {t("pinned_links.max_reached")}
                            </p>
                        ) : availableItems.length === 0 ? (
                            <p className="px-2 py-1.5 text-sm text-muted-foreground">
                                {t("pinned_links.nothing_to_add")}
                            </p>
                        ) : (
                            availableItems.map((item) => (
                                <DropdownMenuItem
                                    key={item.path}
                                    disabled={addingPinnedLink}
                                    onClick={() => addPinnedLink(item.path)}
                                >
                                    <item.icon className="h-4 w-4 text-muted-foreground" />
                                    {t(item.titleKey)}
                                </DropdownMenuItem>
                            ))
                        )}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
