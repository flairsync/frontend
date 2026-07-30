import React, { useState } from 'react';
import { MarketplaceLayout } from '@/components/marketplace/MarketplaceLayout';
import { MarketplaceGrid } from '@/components/marketplace/MarketplaceGrid';
import { usePlatformMarketplaceItems } from '@/features/marketplace/useMarketplace';

export function Page() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = usePlatformMarketplaceItems('PLATFORM_B2B', { page, limit: 20 });

    return (
        <MarketplaceLayout
            activeType="b2b"
            title="B2B Marketplace"
            subtitle="Sourcing & supplies for your business."
        >
            {isLoading ? (
                <div className="flex justify-center items-center p-20">Loading items...</div>
            ) : (
                <MarketplaceGrid
                    items={data?.data ?? []}
                    currentPage={data?.current ?? 1}
                    totalPages={data?.pages ?? 1}
                    onPageChange={setPage}
                />
            )}
        </MarketplaceLayout>
    );
}
