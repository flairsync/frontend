import React from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import { MarketplaceItemDetail } from '@/components/marketplace/MarketplaceItemDetail';

export function Page() {
    const pageContext = usePageContext();
    const businessId = (pageContext.urlParsed.search.businessId as string) || '';

    return (
        <MarketplaceItemDetail
            activeType="guest"
            galleryTitle="Guest Marketplace"
            backHref={businessId ? `/marketplace/guest?businessId=${businessId}` : '/marketplace/guest'}
            backLabel="Back to Shop"
        />
    );
}
