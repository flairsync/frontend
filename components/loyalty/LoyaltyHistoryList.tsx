import { Gift, Pencil, Clock, LucideIcon } from "lucide-react";
import { LoyaltyHistoryEntry, LoyaltyLedgerReason } from "@/features/loyalty/loyalty-api";

const REASON_CONFIG: Record<LoyaltyLedgerReason, { label: string; icon: LucideIcon }> = {
    EARN_ORDER: { label: "Points earned", icon: Gift },
    MANUAL_ADJUSTMENT: { label: "Staff adjustment", icon: Pencil },
    EXPIRY: { label: "Points expired", icon: Clock },
};

type LoyaltyHistoryListProps = {
    entries: LoyaltyHistoryEntry[];
    emptyText?: string;
};

// Shared by the customer-facing "my activity" list (Diner Mode) and the
// owner/staff "member history" dialog — same ledger entries, same rendering.
export function LoyaltyHistoryList({ entries, emptyText = "No activity yet." }: LoyaltyHistoryListProps) {
    if (entries.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-8">{emptyText}</p>;
    }

    return (
        <div className="divide-y">
            {entries.map((entry) => {
                const config = REASON_CONFIG[entry.reason] ?? { label: entry.reason, icon: Gift };
                const Icon = config.icon;
                const isPositive = entry.delta > 0;
                return (
                    <div key={entry.id} className="flex items-center gap-3 py-3">
                        <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                                isPositive ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{config.label}</p>
                            {entry.note && <p className="text-xs text-muted-foreground truncate">{entry.note}</p>}
                            <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</p>
                        </div>
                        <p className={`text-sm font-bold shrink-0 ${isPositive ? "text-emerald-600" : "text-destructive"}`}>
                            {isPositive ? "+" : ""}
                            {entry.delta}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
