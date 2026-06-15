import React from 'react';
import { MarketplaceLayout } from '@/components/marketplace/MarketplaceLayout';
import { MarketplaceGrid } from '@/components/marketplace/MarketplaceGrid';

export function Page() {
    return (
        <MarketplaceLayout
            activeType="saas"
            title="Official Shop"
            subtitle="Exclusive gear and NFC technology."
        >
            <MarketplaceGrid items={[]} />
        </MarketplaceLayout>
    );
}
