import React from 'react';
import { MarketplaceLayout } from '@/components/marketplace/MarketplaceLayout';
import { MarketplaceGrid } from '@/components/marketplace/MarketplaceGrid';
import { useBusinessMarketplaceItems } from '@/features/marketplace/useMarketplace';
import { usePageContext } from 'vike-react/usePageContext';

export function Page() {
    const pageContext = usePageContext();
    // In a generic guest marketplace, we might read businessId from URL query or route
    // e.g. /marketplace/guest?businessId=uuid
    const businessId = (pageContext.urlParsed.search.businessId as string) || '';

    const { data: items, isLoading } = useBusinessMarketplaceItems(businessId);

    return (
        <MarketplaceLayout
            activeType="guest"
            title="Guest Marketplace"
            subtitle={businessId ? "Shop items from this business." : "Discover your favorite restaurant items."}
        >
            {!businessId ? (
                <div className="flex flex-col items-center justify-center p-20 text-center">
                    <p className="text-muted-foreground text-lg mb-2">No business selected.</p>
                    <p className="text-sm text-muted-foreground/70">Please visit a specific restaurant profile to see their retail items.</p>
                </div>
            ) : isLoading ? (
                <div className="flex justify-center items-center p-20">Loading items...</div>
            ) : items && items.length > 0 ? (
                <MarketplaceGrid items={items} />
            ) : (
                <div className="flex justify-center items-center p-20 text-muted-foreground">This shop has no retail items yet.</div>
            )}
        </MarketplaceLayout>
    );
}
