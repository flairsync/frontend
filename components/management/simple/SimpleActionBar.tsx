import { ChevronDown, Home } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermissions } from "@/features/auth/usePermissions";
import {
    buildActionHref,
    getActionsForTile,
    getTileForPathname,
    TILE_ACCENTS,
    type TaskRole,
} from "@/features/navigation/taskRegistry";
import { emitAction } from "@/features/navigation/actionBus";
import { cn } from "@/lib/utils";

type Props = {
    businessId: string;
    role: TaskRole;
    pathname: string;
};

/**
 * The row of large icon+verb buttons that sits above the page content in Easy
 * View, so the main things you can do here are visible without knowing which
 * tab hides them.
 *
 * Renders nothing when the current page has no registered actions — an empty
 * bar taking up vertical space is worse than no bar.
 */
export function SimpleActionBar({ businessId, role, pathname }: Props) {
    const { t } = useTranslation("management");
    // Owners aren't permission-checked, so skip the request entirely for them.
    const { hasPermission } = usePermissions(role === "staff" ? businessId : undefined);

    const tile = getTileForPathname(pathname, role);
    if (!tile) return null;

    const actions = getActionsForTile(tile, role, hasPermission);
    if (actions.length === 0) return null;

    const primary = actions.filter((a) => a.primary);
    const secondary = actions.filter((a) => !a.primary);
    const accent = TILE_ACCENTS[tile.accent];

    // These buttons point at the page they're already on. Letting the router
    // handle the click only swaps the URL — the page never remounts, so
    // anything reading its params on mount wouldn't notice. Navigating for real
    // would fix that but makes the page visibly reload just to open a dialog.
    //
    // So for a same-page click nothing navigates: we publish the params the URL
    // would have carried and the page picks them up in place. The href stays on
    // the anchor so middle-click and "open in new tab" still work, and clicks
    // that land on another page fall through to normal routing.
    const currentPath = pathname.split("?")[0];
    const handleActionClick =
        (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
            // Leave modified clicks alone — new tab / new window still work.
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

            const [targetPath, queryString = ""] = href.split("?");
            if (targetPath !== currentPath) return;

            event.preventDefault();
            emitAction(Object.fromEntries(new URLSearchParams(queryString)));
        };

    return (
        <div className="flex flex-wrap items-center gap-2 border-b pb-4">
            <a
                href={`/manage/${businessId}/${role}/home`}
                className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={t("simple_mode.launcher.home")}
            >
                <Home className="h-5 w-5" />
                <span className="text-[11px] font-medium">{t("simple_mode.launcher.home")}</span>
            </a>

            {primary.map((action) => {
                const href = buildActionHref(tile, action, businessId, role);
                return (
                <a
                    key={action.key}
                    href={href}
                    onClick={handleActionClick(href)}
                    className="flex h-16 min-w-[104px] flex-col items-center justify-center gap-1 rounded-xl border bg-card px-3 text-center transition-colors hover:bg-muted"
                >
                    <span
                        className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-lg",
                            accent.surface
                        )}
                    >
                        <action.icon className={cn("h-4 w-4", accent.icon)} />
                    </span>
                    <span className="text-xs font-medium leading-tight">{t(action.labelKey)}</span>
                </a>
                );
            })}

            {secondary.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="flex h-16 min-w-[104px] flex-col items-center justify-center gap-1 rounded-xl border border-dashed bg-card px-3 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <ChevronDown className="h-4 w-4" />
                            <span className="text-xs font-medium leading-tight">
                                {t("simple_mode.launcher.more_actions")}
                            </span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                        {secondary.map((action) => {
                            const href = buildActionHref(tile, action, businessId, role);
                            return (
                            <DropdownMenuItem key={action.key} asChild>
                                <a
                                    href={href}
                                    onClick={handleActionClick(href)}
                                    className="cursor-pointer"
                                >
                                    <action.icon className="h-4 w-4 text-muted-foreground" />
                                    {t(action.labelKey)}
                                </a>
                            </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}

export default SimpleActionBar;
