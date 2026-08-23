import React from 'react';
import { useTranslation } from 'react-i18next';
import { MarketplaceItemDetail } from '@/components/marketplace/MarketplaceItemDetail';

export function Page() {
    const { t } = useTranslation('marketplace');
    return (
        <MarketplaceItemDetail
            activeType="b2b"
            galleryTitle={t('gallery_titles.b2b')}
            backHref="/marketplace/b2b"
        />
    );
}
