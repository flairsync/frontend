import BusinessDetailsHero from '@/components/business_details/BusinessDetailsHero';
import BusinessDetailsContact from '@/components/business_details/BusinessDetailsContact';
import BusinessDetailsInfoCards from '@/components/business_details/BusinessDetailsInfoCards';
import BusinessDetailsMenu from '@/components/business_details/BusinessDetailsMenu';
import BusinessDetailsReviews from '@/components/business_details/BusinessDetailsReviews';
import BusinessDetailsTiming from '@/components/business_details/BusinessDetailsTiming';
import PublicFeedHeader from '@/components/feed/PublicFeedHeader';
import { Separator } from '@/components/ui/separator';
import React from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import WebsiteFooter from '@/components/shared/WebsiteFooter';
import BusinessDetailsTableReservation from '@/components/business_details/BusinessDetailsTableReservation';

const BusinessPage = () => {
    const pageContext = usePageContext();
    return (
        <div>
            <PublicFeedHeader />
            <div
                className='pt-12'
            >
                <div className="max-w-6xl mx-auto p-6 space-y-8">
                    <BusinessDetailsHero />
                    <Separator />
                    <BusinessDetailsInfoCards />
                    <Separator />
                    <BusinessDetailsMenu />
                    <Separator />
                    <BusinessDetailsTableReservation />
                    <Separator />
                    <BusinessDetailsTiming />
                    <Separator />
                    <BusinessDetailsReviews />
                    <Separator />
                    <BusinessDetailsContact />
                    <WebsiteFooter />
                </div>

            </div>
        </div>
    )
}

export default BusinessPage