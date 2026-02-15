import React from 'react';
import { MarketplaceLayout } from '@/components/marketplace/MarketplaceLayout';
import { MarketplaceGrid } from '@/components/marketplace/MarketplaceGrid';
import { MOCK_ITEMS } from '@/components/marketplace/data';

export function Page() {
    const items = MOCK_ITEMS.filter(item => item.type === 'guest');

    return (
        <MarketplaceLayout
            activeType="guest"
            title="Guest Marketplace"
            subtitle="Discover your favorite restaurants."
        >
            <MarketplaceGrid items={items} />
        </MarketplaceLayout>
    );
}
