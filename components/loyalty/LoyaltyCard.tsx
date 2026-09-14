import { Gift } from "lucide-react";
import { cn } from "@/lib/utils";

// Shared styled "loyalty card" — used both in per-business Diner Mode and the
// cross-business "My Loyalty Cards" profile page. No business-specific brand
// color exists anywhere in the API (checked: Business/Theme entities carry no
// hex/color field), so branding is limited to the business's logo — the card
// itself always uses the app's own primary-gradient theme.
type LoyaltyCardProps = {
    businessName: string;
    businessLogo?: string | null;
    balance: number;
    enrolledAt?: string | Date | null;
    title?: string;
    balanceLabel?: string;
    pointsSuffix?: string;
    memberSinceText?: string;
    className?: string;
};

export function LoyaltyCard({
    businessName,
    businessLogo,
    balance,
    title = "Loyalty Points",
    balanceLabel = "Your balance",
    pointsSuffix = "pts",
    memberSinceText,
    className,
}: LoyaltyCardProps) {
    return (
        <div
            className={cn(
                "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-3xl p-6 shadow-lg",
                className,
            )}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 opacity-90">
                    <Gift className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
                </div>
                {businessLogo ? (
                    <img
                        src={businessLogo}
                        alt={businessName}
                        className="w-9 h-9 rounded-full object-cover border-2 border-primary-foreground/30"
                    />
                ) : null}
            </div>
            <p className="text-sm font-semibold truncate">{businessName}</p>
            <p className="text-sm opacity-80 mt-2">{balanceLabel}</p>
            <p className="text-5xl font-black mt-1">
                {balance} <span className="text-xl font-bold opacity-80">{pointsSuffix}</span>
            </p>
            {memberSinceText && <p className="text-xs opacity-70 mt-4">{memberSinceText}</p>}
        </div>
    );
}
