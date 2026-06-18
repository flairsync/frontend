import React from 'react';
import { Clock, Coffee, ChevronRight } from 'lucide-react';
import { usePageContext } from 'vike-react/usePageContext';
import { navigate } from 'vike/client/router';
import { useTranslation } from 'react-i18next';
import { useMyActiveShift } from '@/features/shifts/useAttendance';

export default function ClockedInBanner() {
    const { t } = useTranslation('management');
    const pageContext = usePageContext();
    const isLoggedIn = !!pageContext.user;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const { data: activeShift } = useMyActiveShift(isLoggedIn);

    if (!isLoggedIn || !activeShift) return null;
    // Don't show it on the page where they'd already see their clock status
    if (currentPath.startsWith(`/manage/${activeShift.businessId}/staff/`)) return null;

    const handleClick = () => {
        navigate(`/manage/${activeShift.businessId}/staff/shifts?tab=today`);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <button
                onClick={handleClick}
                className={`flex items-center gap-2 rounded-full shadow-2xl px-4 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] ${activeShift.onBreak ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
            >
                <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                </span>
                {activeShift.onBreak ? <Coffee className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                {activeShift.onBreak ? t('clocked_in_banner.on_break') : t('clocked_in_banner.clocked_in')}
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>
        </div>
    );
}
