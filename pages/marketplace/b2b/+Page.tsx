import React from 'react';
import { MarketplaceLayout } from '@/components/marketplace/MarketplaceLayout';
import { MarketplaceGrid } from '@/components/marketplace/MarketplaceGrid';

export function Page() {
    return (
        <MarketplaceLayout
            activeType="b2b"
            title="B2B Marketplace"
            subtitle="Sourcing & supplies for your business."
        >
            <MarketplaceGrid items={[]} />
        </MarketplaceLayout>
    );
}
