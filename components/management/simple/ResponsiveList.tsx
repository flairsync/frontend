import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props<T> = {
    /** The rows, in the order they should appear. */
    items: T[] | undefined;
    keyFor: (item: T) => string;
    /** One card per row, for phone-width screens. */
    renderCard: (item: T) => ReactNode;
    /** The existing table, unchanged, for tablet and up. */
    children: ReactNode;
    /** Shown on both layouts when there's nothing to list. */
    empty?: ReactNode;
    /**
     * True while the first fetch is in flight. Without this the card layout
     * would show the "nothing here yet" message on every load, which reads as
     * "your orders are gone" rather than "hang on".
     */
    loading?: boolean;
    className?: string;
};

/**
 * Shows the existing table on wide screens and a stack of cards on a phone.
 *
 * The people using this are on their feet during service, on a phone. A
 * seven-column table at 375px is either a horizontal scroll or unreadably
 * squeezed, and that's the context most of this app is actually used in.
 *
 * Deliberately takes the table as children rather than trying to generate both
 * from one column definition: the tables already exist, work, and each has its
 * own conditional columns and inline actions. Rewriting them into a generic
 * column config would be a far riskier change than rendering a second, simpler
 * layout beside them.
 */
export function ResponsiveList<T>({
    items,
    keyFor,
    renderCard,
    children,
    empty,
    loading = false,
    className,
}: Props<T>) {
    const isEmpty = (items?.length ?? 0) === 0;

    return (
        <div className={className}>
            {/* Phone: stacked cards */}
            <div className="flex flex-col gap-2 md:hidden">
                {loading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
                    ))
                    : isEmpty
                    ? empty
                    : items?.map((item) => (
                        <div
                            key={keyFor(item)}
                            className="rounded-xl border bg-card p-3 text-sm"
                        >
                            {renderCard(item)}
                        </div>
                    ))}
            </div>

            {/* Tablet and up: the table exactly as it was */}
            <div className="hidden md:block">{children}</div>
        </div>
    );
}

/**
 * The usual shape inside a card: a line with a label on the left and a value on
 * the right, so the column headings the table gave you aren't simply lost.
 */
export function CardField({
    label,
    children,
    className,
}: {
    label: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex items-baseline justify-between gap-3 py-0.5", className)}>
            <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
            <span className="min-w-0 text-right">{children}</span>
        </div>
    );
}

export default ResponsiveList;
