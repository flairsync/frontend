import { motion } from 'framer-motion'
import { usePageContext } from 'vike-react/usePageContext';
import { useSuspenseQuery } from '@tanstack/react-query';
import { withFallback } from 'vike-react-query';
import { fetchDiscoveryProfileApiCall, fetchDiscoveryMenuApiCall } from '@/features/discovery/discovery.api';
import { DiscoveryBusinessProfile } from '@/models/discovery/DiscoveryBusinessProfile';
import { BusinessMenu } from '@/models/business/menu/BusinessMenu';
import DinerModeBanner from '@/components/diner-mode/DinerModeBanner';

import PublicFeedHeader from '@/components/feed/PublicFeedHeader';
import WebsiteFooter from '@/components/shared/WebsiteFooter';

import BusinessDetailsHero from '@/components/business_details/BusinessDetailsHero';
import { BusinessDetailsOrderModal } from "@/components/business_details/BusinessDetailsOrderModal";
import BusinessDetailsUserHistory from "@/components/business_details/BusinessDetailsUserHistory";
import BusinessDetailsContact from '@/components/business_details/BusinessDetailsContact';
import BusinessDetailsInfoCards from '@/components/business_details/BusinessDetailsInfoCards';
import BusinessDetailsMenu from '@/components/business_details/BusinessDetailsMenu';
import BusinessDetailsReviews from '@/components/business_details/BusinessDetailsReviews';
import BusinessDetailsTiming from '@/components/business_details/BusinessDetailsTiming';
import BusinessDetailsTableReservation from '@/components/business_details/BusinessDetailsTableReservation';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
}

// Inner component — fetches profile + menu in parallel, server-rendered via useSuspenseQuery
const BusinessContent = withFallback(
    ({ id, user }: { id: string; user: ReturnType<typeof usePageContext>['user'] }) => {
        const { data } = useSuspenseQuery({
            queryKey: ["business_page", id],
            queryFn: async () => {
                const [profileData, menuRaw] = await Promise.all([
                    fetchDiscoveryProfileApiCall(id),
                    fetchDiscoveryMenuApiCall(id),
                ]);
                const menuData = Array.isArray(menuRaw) ? menuRaw[0] : menuRaw;
                const profile = DiscoveryBusinessProfile.parseApiResponse(profileData);
                if (!profile) throw new Error("Business not found");
                return {
                    profile,
                    menu: BusinessMenu.parseApiResponse(menuData),
                };
            },
        });

        const { profile, menu } = data;

        return (
            <main className="pt-24 pb-20">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="max-w-6xl mx-auto px-6 space-y-24"
                >
                    <motion.div variants={item}>
                        <BusinessDetailsHero profile={profile} />
                    </motion.div>

                    <motion.div variants={item}>
                        <BusinessDetailsInfoCards profile={profile} />
                    </motion.div>

                    {user && (
                        <BusinessDetailsUserHistory businessId={id} />
                    )}

                    {menu && (
                        <motion.div variants={item}>
                            <BusinessDetailsMenu menu={menu} business={profile} />
                        </motion.div>
                    )}

                    {profile.allowReservations && (
                        <motion.div variants={item}>
                            <BusinessDetailsTableReservation businessId={id} />
                        </motion.div>
                    )}

                    <motion.div variants={item}>
                        <BusinessDetailsTiming openingHours={profile.openingHours} />
                    </motion.div>

                    <motion.div variants={item}>
                        <BusinessDetailsReviews
                            businessId={id}
                            businessName={profile.name}
                            initialStats={profile.rating !== null || profile.reviewCount > 0 ? {
                                average: profile.rating,
                                total: profile.reviewCount,
                                distribution: profile.reviewDistribution,
                            } : undefined}
                        />
                    </motion.div>

                    <motion.div variants={item}>
                        <BusinessDetailsContact profile={profile} />
                    </motion.div>
                </motion.div>
            </main>
        );
    },
    // Loading fallback — skeleton layout
    () => (
        <main className="pt-24 pb-20">
            <div className="max-w-6xl mx-auto px-6 space-y-12">
                <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Skeleton className="h-32 w-full rounded-3xl" />
                    <Skeleton className="h-32 w-full rounded-3xl" />
                    <Skeleton className="h-32 w-full rounded-3xl" />
                </div>
                <Skeleton className="h-[500px] w-full rounded-[2.5rem]" />
            </div>
        </main>
    ),
    // Error fallback
    ({ retry }) => (
        <main className="pt-24 pb-20 flex items-center justify-center min-h-[60vh]">
            <div className="max-w-md w-full px-6">
                <Alert variant="destructive" className="rounded-3xl p-6">
                    <AlertCircle className="h-6 w-6" />
                    <AlertTitle className="text-lg font-bold ml-2">Error</AlertTitle>
                    <AlertDescription className="mt-2">
                        We couldn't load the business profile. It might be private or doesn't exist.
                    </AlertDescription>
                    <Button
                        variant="outline"
                        className="mt-4 w-full rounded-xl border-destructive/20 hover:bg-destructive/10"
                        onClick={() => retry()}
                    >
                        Try Again
                    </Button>
                </Alert>
            </div>
        </main>
    )
);

const BusinessPage = () => {
    const pageContext = usePageContext();
    const id = pageContext.routeParams?.id;

    return (
        <div className="min-h-screen bg-background">
            <PublicFeedHeader />
            <BusinessContent id={id} user={pageContext.user} />
            <WebsiteFooter />
            {pageContext.user && id && <DinerModeBanner businessId={id} />}
        </div>
    );
}

export default BusinessPage;
