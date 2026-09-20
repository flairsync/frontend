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

            {primary.map((action) => (
                <a
                    key={action.key}
                    href={buildActionHref(tile, action, businessId, role)}
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
            ))}

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
                        {secondary.map((action) => (
                            <DropdownMenuItem key={action.key} asChild>
                                <a
                                    href={buildActionHref(tile, action, businessId, role)}
                                    className="cursor-pointer"
                                >
                                    <action.icon className="h-4 w-4 text-muted-foreground" />
                                    {t(action.labelKey)}
                                </a>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}

export default SimpleActionBar;
