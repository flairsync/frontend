import { BusinessDetailsCard } from '@/components/business_details/BusinessDetailsCard';
import BusinessDetailsHero from '@/components/business_details/BusinessDetailsHero';
import BusinessDetailsHighlightedIcons from '@/components/business_details/BusinessDetailsHighlightedIcons';
import PublicFeedHeader from '@/components/feed/PublicFeedHeader';
import React from 'react'
import { usePageContext } from 'vike-react/usePageContext'

const BusinessPage = () => {
    const pageContext = usePageContext();
    return (
        <div>
            <PublicFeedHeader />
            {/*  <BusinessDetailsHero /> */}
            <div
                className='pt-12'
            >

                <BusinessDetailsHighlightedIcons />
            </div>
            {/* Business Page with id {pageContext.routeParams.id} */}</div>
    )
}

export default BusinessPage