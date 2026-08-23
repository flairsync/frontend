import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePageContext } from 'vike-react/usePageContext';
import { MarketplaceItemDetail } from '@/components/marketplace/MarketplaceItemDetail';

export function Page() {
    const { t } = useTranslation('marketplace');
    const pageContext = usePageContext();
    const businessId = (pageContext.urlParsed.search.businessId as string) || '';

    return (
        <MarketplaceItemDetail
            activeType="guest"
            galleryTitle={t('gallery_titles.guest')}
            backHref={businessId ? `/marketplace/guest?businessId=${businessId}` : '/marketplace/guest'}
            backLabel={t('item_detail.back_to_shop')}
        />
    );
}
