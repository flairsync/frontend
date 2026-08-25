import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MarketplaceLayout } from '@/components/marketplace/MarketplaceLayout';
import { MarketplaceGrid } from '@/components/marketplace/MarketplaceGrid';
import { useBusinessMarketplaceItems } from '@/features/marketplace/useMarketplace';
import { usePageContext } from 'vike-react/usePageContext';

export function Page() {
    const { t } = useTranslation('marketplace');
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
            title={t('gallery_titles.guest')}
            subtitle={businessId ? t('browse_page.guest_subtitle_with_business') : t('browse_page.guest_subtitle_no_business')}
        >
            {!businessId ? (
                <div className="flex flex-col items-center justify-center p-20 text-center">
                    <p className="text-muted-foreground text-lg mb-2">{t('browse_page.no_business_selected')}</p>
                    <p className="text-sm text-muted-foreground/70">{t('browse_page.no_business_hint')}</p>
                </div>
            ) : isLoading ? (
                <div className="flex justify-center items-center p-20">{t('browse_page.loading_items')}</div>
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
