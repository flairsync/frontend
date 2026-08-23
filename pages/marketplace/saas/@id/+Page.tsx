import React from 'react';
import { useTranslation } from 'react-i18next';
import { MarketplaceItemDetail } from '@/components/marketplace/MarketplaceItemDetail';

export function Page() {
    const { t } = useTranslation('marketplace');
    return (
        <MarketplaceItemDetail
            activeType="saas"
            galleryTitle={t('gallery_titles.saas')}
            backHref="/marketplace/saas"
        />
    );
}
