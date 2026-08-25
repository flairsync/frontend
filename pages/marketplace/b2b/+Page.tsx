import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MarketplaceLayout } from '@/components/marketplace/MarketplaceLayout';
import { MarketplaceGrid } from '@/components/marketplace/MarketplaceGrid';
import { usePlatformMarketplaceItems } from '@/features/marketplace/useMarketplace';

export function Page() {
    const { t } = useTranslation('marketplace');
    const [page, setPage] = useState(1);
    const { data, isLoading } = usePlatformMarketplaceItems('PLATFORM_B2B', { page, limit: 20 });

    return (
        <MarketplaceLayout
            activeType="b2b"
            title={t('gallery_titles.b2b')}
            subtitle={t('browse_page.b2b_subtitle')}
        >
            {isLoading ? (
                <div className="flex justify-center items-center p-20">{t('browse_page.loading_items')}</div>
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
