import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketplaceItem } from '@/models/MarketplaceItem';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

interface MarketplaceCardProps {
    item: MarketplaceItem;
}

export const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ item }) => {
    const isSaaS = item.type === 'saas';
    const detailUrl = `/marketplace/${item.type || 'saas'}/${item.id}`;

    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    React.useEffect(() => {
        if (!api) return;
        setCurrent(api.selectedScrollSnap() + 1);
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    const hasImages = item.images && item.images.length > 0;
    const isMultiple = item.images && item.images.length > 1;

    const innerCard = (
        <Card className="h-full flex flex-col overflow-hidden border-none bg-secondary/20 hover:bg-secondary/40 transition-all duration-300 relative">
            {/* Standardized Aspect Ratio for Images */}
            <div className="relative aspect-video w-full overflow-hidden shrink-0 bg-secondary/10 group/carousel">
                {isMultiple ? (
                    <Carousel setApi={setApi} className="w-full h-full cursor-grab active:cursor-grabbing">
                        <CarouselContent className="h-full ml-0">
                            {item.images.map((img, idx) => (
                                <CarouselItem key={idx} className="h-full pl-0 relative">
                                    <img
                                        src={img}
                                        alt={`${item.name} - Image ${idx + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                ) : hasImages ? (
                    <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/30 flex items-center justify-center">
                        <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all">📦</span>
                    </div>
                )}

                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Image counter if there are multiple images */}
                {isMultiple && (
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md rounded-full px-2 py-0.5 text-[10px] text-white">
                        {current} / {item.images.length}
                    </div>
                )}
                {/* Offline badge */}
                {!item.isActive && (
                    <div className="absolute top-2 right-2 bg-destructive/80 backdrop-blur-md rounded-sm px-2 py-0.5 text-[10px] text-white font-bold uppercase pointer-events-none">
                        Unavailable
                    </div>
                )}
            </div>

            <CardHeader className="p-4 pb-0 items-start gap-1">
                <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">{item.category || 'Item'}</span>
                <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">{item.name}</h3>
            </CardHeader>

            <CardContent className="p-4 pt-1 flex-1">
                <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed opacity-80">
                    {item.description}
                </p>
            </CardContent>

            {/* Footer: Price and Add to Cart */}
            <div className="flex items-center justify-between px-4 pb-4 pt-2 mt-auto shrink-0 relative z-10 bg-background/5">
                <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Price</span>
                    <span className="font-semibold text-sm text-foreground/90">{item.currency || '$'}{item.price.toFixed(2)}</span>
                </div>
                <Button
                    size="icon"
                    className="rounded-full w-9 h-9 shadow-sm transition-transform hover:scale-105 relative z-20"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // TODO: Implement actual Add to Cart logic
                    }}
                >
                    <ShoppingCart className="w-4 h-4 cursor-pointer" />
                </Button>
            </div>
        </Card>
    );

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="h-full group"
        >
            <a href={detailUrl} className="block h-full no-underline">
                {innerCard}
            </a>
        </motion.div>
    );
};
