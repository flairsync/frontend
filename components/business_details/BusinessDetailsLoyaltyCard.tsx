import { useMyLoyaltyBalance } from "@/features/loyalty/useLoyalty";
import { LoyaltyCard } from "@/components/loyalty/LoyaltyCard";

interface BusinessDetailsLoyaltyCardProps {
    businessId: string;
    businessName: string;
    businessLogo?: string | null;
}

// Only renders for a logged-in customer who has actually joined this
// business's loyalty program — null otherwise, same "quiet no-op" pattern as
// DinerModeBanner on this same page.
export default function BusinessDetailsLoyaltyCard({ businessId, businessName, businessLogo }: BusinessDetailsLoyaltyCardProps) {
    const { data: balance } = useMyLoyaltyBalance(businessId);

    if (!balance?.enrolled) return null;

    return (
        <LoyaltyCard
            businessName={businessName}
            businessLogo={businessLogo}
            balance={balance.balance}
            memberSinceText={balance.enrolledAt ? `Member since ${new Date(balance.enrolledAt).toLocaleDateString()}` : undefined}
            className="max-w-sm"
        />
    );
}
