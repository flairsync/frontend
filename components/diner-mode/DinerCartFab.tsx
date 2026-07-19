import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { usePageContext } from 'vike-react/usePageContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useDinerModeStore } from '@/features/diner-mode/DinerModeStore';

export default function DinerCartFab() {
    const { t } = useTranslation('diner');
    const pageContext = usePageContext();
    const businessId = pageContext.routeParams?.businessId as string;
    const { cartItemCount, cartTotal, cart } = useDinerModeStore();
    const count = cartItemCount();
    const total = cartTotal();

    if (cart.length === 0) return null;

    return (
        <div className="fixed bottom-[max(6rem,calc(6rem+env(safe-area-inset-bottom)))] left-1/2 -translate-x-1/2 z-50">
            <Button
                onClick={() => { window.location.href = `/diner/${businessId}/order`; }}
                className="rounded-full shadow-xl px-5 py-3 gap-3 text-sm font-semibold h-auto"
            >
                <div className="relative">
                    <ShoppingCart className="w-4 h-4" />
                    <span className="absolute -top-2 -right-2 bg-white text-primary rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center leading-none">
                        {count}
                    </span>
                </div>
                <span>{t('cart_fab.view_order')}</span>
                <span className="opacity-80">·</span>
                <span>${total.toFixed(2)}</span>
            </Button>
        </div>
    );
}
