import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketplaceItem } from './types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

interface MarketplaceCardProps {
    item: MarketplaceItem;
}

export const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ item }) => {
    const isSaaS = item.type === 'saas';
    const detailUrl = isSaaS ? `/marketplace/saas/${item.id}` : '#';

    const CardWrapper = ({ children }: { children: React.ReactNode }) => (
        isSaaS ? <a href={detailUrl} className="block h-full no-underline">{children}</a> : <div className="h-full">{children}</div>
    );

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="h-full group"
        >
            <CardWrapper>
                <Card className="h-full flex flex-col overflow-hidden border-none bg-secondary/20 hover:bg-secondary/40 transition-all duration-300 relative">
                    {/* Standardized Aspect Ratio for Images */}
                    <div className="relative aspect-video w-full overflow-hidden shrink-0 bg-secondary/10">
                        {item.image ? (
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/30 flex items-center justify-center">
                                <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all">📦</span>
                            </div>
                        )}

                        {/* Subtle overlay on hover */}
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <CardHeader className="p-4 pb-0 items-start gap-1">
                        <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">{item.category || 'featured'}</span>
                        <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">{item.name}</h3>
                    </CardHeader>

                    <CardContent className="p-4 pt-1 flex-1">
                        <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed opacity-80">
                            {item.description}
                        </p>
                    </CardContent>

                    {/* Footer: price and click CTA appear on hover */}
                    <div className="relative h-14 overflow-hidden px-4 mb-1 shrink-0">
                        <AnimatePresence>
                            <motion.div
                                className="flex items-center justify-between w-full absolute inset-x-0 px-4 bottom-3"
                                initial={{ opacity: 0, y: 10 }}
                                whileHover={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Starting at</span>
                                    <span className="font-semibold text-sm">{item.currency}{item.price.toFixed(2)}</span>
                                </div>
                                <Button size="icon" variant="secondary" className="rounded-full w-8 h-8 group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-md shadow-primary/10 pointer-events-none">
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                </Button>
                            </motion.div>
                        </AnimatePresence>

                        {/* Static price display when not hovering */}
                        <motion.div
                            className="absolute inset-x-0 bottom-3 px-4 flex items-center justify-between"
                            animate={{ opacity: 1 }}
                            whileHover={{ opacity: 0 }}
                        >
                            <span className="font-semibold text-sm text-foreground/80">{item.currency}{item.price.toFixed(2)}</span>
                        </motion.div>
                    </div>
                </Card>
            </CardWrapper>
        </motion.div>
    );
};
