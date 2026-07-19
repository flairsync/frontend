import React, { useRef, useEffect, useState } from 'react';
import { Plus, AlertCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { BusinessMenu } from '@/models/business/menu/BusinessMenu';
import { BusinessMenuItem } from '@/models/business/menu/BusinessMenuItem';
import { useDinerModeStore } from '@/features/diner-mode/DinerModeStore';
import DinerMenuItemSheet from './DinerMenuItemSheet';
import DinerCartFab from './DinerCartFab';

interface DinerMenuTabProps {
    menu: BusinessMenu;
    canOrder: boolean;
}

export default function DinerMenuTab({ menu, canOrder }: DinerMenuTabProps) {
    const { t } = useTranslation('diner');
    const { openItemSheet, selectedItem, closeItemSheet } = useDinerModeStore();
    const [activeCategoryId, setActiveCategoryId] = useState<string>('');
    const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const isManualScrollRef = useRef(false);

    const categories = menu.getOrderedCategories().filter(
        (c) => (c.items?.length ?? 0) > 0
    );

    useEffect(() => {
        if (categories.length > 0 && !activeCategoryId) {
            setActiveCategoryId(categories[0].id);
        }
    }, [categories.length]);

    const scrollToCategory = (categoryId: string) => {
        const el = categoryRefs.current[categoryId];
        if (!el) return;
        isManualScrollRef.current = true;
        setActiveCategoryId(categoryId);
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => { isManualScrollRef.current = false; }, 800);
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (isManualScrollRef.current) return;
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveCategoryId(entry.target.id);
                    }
                });
            },
            { root: container, rootMargin: '-20% 0px -70% 0px', threshold: 0 }
        );

        Object.values(categoryRefs.current).forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [categories.length]);

    return (
        <div className="flex flex-col h-full">
            <div className="sticky top-14 z-30 bg-background border-b border-border/40 overflow-x-auto scrollbar-hide">
                <div className="flex gap-1 px-4 py-2 w-max">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => scrollToCategory(cat.id)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                                activeCategoryId === cat.id
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pb-32">
                <div className="px-4 py-4 space-y-8">
                    {!canOrder && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{t('menu_tab.ordering_unavailable_title')}</AlertTitle>
                            <AlertDescription>{t('menu_tab.ordering_unavailable_description')}</AlertDescription>
                        </Alert>
                    )}
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            id={category.id}
                            ref={(el) => { categoryRefs.current[category.id] = el; }}
                        >
                            <h3 className="text-base font-bold mb-3">{category.name}</h3>
                            <div className="space-y-3">
                                {category.items?.map((menuItem) => (
                                    <MenuItemCard
                                        key={menuItem.id}
                                        item={menuItem}
                                        canOrder={canOrder}
                                        onAdd={() => openItemSheet(menuItem)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {canOrder && (
                <>
                    <DinerMenuItemSheet item={selectedItem} onClose={closeItemSheet} />
                    <DinerCartFab />
                </>
            )}
        </div>
    );
}

interface MenuItemCardProps {
    item: BusinessMenuItem;
    canOrder: boolean;
    onAdd: () => void;
}

function MenuItemCard({ item, canOrder, onAdd }: MenuItemCardProps) {
    const { t } = useTranslation('diner');
    const image = item.media?.[0]?.url;
    const isUnavailable = (item as any).isAvailable === false;
    const isSelectable = canOrder && !isUnavailable;

    return (
        <div
            role={isSelectable ? "button" : undefined}
            tabIndex={isSelectable ? 0 : undefined}
            onClick={isSelectable ? onAdd : undefined}
            onKeyDown={isSelectable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAdd(); } } : undefined}
            className={cn(
                "flex gap-3 rounded-2xl border p-3 bg-card transition-opacity",
                isSelectable && "cursor-pointer active:bg-muted/50",
                isUnavailable && "opacity-50 pointer-events-none"
            )}
        >
            {image && (
                <img
                    src={image}
                    alt={item.name}
                    loading="lazy"
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
            )}

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold leading-snug">{item.name}</p>
                        {item.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {item.description}
                            </p>
                        )}
                        {item.allergies && item.allergies.length > 0 && (
                            <p className="text-[10px] text-amber-600 mt-0.5 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                                <span className="line-clamp-1">
                                    {t('menu_tab.contains_allergens')}: {item.allergies.map((a) => a.name).join(', ')}
                                </span>
                            </p>
                        )}
                        {item.isBundle && item.bundleComponentDetails && item.bundleComponentDetails.length > 0 && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                                {t('menu_tab.includes_label')}: {item.bundleComponentDetails.map((c) => `${c.name} ×${c.quantity}`).join(', ')}
                            </p>
                        )}
                    </div>
                    {isUnavailable && (
                        <Badge variant="secondary" className="text-xs shrink-0">{t('menu_tab.unavailable')}</Badge>
                    )}
                </div>

                <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold">
                        ${item.price.toFixed(2)}
                    </span>
                    {canOrder && !isUnavailable && (
                        <Button
                            size="icon"
                            className="h-9 w-9 rounded-full shrink-0"
                            onClick={onAdd}
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
