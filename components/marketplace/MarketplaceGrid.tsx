import React from 'react';
import { useTranslation } from 'react-i18next';
import { MarketplaceItem } from '@/models/MarketplaceItem';
import { MarketplaceCard } from './MarketplaceCard';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

interface MarketplaceGridProps {
    items: MarketplaceItem[];
    search?: string;
    onSearchChange?: (val: string) => void;
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
}

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({
    items,
    search,
    onSearchChange,
    currentPage = 1,
    totalPages = 1,
    onPageChange,
}) => {
    const { t } = useTranslation('marketplace');
    const showPagination = totalPages > 1 && onPageChange;

    return (
        <div className="flex flex-col gap-4">
            {onSearchChange !== undefined && (
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                        value={search ?? ''}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={t('grid.search_placeholder')}
                        className="pl-9 bg-secondary/10 border-white/10"
                    />
                </div>
            )}

            {items.length === 0 ? (
                <EmptyState
                    size={120}
                    title={t('grid.empty_title')}
                    description={
                        search
                            ? t('grid.empty_search_description', { search })
                            : t('grid.empty_no_items_description')
                    }
                    className="py-20"
                />
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    {items.map((item) => (
                        <motion.div key={item.id} variants={itemAnim}>
                            <MarketplaceCard item={item} />
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {showPagination && (
                <div className="flex items-center justify-center gap-3 pt-4">
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage <= 1}
                        onClick={() => onPageChange(currentPage - 1)}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {t('grid.page_of', { page: currentPage, totalPages })}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage >= totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
};
