import { usePageContext } from 'vike-react/usePageContext';
import { useTranslation } from 'react-i18next';
import { Gift, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyLoyaltyBalance } from '@/features/loyalty/useLoyalty';

export default function DinerLoyaltyPage() {
    const { t } = useTranslation('diner');
    const pageContext = usePageContext();
    const businessId = pageContext.routeParams?.businessId as string;
    const isLoggedIn = !!pageContext.user;

    const { data: balance, isLoading } = useMyLoyaltyBalance(businessId);

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
            <div className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-3xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4 opacity-90">
                    <Gift className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">{t('loyalty_page.title')}</span>
                </div>
                <p className="text-sm opacity-80">{t('loyalty_page.balance_label')}</p>
                <p className="text-5xl font-black mt-1">
                    {balance.balance} <span className="text-xl font-bold opacity-80">{t('loyalty_page.points_suffix')}</span>
                </p>
                {balance.enrolledAt && (
                    <p className="text-xs opacity-70 mt-4">
                        {t('loyalty_page.enrolled_since', { date: new Date(balance.enrolledAt).toLocaleDateString() })}
                    </p>
                )}
            </div>
        </div>
    );
}
