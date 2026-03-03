import React from 'react';
import { MarketplaceLayout } from '@/components/marketplace/MarketplaceLayout';
import { MarketplaceGrid } from '@/components/marketplace/MarketplaceGrid';
import { usePlatformMarketplaceItems } from '@/features/marketplace/useMarketplace';
import { MarketplaceItem } from '@/models/MarketplaceItem';

export function Page() {
    const { data: platData, isLoading } = usePlatformMarketplaceItems();

    // B2B could also be platform items matching type b2b
    const items = platData?.data?.filter((item: MarketplaceItem) => item.type === 'b2b') || [];

    return (
        <MarketplaceLayout
            activeType="b2b"
            title="B2B Marketplace"
            subtitle="Sourcing & supplies for your business."
        >
            {isLoading ? (
                <div className="flex justify-center items-center p-20">Loading...</div>
            ) : (
                <MarketplaceGrid items={items} />
            )}
        </MarketplaceLayout>
    );
}
