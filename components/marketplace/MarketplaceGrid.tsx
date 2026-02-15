import React from 'react';
import { MarketplaceItem } from './types';
import { MarketplaceCard } from './MarketplaceCard';
import { motion } from 'framer-motion';

interface MarketplaceGridProps {
    items: MarketplaceItem[];
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({ items }) => {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                <div className="text-6xl text-muted-foreground opacity-20">🔎</div>
                <h3 className="text-2xl font-bold">No items found</h3>
                <p className="text-muted-foreground max-w-md">
                    We couldn't find any items matching your current filters. Try selecting a different category or marketplace type.
                </p>
            </div>
        );
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6"
        >
            {items.map((item) => (
                <motion.div key={item.id} variants={itemAnim}>
                    <MarketplaceCard item={item} />
                </motion.div>
            ))}
        </motion.div>
    );
};
