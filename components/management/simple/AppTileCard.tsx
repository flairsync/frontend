import { EyeOff, Eye, ExternalLink, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
    buildTileHref,
    TILE_ACCENTS,
    type AppTile,
    type TaskRole,
} from "@/features/navigation/taskRegistry";
import { cn } from "@/lib/utils";

type Props = {
    tile: AppTile;
    businessId: string;
    role: TaskRole;
    /** Customising shows the shortcut/hide controls instead of plain navigation. */
    customizing: boolean;
    shortcut: boolean;
    hidden: boolean;
    canAddShortcut: boolean;
    onToggleShortcut: () => void;
    onToggleHidden: () => void;
};

/**
 * One app on the launcher: a big target, a coloured icon, the plain name, and
 * one line saying what it's for. The description matters as much as the icon —
 * an icon alone is only obvious to whoever chose it.
 */
export function AppTileCard({
    tile,
    businessId,
    role,
    customizing,
    shortcut,
    hidden,
    canAddShortcut,
    onToggleShortcut,
    onToggleHidden,
}: Props) {
    const { t } = useTranslation("management");
    const accent = TILE_ACCENTS[tile.accent];
    const label = t(tile.labelKey);

    const body = (
        <>
            <span
                className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                    accent.surface
                )}
            >
                <tile.icon className={cn("h-6 w-6", accent.icon)} />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
                <span className="flex items-center gap-1 text-sm font-semibold leading-tight">
                    {label}
                    {tile.external && (
                        <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                    )}
                </span>
                <span className="text-xs leading-snug text-muted-foreground">
                    {t(tile.descriptionKey)}
                </span>
            </span>
        </>
    );

    const shellClasses = cn(
        "group relative flex h-full flex-col items-start gap-3 rounded-2xl border bg-card p-4 text-left",
        "ring-2 ring-transparent transition-all hover:shadow-sm",
        accent.ring,
        hidden && "opacity-50"
    );

    return (
        <div className="relative">
            {customizing ? (
                <div className={shellClasses}>{body}</div>
            ) : (
                <a
                    href={buildTileHref(tile, businessId, role)}
                    target={tile.external ? "_blank" : undefined}
                    rel={tile.external ? "noopener noreferrer" : undefined}
                    className={shellClasses}
                >
                    {body}
                </a>
            )}

            {customizing && (
                <div className="absolute right-2 top-2 flex gap-1">
                    {/* External screens open in their own tab and have no
                        /manage route, so they can't be pinned as quick links. */}
                    {!tile.external && (
                        <button
                            type="button"
                            onClick={onToggleShortcut}
                            disabled={!shortcut && !canAddShortcut}
                            title={
                                shortcut
                                    ? t("simple_mode.customize.remove_shortcut")
                                    : canAddShortcut
                                        ? t("simple_mode.customize.add_shortcut")
                                        : t("simple_mode.customize.shortcuts_full")
                            }
                            className={cn(
                                "rounded-full p-1.5 transition-colors",
                                shortcut
                                    ? "text-amber-500 hover:bg-amber-500/10"
                                    : "text-muted-foreground hover:bg-muted",
                                !shortcut && !canAddShortcut && "cursor-not-allowed opacity-40"
                            )}
                        >
                            <Star className={cn("h-4 w-4", shortcut && "fill-current")} />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onToggleHidden}
                        title={
                            hidden
                                ? t("simple_mode.customize.show_tile")
                                : t("simple_mode.customize.hide_tile")
                        }
                        className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                    >
                        {hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                </div>
            )}
        </div>
    );
}

export default AppTileCard;
