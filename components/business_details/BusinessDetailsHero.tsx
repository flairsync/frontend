import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Share2, Heart, Calendar } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const BusinessDetailsHero = () => {
    const { t } = useTranslation();

    return (
        <div className="relative space-y-8">
            {/* Carousel Section */}
            <div className="relative group">
                <Carousel
                    orientation="horizontal"
                    plugins={[Autoplay({ delay: 5000 })]}
                    className="w-full"
                >
                    <CarouselContent>
                        {[1, 2, 3].map((_, i) => (
                            <CarouselItem key={i}>
                                <div className="relative aspect-[21/9] w-full overflow-hidden rounded-[2.5rem] shadow-2xl">
                                    <img
                                        src="https://images.pexels.com/photos/33899554/pexels-photo-33899554.jpeg"
                                        alt="Restaurant"
                                        className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="absolute top-1/2 -translate-y-1/2 left-4 md:left-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CarouselPrevious className="relative left-0 bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20" />
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CarouselNext className="relative right-0 bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20" />
                    </div>
                </Carousel>

                {/* Quick Actions Float */}
                <div className="absolute top-6 right-6 flex gap-3">
                    <Button variant="outline" size="icon" className="rounded-full bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 hover:scale-110 transition-all">
                        <Share2 size={18} />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 hover:scale-110 transition-all">
                        <Heart size={18} />
                    </Button>
                </div>

                {/* Glass Info Overlay - Desktop */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="absolute bottom-10 left-10 right-10 hidden md:block"
                >
                    <div className="flex justify-between items-end p-8 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] shadow-2xl">
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Badge className="bg-primary/20 backdrop-blur-md border-primary/20 text-primary-foreground">Halal</Badge>
                                <Badge className="bg-primary/20 backdrop-blur-md border-primary/20 text-primary-foreground">Vegan Options</Badge>
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">Cafe Montserrat</h1>
                                <div className="flex items-center gap-4 text-white/70">
                                    <div className="flex items-center gap-1">
                                        <MapPin size={16} className="text-primary" />
                                        <span className="text-sm">Andorra la Vella, Andorra</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-sm font-bold text-white">4.8</span>
                                        <span className="text-xs text-white/50">(1.2k+ reviews)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 hover:scale-105 transition-all text-lg font-bold">
                            <Calendar className="mr-2" size={20} />
                            {t("business_page.header.reserve_table_button")}
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Content for Mobile */}
            <div className="md:hidden space-y-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold tracking-tight">Cafe Montserrat</h1>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <MapPin size={14} />
                        <span>Andorra la Vella, Andorra</span>
                    </div>
                </div>

                <p className="text-muted-foreground leading-relaxed">
                    Cozy place with a great atmosphere, perfect for coffee and pastries in the heart of the city.
                </p>

                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="rounded-full">Halal</Badge>
                    <Badge variant="secondary" className="rounded-full">Vegan</Badge>
                    <Badge variant="secondary" className="rounded-full">Family Friendly</Badge>
                </div>

                <Button className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/10">
                    {t("business_page.header.reserve_table_button")}
                </Button>
            </div>
        </div>
    );
};

export default BusinessDetailsHero;

