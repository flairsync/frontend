import React from 'react';
import { MarketplaceLayout } from '@/components/marketplace/MarketplaceLayout';
import { MarketplaceGrid } from '@/components/marketplace/MarketplaceGrid';
import { MOCK_ITEMS } from '@/components/marketplace/data';

export function Page() {
    const items = MOCK_ITEMS.filter(item => item.type === 'saas');

    return (
        <MarketplaceLayout
            activeType="saas"
            title="Official Shop"
            subtitle="Exclusive gear and NFC technology."
        >
            <MarketplaceGrid items={items} />
        </MarketplaceLayout>
    );
}
