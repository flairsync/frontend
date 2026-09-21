import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { useUiMode } from "@/components/shared/ui-mode-provider";
import { cn } from "@/lib/utils";

type Props = {
    /** Plain-language heading, e.g. "Sizes and options". */
    title: string;
    /** One line on what's inside, shown while collapsed. */
    hint?: string;
    /**
     * How many things in here the user has already set. Non-zero forces the
     * section open — a filled-in field hidden behind a closed heading is a
     * field someone will forget they set, and then not understand the result.
     */
    filledCount?: number;
    /**
     * Start expanded regardless. Passed when editing an existing record, where
     * any of these sections may already hold data the user needs to see.
     */
    defaultOpen?: boolean;
    children: ReactNode;
    className?: string;
};

/**
 * Collapses an optional part of a long form in Easy View, and does nothing at
 * all in Full View.
 *
 * Adding a dish means a name and a price. It should not also mean scrolling
 * past variants, modifier groups, allergens, kitchen routing, stock linkage and
 * set-menu membership — every one of which has a sensible default.
 *
 * Nothing is removed and nothing is disabled: the same fields, the same state,
 * the same submit. Only the initial visibility changes, which is what keeps
 * this safe to apply to a form that already works.
 */
export function FormSection({ title, hint, filledCount = 0, defaultOpen = false, children, className }: Props) {
    const { isSimple } = useUiMode();
    const [open, setOpen] = useState(defaultOpen || filledCount > 0);

    // Editing an existing item populates fields after mount, so re-check rather
    // than trusting the value at first render.
    useEffect(() => {
        if (defaultOpen || filledCount > 0) setOpen(true);
    }, [defaultOpen, filledCount]);

    if (!isSimple) return <>{children}</>;

    return (
        <div className={cn("rounded-lg border", className)}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
            >
                <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-medium">{title}</span>
                    {hint && !open && (
                        <span className="truncate text-xs text-muted-foreground">{hint}</span>
                    )}
                </span>
                {filledCount > 0 && (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold leading-none text-primary-foreground">
                        {filledCount}
                    </span>
                )}
                <ChevronDown
                    className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                        open && "rotate-180"
                    )}
                />
            </button>

            {/* Kept mounted: unmounting would drop the state of whatever lives
                inside, and these sections hold real editing state. */}
            <div className={cn("space-y-4 px-3 pb-3", !open && "hidden")}>{children}</div>
        </div>
    );
}

export default FormSection;
