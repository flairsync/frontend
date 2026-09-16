import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyLoyaltyAccounts } from '@/features/loyalty/useLoyalty';
import { LoyaltyCard } from '@/components/loyalty/LoyaltyCard';

const ProfileLoyaltyPage = () => {
    const { data: accounts, isLoading } = useMyLoyaltyAccounts();

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My Loyalty Cards</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-40 w-full rounded-3xl" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    const myAccounts = accounts ?? [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Loyalty Cards</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myAccounts.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        You haven't joined any loyalty programs yet.
                    </div>
                ) : (
                    myAccounts.map((account) => (
                        // Links to the business's public profile (menu/reviews/reservations/order),
                        // not Diner Mode — that's for an active dining session, and browsing your
                        // loyalty cards from your profile isn't one.
                        <a key={account.businessId} href={`/business/${account.businessId}`}>
                            <LoyaltyCard
                                businessName={account.businessName}
                                businessLogo={account.businessLogo}
                                balance={account.balance}
                                memberSinceText={`Member since ${new Date(account.enrolledAt).toLocaleDateString()}`}
                            />
                        </a>
                    ))
                )}
            </CardContent>
        </Card>
    );
};

export default ProfileLoyaltyPage;
