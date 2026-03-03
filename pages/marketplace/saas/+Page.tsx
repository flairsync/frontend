import React from 'react';
import { MarketplaceLayout } from '@/components/marketplace/MarketplaceLayout';
import { MarketplaceGrid } from '@/components/marketplace/MarketplaceGrid';
import { usePlatformMarketplaceItems } from '@/features/marketplace/useMarketplace';
import { MarketplaceItem } from '@/models/MarketplaceItem';

export function Page() {
    const { data: platData, isLoading } = usePlatformMarketplaceItems();

    // We treat 'saas' as Platform items, but if we need to filter them:
    const items = platData?.data?.filter((item: MarketplaceItem) => item.type === 'saas' || !item.type) || [];

    return (
        <MarketplaceLayout
            activeType="saas"
            title="Official Shop"
            subtitle="Exclusive gear and NFC technology."
        >
            {isLoading ? (
                <div className="flex justify-center items-center p-20">Loading...</div>
            ) : (
                <MarketplaceGrid items={items} />
            )}
        </MarketplaceLayout>
    );
}
