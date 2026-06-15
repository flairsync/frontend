import React, { useState, useEffect, useCallback } from 'react';
import { MarketplaceLayout } from '@/components/marketplace/MarketplaceLayout';
import { MarketplaceGrid } from '@/components/marketplace/MarketplaceGrid';
import { useBusinessMarketplaceItems } from '@/features/marketplace/useMarketplace';
import { usePageContext } from 'vike-react/usePageContext';

export function Page() {
    const pageContext = usePageContext();
    const businessId = (pageContext.urlParsed.search.businessId as string) || '';

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(t);
    }, [search]);

    const { data, isLoading } = useBusinessMarketplaceItems(businessId || undefined, {
        search: debouncedSearch || undefined,
        page,
        limit: 20,
    });

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
            ) : (
                <MarketplaceGrid
                    items={data?.data ?? []}
                    search={search}
                    onSearchChange={setSearch}
                    currentPage={data?.current ?? 1}
                    totalPages={data?.pages ?? 1}
                    onPageChange={setPage}
                />
            )}
        </MarketplaceLayout>
    );
}
