import { usePageContext } from 'vike-react/usePageContext';
import { useSuspenseQuery } from '@tanstack/react-query';
import { withFallback } from 'vike-react-query';
import { useTranslation } from 'react-i18next';
import { fetchDiscoveryProfileApiCall, fetchDiscoveryMenuApiCall } from '@/features/discovery/discovery.api';
import { fetchPublicSitePageApiCall } from '@/features/site-builder/service';
import { resolveAllPageBindings } from '@/features/site-builder/bindings';
import { DiscoveryBusinessProfile } from '@/models/discovery/DiscoveryBusinessProfile';
import { BusinessMenu } from '@/models/business/menu/BusinessMenu';
import { SitePageContent } from '@/features/site-builder/types';
import SiteBuilderRenderer from '@/features/site-builder/components/SiteBuilderRenderer';

import PublicFeedHeader from '@/components/feed/PublicFeedHeader';
import WebsiteFooter from '@/components/shared/WebsiteFooter';
import BusinessDetailsHero from '@/components/business_details/BusinessDetailsHero';
import BusinessDetailsContact from '@/components/business_details/BusinessDetailsContact';
import BusinessDetailsMenu from '@/components/business_details/BusinessDetailsMenu';
import BusinessDetailsTiming from '@/components/business_details/BusinessDetailsTiming';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type SitePageQueryResult =
    | { mode: 'custom'; content: SitePageContent; resolvedBindings: Record<string, Record<string, any>> }
    | { mode: 'default'; profile: DiscoveryBusinessProfile; menu: BusinessMenu | null };

// Inner component — fetches the published site page (or falls back to the default
// profile-derived template) server-side via useSuspenseQuery.
const SiteContent = withFallback(
    ({ id }: { id: string }) => {
        const { data } = useSuspenseQuery({
            queryKey: ["business_site_page", id, "home"],
            queryFn: async (): Promise<SitePageQueryResult> => {
                try {
                    const page = await fetchPublicSitePageApiCall(id, "home");
                    const resolvedBindings = await resolveAllPageBindings(id, page.publishedContent);
                    return { mode: 'custom', content: page.publishedContent, resolvedBindings };
                } catch (error: any) {
                    if (error?.response?.status !== 404) throw error;

                    const [profileData, menuRaw] = await Promise.all([
                        fetchDiscoveryProfileApiCall(id),
                        fetchDiscoveryMenuApiCall(id),
                    ]);
                    const menuData = Array.isArray(menuRaw) ? menuRaw[0] : menuRaw;
                    const profile = DiscoveryBusinessProfile.parseApiResponse(profileData);
                    if (!profile) throw new Error("Business not found");
                    return { mode: 'default', profile, menu: BusinessMenu.parseApiResponse(menuData) };
                }
            },
        });

        if (data.mode === 'custom') {
            return (
                <main className="pt-24 pb-20">
                    <div className="max-w-6xl mx-auto px-6 space-y-24">
                        <SiteBuilderRenderer content={data.content} resolvedBindings={data.resolvedBindings} />
                    </div>
                </main>
            );
        }

        const { profile, menu } = data;

        return (
            <main className="pt-24 pb-20">
                <div className="max-w-6xl mx-auto px-6 space-y-24">
                    <BusinessDetailsHero profile={profile} />
                    {menu && <BusinessDetailsMenu menu={menu} business={profile} />}
                    <BusinessDetailsTiming openingHours={profile.openingHours} />
                    <BusinessDetailsContact profile={profile} />
                </div>
            </main>
        );
    },
    // Loading fallback — skeleton layout
    () => (
        <main className="pt-24 pb-20">
            <div className="max-w-6xl mx-auto px-6 space-y-12">
                <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
                <Skeleton className="h-[500px] w-full rounded-[2.5rem]" />
            </div>
        </main>
    ),
    // Error fallback
    ({ retry }) => {
        const { t } = useTranslation("feed");
        return (
            <main className="pt-24 pb-20 flex items-center justify-center min-h-[60vh]">
                <div className="max-w-md w-full px-6">
                    <Alert variant="destructive" className="rounded-3xl p-6">
                        <AlertCircle className="h-6 w-6" />
                        <AlertTitle className="text-lg font-bold ml-2">{t("business_page.error.title", "Error")}</AlertTitle>
                        <AlertDescription className="mt-2">
                            {t("business_page.error.message", "We couldn't load the business profile. It might be private or doesn't exist.")}
                        </AlertDescription>
                        <Button
                            variant="outline"
                            className="mt-4 w-full rounded-xl border-destructive/20 hover:bg-destructive/10"
                            onClick={() => retry()}
                        >
                            {t("business_page.error.try_again", "Try Again")}
                        </Button>
                    </Alert>
                </div>
            </main>
        );
    }
);

const BusinessSitePage = () => {
    const pageContext = usePageContext();
    const id = pageContext.routeParams?.id;

    return (
        <div className="min-h-screen bg-background">
            <PublicFeedHeader />
            <SiteContent id={id} />
            <WebsiteFooter />
        </div>
    );
};

export default BusinessSitePage;
