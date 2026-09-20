import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { useUiMode } from "@/components/shared/ui-mode-provider";
import { cn } from "@/lib/utils";

type Props = {
    children: ReactNode;
    /**
     * How many of the wrapped controls are currently narrowing what's on screen.
     * Anything above zero forces the section open — hiding a filter that is
     * actively changing the results is how people end up staring at an empty
     * table wondering where their orders went.
     */
    activeCount?: number;
    /** Overrides the default "More options" wording. */
    label?: string;
    className?: string;
};

/**
 * Wraps the expert controls on a dense page so Easy View starts with just the
 * essentials and everything else is one deliberate click away.
 *
 * In Full View this renders its children inline and does nothing else, so a
 * page only has to be laid out once. That's the whole point: no forked pages,
 * no second implementation to keep in sync.
 */
export function AdvancedControls({ children, activeCount = 0, label, className }: Props) {
    const { t } = useTranslation("management");
    const { isSimple } = useUiMode();
    const [open, setOpen] = useState(activeCount > 0);

    // A filter can become active without the user touching this disclosure —
    // restored from the URL, or set by a deep link — so follow that too.
    useEffect(() => {
        if (activeCount > 0) setOpen(true);
    }, [activeCount]);

    if (!isSimple) return <>{children}</>;

    return (
        <div className={cn("w-full", className)}>
            <Button
                type="button"
                variant="outline"
                onClick={() => setOpen((value) => !value)}
                className="h-10 gap-2"
                aria-expanded={open}
            >
                <SlidersHorizontal className="h-4 w-4" />
                {label ?? t("simple_mode.advanced_controls.label")}
                {activeCount > 0 && (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold leading-none text-primary-foreground">
                        {activeCount}
                    </span>
                )}
                <ChevronDown
                    className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
                />
            </Button>

            {open && <div className="mt-3 flex flex-wrap items-center gap-2">{children}</div>}
        </div>
    );
}

export default AdvancedControls;
