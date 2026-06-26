import React from 'react';
import { UtensilsCrossed, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useBusinessSeatedReservation, useActiveDineInOrder } from '@/features/diner-mode/useDinerMode';

interface DinerModeBannerProps {
    businessId: string;
}

export default function DinerModeBanner({ businessId }: DinerModeBannerProps) {
    const { t } = useTranslation('diner');
    const { data: reservation } = useBusinessSeatedReservation(businessId);
    const { data: activeOrder } = useActiveDineInOrder(businessId);

    const isSeated = !!reservation;
    const hasActiveOrder = !!activeOrder;

    if (!isSeated && !hasActiveOrder) return null;

    const handleEnter = () => {
        window.location.href = `/diner/${businessId}`;
    };

    return (
        <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
            <div className="pointer-events-auto bg-primary text-primary-foreground rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4 max-w-sm w-full">
                <div className="w-10 h-10 bg-primary-foreground/15 rounded-xl flex items-center justify-center shrink-0">
                    <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-snug">
                        {isSeated ? t('banner.seated_title') : t('banner.active_order_title')}
                    </p>
                    <p className="text-xs opacity-75 mt-0.5">
                        {isSeated ? t('banner.seated_subtitle') : t('banner.active_order_subtitle')}
                    </p>
                </div>
                <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-xl shrink-0 gap-1 font-semibold"
                    onClick={handleEnter}
                >
                    {t('banner.enter_button')}
                    <ArrowRight className="w-3.5 h-3.5" />
                </Button>
            </div>
        </div>
    );
}
