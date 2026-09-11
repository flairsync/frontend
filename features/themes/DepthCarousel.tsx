import { ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

// Shared "coverflow" behavior for the Andorra themes' gallery carousels —
// tracks the selected slide and hands each theme a signed `offset` (0 =
// centered, -1/+1 = adjacent on either side, taking the shortest way round
// when looped) so it can style depth its own way (Alpine's frosted recede,
// Pyrenean's ridgeline skew, Vall Antiga's slow plaque rail) without three
// copies of the embla api-tracking boilerplate.
export function DepthCarousel<T>({
    items,
    renderItem,
    itemClassName,
    autoplayDelay = 4500,
    depthStyle,
}: {
    items: T[];
    renderItem: (item: T, index: number, offset: number) => ReactNode;
    itemClassName?: string;
    autoplayDelay?: number;
    depthStyle: (offset: number) => { scale: number; opacity: number; rotateY: number };
}) {
    const [api, setApi] = useState<CarouselApi>();
    const [selected, setSelected] = useState(0);

    useEffect(() => {
        if (!api) return;
        const onSelect = () => setSelected(api.selectedScrollSnap());
        onSelect();
        api.on("select", onSelect);
        api.on("reInit", onSelect);
        return () => {
            api.off("select", onSelect);
        };
    }, [api]);

    return (
        <Carousel
            setApi={setApi}
            opts={{ loop: items.length > 2, align: "center" }}
            plugins={[Autoplay({ delay: autoplayDelay, stopOnInteraction: true })]}
            className="[perspective:1200px]"
        >
            <CarouselContent className="!ml-0 items-center">
                {items.map((item, i) => {
                    const n = items.length;
                    let offset = i - selected;
                    if (offset > n / 2) offset -= n;
                    if (offset < -n / 2) offset += n;
                    const { scale, opacity, rotateY } = depthStyle(offset);
                    return (
                        <CarouselItem key={i} className={`!pl-0 basis-auto flex justify-center ${itemClassName ?? ""}`}>
                            <motion.div
                                animate={{ scale, opacity, rotateY }}
                                transition={{ duration: 0.45, ease: "easeOut" }}
                                style={{ transformPerspective: 1200 }}
                            >
                                {renderItem(item, i, offset) as ReactNode}
                            </motion.div>
                        </CarouselItem>
                    );
                })}
            </CarouselContent>
        </Carousel>
    );
}
