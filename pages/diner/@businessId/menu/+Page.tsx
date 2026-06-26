import React from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDiscoveryMenu, useDiscoveryProfile } from '@/features/discovery/useDiscovery';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import DinerMenuTab from '@/components/diner-mode/DinerMenuTab';

export default function DinerMenuPage() {
    const { t } = useTranslation('diner');
    const pageContext = usePageContext();
    const businessId = pageContext.routeParams?.businessId as string;

    const { data: profile } = useDiscoveryProfile(businessId);
    const { data: menu, isLoading, error, refetch } = useDiscoveryMenu(businessId);

    if (isLoading) {
        return (
            <div className="flex-1 p-4 space-y-3">
                <Skeleton className="h-9 w-full rounded-full" />
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                ))}
            </div>
        );
    }

    if (error || !menu) {
        return (
            <div className="flex items-center justify-center flex-1 px-6">
                <Alert className="rounded-3xl max-w-sm">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle>{t('menu_page.unavailable_title')}</AlertTitle>
                    <AlertDescription>{t('menu_page.unavailable_description')}</AlertDescription>
                    <Button
                        variant="outline"
                        className="mt-3 w-full rounded-xl gap-2"
                        onClick={() => refetch()}
                    >
                        <RefreshCw className="w-4 h-4" />
                        {t('menu_page.retry')}
                    </Button>
                </Alert>
            </div>
        );
    }

    return <DinerMenuTab menu={menu} allowOrders={profile?.allowOrders ?? false} />;
}
