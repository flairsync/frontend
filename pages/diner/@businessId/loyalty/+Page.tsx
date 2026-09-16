import { useState } from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import { useTranslation } from 'react-i18next';
import { Gift, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import DataPagination from '@/components/inputs/DataPagination';
import { useMyLoyaltyBalance, useMyLoyaltyHistory } from '@/features/loyalty/useLoyalty';
import { useDiscoveryProfile } from '@/features/discovery/useDiscovery';
import { LoyaltyCard } from '@/components/loyalty/LoyaltyCard';
import { LoyaltyHistoryList } from '@/components/loyalty/LoyaltyHistoryList';

const HISTORY_LIMIT = 10;

export default function DinerLoyaltyPage() {
    const { t } = useTranslation('diner');
    const pageContext = usePageContext();
    const businessId = pageContext.routeParams?.businessId as string;
    const isLoggedIn = !!pageContext.user;
    const [historyPage, setHistoryPage] = useState(1);

    const { data: balance, isLoading } = useMyLoyaltyBalance(businessId);
    const { data: profile } = useDiscoveryProfile(businessId);
    const { data: history } = useMyLoyaltyHistory(businessId, historyPage, HISTORY_LIMIT);

    // No self-serve opt-in in v1 — enrollment only happens via a staff-sent
    // invite link at checkout, so a guest (or a logged-in user who was never
    // invited) is just told to ask staff, not offered an in-app join flow.
    if (!isLoggedIn) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Gift className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h2 className="text-lg font-bold">{t('loyalty_page.login_required_title')}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{t('loyalty_page.login_required_description')}</p>
                </div>
                <Button
                    className="rounded-full gap-2"
                    onClick={() => { window.location.href = `/login?origin=${encodeURIComponent(window.location.pathname)}`; }}
                >
                    <LogIn className="w-4 h-4" />
                    {t('loyalty_page.login_button')}
                </Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex-1 p-4 space-y-3">
                <Skeleton className="h-32 w-full rounded-3xl" />
            </div>
        );
    }

    if (!balance?.enrolled) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Gift className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                    <h2 className="text-lg font-bold">{t('loyalty_page.not_enrolled_title')}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{t('loyalty_page.not_enrolled_description')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4">
            <LoyaltyCard
                businessName={profile?.name ?? ''}
                businessLogo={profile?.logo}
                balance={balance.balance}
                title={t('loyalty_page.title')}
                balanceLabel={t('loyalty_page.balance_label')}
                pointsSuffix={t('loyalty_page.points_suffix')}
                memberSinceText={
                    balance.enrolledAt
                        ? t('loyalty_page.enrolled_since', { date: new Date(balance.enrolledAt).toLocaleDateString() })
                        : undefined
                }
            />

            <div className="mt-6">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                    {t('loyalty_page.activity_title')}
                </h3>
                <LoyaltyHistoryList entries={history?.data ?? []} emptyText={t('loyalty_page.activity_empty')} />
                {history && history.pages > 1 && (
                    <div className="mt-3">
                        <DataPagination
                            current={historyPage}
                            total={history.pages * HISTORY_LIMIT}
                            pageSize={HISTORY_LIMIT}
                            onChange={setHistoryPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
