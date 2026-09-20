import { Check, LayoutGrid, List } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUiMode, type UiMode } from "@/components/shared/ui-mode-provider";
import { cn } from "@/lib/utils";

/**
 * Switching between the two shells. Deliberately labelled with words as well as
 * an icon and always visible in the management header — an icon-only control
 * here would be the one thing in Easy View that you'd have to be told about.
 */
export function UiModeToggle({ className }: { className?: string }) {
    const { t } = useTranslation("management");
    const { uiMode, setUiMode } = useUiMode();

    const options: { value: UiMode; label: string; description: string; icon: typeof List }[] = [
        {
            value: "simple",
            label: t("simple_mode.toggle.simple_label"),
            description: t("simple_mode.toggle.simple_description"),
            icon: LayoutGrid,
        },
        {
            value: "advanced",
            label: t("simple_mode.toggle.advanced_label"),
            description: t("simple_mode.toggle.advanced_description"),
            icon: List,
        },
    ];

    const current = options.find((o) => o.value === uiMode) ?? options[1];
    const CurrentIcon = current.icon;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium",
                        "text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground",
                        className
                    )}
                    aria-label={t("simple_mode.toggle.aria_label")}
                >
                    <CurrentIcon className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">{current.label}</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>{t("simple_mode.toggle.title")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {options.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onClick={() => setUiMode(option.value)}
                        className="flex items-start gap-2 py-2"
                    >
                        <option.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="flex min-w-0 flex-1 flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-muted-foreground">
                                {option.description}
                            </span>
                        </span>
                        {uiMode === option.value && <Check className="mt-0.5 h-4 w-4 shrink-0" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default UiModeToggle;
