import React from 'react';
import { MarketplaceLayout } from '@/components/marketplace/MarketplaceLayout';
import { MarketplaceGrid } from '@/components/marketplace/MarketplaceGrid';
import { MOCK_ITEMS } from '@/components/marketplace/data';

export function Page() {
    const items = MOCK_ITEMS.filter(item => item.type === 'b2b');

    return (
        <MarketplaceLayout
            activeType="b2b"
            title="B2B Marketplace"
            subtitle="Sourcing & supplies for your business."
        >
            <MarketplaceGrid items={items} />
        </MarketplaceLayout>
    );
}
