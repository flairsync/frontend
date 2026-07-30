import React from 'react';
import { MarketplaceItemDetail } from '@/components/marketplace/MarketplaceItemDetail';

export function Page() {
    return (
        <MarketplaceItemDetail
            activeType="b2b"
            galleryTitle="B2B Marketplace"
            backHref="/marketplace/b2b"
        />
    );
}
