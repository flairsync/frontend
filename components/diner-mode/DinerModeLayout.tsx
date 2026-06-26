import React from 'react';
import { UtensilsCrossed, ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { DiscoveryBusinessProfile } from '@/models/discovery/DiscoveryBusinessProfile';
import { BusinessMenu } from '@/models/business/menu/BusinessMenu';
import { DinerReservation, DinerOrder } from '@/features/diner-mode/useDinerMode';
import { useDinerModeStore, CartItem } from '@/features/diner-mode/DinerModeStore';
import DinerModeHeader from './DinerModeHeader';
import DinerMenuTab from './DinerMenuTab';
import DinerMyOrderTab from './DinerMyOrderTab';
import DinerCallWaiterButton from './DinerCallWaiterButton';

interface DinerModeLayoutProps {
    profile: DiscoveryBusinessProfile;
    menu: BusinessMenu;
    reservation: DinerReservation | null;
    activeOrder: DinerOrder | null;
    cart: CartItem[];
    isSubmitting: boolean;
    onPlaceOrder: () => void;
    onRemoveCartItem: (index: number) => void;
    onExit: () => void;
}

export default function DinerModeLayout({
    profile,
    menu,
    reservation,
    activeOrder,
    cart,
    isSubmitting,
    onPlaceOrder,
    onRemoveCartItem,
    onExit,
}: DinerModeLayoutProps) {
    const { t } = useTranslation('diner');
    const { activeTab, setTab } = useDinerModeStore();

    const orderBadgeCount = activeOrder
        ? activeOrder.items.length + cart.length
        : cart.length;

    return (
        <div className="flex flex-col h-dvh bg-background overflow-hidden">
            <DinerModeHeader profile={profile} reservation={reservation} onExit={onExit} />

            <div className="flex-1 overflow-hidden relative flex flex-col">
                {activeTab === 'menu' ? (
                    <DinerMenuTab menu={menu} allowOrders={profile.allowOrders} />
                ) : (
                    <DinerMyOrderTab
                        businessId={profile.id}
                        activeOrder={activeOrder}
                        cart={cart}
                        allowOrders={profile.allowOrders}
                        isSubmitting={isSubmitting}
                        onPlaceOrder={onPlaceOrder}
                        onRemoveCartItem={onRemoveCartItem}
                    />
                )}
            </div>

            <nav className="shrink-0 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <div className="flex items-center h-16">
                    <TabButton
                        icon={<UtensilsCrossed className="w-5 h-5" />}
                        label={t('layout.tab_menu')}
                        isActive={activeTab === 'menu'}
                        onClick={() => setTab('menu')}
                    />
                    <TabButton
                        icon={<ClipboardList className="w-5 h-5" />}
                        label={t('layout.tab_my_order')}
                        isActive={activeTab === 'order'}
                        badge={orderBadgeCount > 0 ? orderBadgeCount : undefined}
                        onClick={() => setTab('order')}
                    />
                    <div className="flex-1 flex items-center justify-center px-4">
                        <DinerCallWaiterButton
                            businessId={profile.id}
                            tableId={reservation?.tableId}
                            reservationId={reservation?.id}
                        />
                    </div>
                </div>
            </nav>
        </div>
    );
}

interface TabButtonProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    badge?: number;
    onClick: () => void;
}

function TabButton({ icon, label, isActive, badge, onClick }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
        >
            <div className="relative">
                {icon}
                {badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground rounded-full min-w-[16px] h-4 text-[10px] font-bold flex items-center justify-center px-0.5 leading-none">
                        {badge > 99 ? '99+' : badge}
                    </span>
                )}
            </div>
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );
}
