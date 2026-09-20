import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { usePermissions } from "@/features/auth/usePermissions";
import {
    buildActionHref,
    buildTileHref,
    getActionsForTile,
    getTilesForRole,
    TILE_ACCENTS,
    type TaskRole,
} from "@/features/navigation/taskRegistry";
import { cn } from "@/lib/utils";

type Props = {
    businessId: string;
    role: TaskRole;
};

/**
 * Ctrl/Cmd+K search over everything in the task registry — both the pages and
 * the things you can do on them, so typing "add table" jumps straight into the
 * dialog rather than to the floor plan.
 *
 * Mounted in both shells on purpose. Someone who prefers the full sidebar still
 * benefits from not having to remember which of 34 entries holds a feature, and
 * keeping one search across both modes means there's one thing to teach.
 */
export function TaskSearchDialog({ businessId, role }: Props) {
    const { t } = useTranslation("management");
    const [open, setOpen] = useState(false);
    const { hasPermission } = usePermissions(role === "staff" ? businessId : undefined);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                setOpen((value) => !value);
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, []);

    const tiles = useMemo(() => getTilesForRole(role, hasPermission), [role, hasPermission]);

    const actionEntries = useMemo(
        () =>
            tiles.flatMap((tile) =>
                getActionsForTile(tile, role, hasPermission).map((action) => ({
                    tile,
                    action,
                    href: buildActionHref(tile, action, businessId, role),
                }))
            ),
        [tiles, role, hasPermission, businessId]
    );

    const go = (href: string, external?: boolean) => {
        setOpen(false);
        if (external) window.open(href, "_blank", "noopener,noreferrer");
        else window.location.href = href;
    };

    return (
        <>
            {/* A keyboard shortcut alone is invisible to the people this is for,
                so the palette also gets a plain button in the header. */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                aria-label={t("simple_mode.search.button_label")}
            >
                <Search className="h-4 w-4 shrink-0" />
                <span className="hidden lg:inline">{t("simple_mode.search.button_label")}</span>
            </button>

            <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder={t("simple_mode.launcher.search_placeholder")} />
            <CommandList>
                <CommandEmpty>{t("simple_mode.search.empty")}</CommandEmpty>

                <CommandGroup heading={t("simple_mode.search.actions_heading")}>
                    {actionEntries.map(({ tile, action, href }) => {
                        const accent = TILE_ACCENTS[tile.accent];
                        return (
                            <CommandItem
                                key={`${tile.key}:${action.key}`}
                                // cmdk filters on this string, so the tile name and
                                // its synonyms have to be in it for "waiter" to find
                                // "Add a team member".
                                value={`${t(action.labelKey)} ${t(tile.labelKey)} ${t(tile.synonymsKey)}`}
                                onSelect={() => go(href)}
                            >
                                <action.icon className={cn("shrink-0", accent.icon)} />
                                <span className="flex-1">{t(action.labelKey)}</span>
                                <span className="text-xs text-muted-foreground">
                                    {t(tile.labelKey)}
                                </span>
                            </CommandItem>
                        );
                    })}
                </CommandGroup>

                <CommandGroup heading={t("simple_mode.search.pages_heading")}>
                    {tiles.map((tile) => {
                        const accent = TILE_ACCENTS[tile.accent];
                        return (
                            <CommandItem
                                key={tile.key}
                                value={`${t(tile.labelKey)} ${t(tile.descriptionKey)} ${t(tile.synonymsKey)}`}
                                onSelect={() =>
                                    go(buildTileHref(tile, businessId, role), tile.external)
                                }
                            >
                                <tile.icon className={cn("shrink-0", accent.icon)} />
                                <span className="flex-1">{t(tile.labelKey)}</span>
                                <span className="hidden truncate text-xs text-muted-foreground sm:block">
                                    {t(tile.descriptionKey)}
                                </span>
                            </CommandItem>
                        );
                    })}
                </CommandGroup>
            </CommandList>
            </CommandDialog>
        </>
    );
}

export default TaskSearchDialog;
