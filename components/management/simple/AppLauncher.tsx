import { useMemo, useState } from "react";
import { Check, Search, Settings2, Star, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUiMode } from "@/components/shared/ui-mode-provider";
import { usePermissions } from "@/features/auth/usePermissions";
import { MAX_PINNED_LINKS } from "@/features/dashboard/pinnedLinks/pinnableItems";
import {
    useAddPinnedLink,
    usePinnedLinks,
    useRemovePinnedLink,
} from "@/features/dashboard/pinnedLinks/usePinnedLinks";
import {
    buildTileHref,
    getTilesForRole,
    TASK_SECTIONS,
    TILE_ACCENTS,
    type AppTile,
    type TaskRole,
} from "@/features/navigation/taskRegistry";
import { cn } from "@/lib/utils";
import AppTileCard from "./AppTileCard";

type Props = {
    businessId: string;
    role: TaskRole;
};

/**
 * The Easy View home screen: shortcuts, then every app the user can reach,
 * grouped by when you'd need it rather than by which system it belongs to.
 *
 * Every app gets a tile — nothing is buried behind a "More" bucket. A café that
 * lives in Orders and a hotel restaurant that lives in Reservations want
 * different things on top, so instead of us guessing, they star what they use
 * and hide what they don't.
 */
export function AppLauncher({ businessId, role }: Props) {
    const { t } = useTranslation("management");
    const { hiddenTiles, isTileHidden, toggleTileHidden, resetHiddenTiles } = useUiMode();
    const { hasPermission, isLoading: loadingPermissions } = usePermissions(
        role === "staff" ? businessId : undefined
    );

    const { pinnedLinks } = usePinnedLinks(businessId);
    const { addPinnedLink } = useAddPinnedLink(businessId);
    const { removePinnedLink } = useRemovePinnedLink(businessId);

    const [query, setQuery] = useState("");
    const [customizing, setCustomizing] = useState(false);

    const pinIdByPath = useMemo(
        () => new Map(pinnedLinks.map((p) => [p.path, p.id])),
        [pinnedLinks]
    );
    const atMaxShortcuts = pinnedLinks.length >= MAX_PINNED_LINKS;

    const toggleShortcut = (tile: AppTile) => {
        const path = `${role}/${tile.key}`;
        const pinId = pinIdByPath.get(path);
        if (pinId) removePinnedLink(pinId);
        else addPinnedLink(path);
    };

    const allTiles = useMemo(
        () => getTilesForRole(role, hasPermission),
        [role, hasPermission]
    );

    // Match on the plain label, the description AND a synonyms list, so someone
    // searching "waiter" or "till" lands somewhere useful even though neither
    // word appears in our navigation.
    const searchResults = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return null;
        return allTiles.filter((tile) =>
            [t(tile.labelKey), t(tile.descriptionKey), t(tile.synonymsKey)]
                .join(" ")
                .toLowerCase()
                .includes(needle)
        );
    }, [query, allTiles, t]);

    const shortcutTiles = useMemo(() => {
        const ordered = [...pinnedLinks].sort((a, b) => a.order - b.order);
        return ordered
            .map((pin) => allTiles.find((tile) => `${role}/${tile.key}` === pin.path))
            .filter((tile): tile is AppTile => Boolean(tile));
    }, [pinnedLinks, allTiles, role]);

    // Staff tiles are permission-gated, so rendering before permissions resolve
    // would briefly show an empty launcher and then pop tiles in.
    if (role === "staff" && loadingPermissions) {
        return (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
                ))}
            </div>
        );
    }

    const renderTile = (tile: AppTile) => (
        <AppTileCard
            key={tile.key}
            tile={tile}
            businessId={businessId}
            role={role}
            customizing={customizing}
            shortcut={pinIdByPath.has(`${role}/${tile.key}`)}
            hidden={isTileHidden(tile.key)}
            canAddShortcut={!atMaxShortcuts}
            onToggleShortcut={() => toggleShortcut(tile)}
            onToggleHidden={() => toggleTileHidden(tile.key)}
        />
    );

    return (
        <div className="space-y-8">
            {/* Search + customise */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t("simple_mode.launcher.search_placeholder")}
                        className="h-12 pl-9 text-base"
                        aria-label={t("simple_mode.launcher.search_placeholder")}
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
                            aria-label={t("simple_mode.launcher.clear_search")}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <Button
                    variant={customizing ? "default" : "outline"}
                    className="h-12 gap-2"
                    onClick={() => setCustomizing((v) => !v)}
                >
                    {customizing ? <Check className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
                    {customizing
                        ? t("simple_mode.customize.done")
                        : t("simple_mode.customize.start")}
                </Button>
            </div>

            {customizing && (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
                    <Settings2 className="h-4 w-4 shrink-0" />
                    <span className="flex-1 min-w-[16rem]">
                        {t("simple_mode.customize.explainer")}
                    </span>
                    {hiddenTiles.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={resetHiddenTiles}>
                            {t("simple_mode.customize.show_all", { count: hiddenTiles.length })}
                        </Button>
                    )}
                </div>
            )}

            {/* Search results replace the grid entirely — a filtered list inside
                unchanged section headings reads as "the section is broken". */}
            {searchResults ? (
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        {t("simple_mode.launcher.search_results", { count: searchResults.length })}
                    </h2>
                    {searchResults.length === 0 ? (
                        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                            {t("simple_mode.launcher.no_results", { query })}
                        </p>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {searchResults.map(renderTile)}
                        </div>
                    )}
                </section>
            ) : (
                <>
                    {shortcutTiles.length > 0 && (
                        <section className="space-y-3">
                            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                <Star className="h-4 w-4" />
                                {t("simple_mode.launcher.shortcuts")}
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {shortcutTiles.map((tile) => {
                                    const accent = TILE_ACCENTS[tile.accent];
                                    return (
                                        <a
                                            key={tile.key}
                                            href={buildTileHref(tile, businessId, role)}
                                            className="flex items-center gap-2 rounded-full border bg-card py-2 pl-2 pr-4 text-sm font-medium transition-colors hover:bg-muted"
                                        >
                                            <span
                                                className={cn(
                                                    "flex h-7 w-7 items-center justify-center rounded-full",
                                                    accent.surface
                                                )}
                                            >
                                                <tile.icon className={cn("h-4 w-4", accent.icon)} />
                                            </span>
                                            {t(tile.labelKey)}
                                        </a>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {TASK_SECTIONS.map((section) => {
                        const sectionTiles = allTiles.filter(
                            (tile) =>
                                tile.section === section.key &&
                                (customizing || !isTileHidden(tile.key))
                        );
                        if (sectionTiles.length === 0) return null;

                        return (
                            <section key={section.key} className="space-y-3">
                                <div>
                                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                        {t(section.labelKey)}
                                    </h2>
                                    <p className="text-xs text-muted-foreground/80">
                                        {t(section.descriptionKey)}
                                    </p>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {sectionTiles.map(renderTile)}
                                </div>
                            </section>
                        );
                    })}
                </>
            )}
        </div>
    );
}

export default AppLauncher;
