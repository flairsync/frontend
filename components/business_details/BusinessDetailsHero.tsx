import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Share2, Heart, Calendar, Check } from "lucide-react";
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
import { DiscoveryBusinessProfile } from "@/models/discovery/DiscoveryBusinessProfile";
import { useFavorites } from "@/features/favorites/useFavorites";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

interface BusinessDetailsHeroProps {
    profile: DiscoveryBusinessProfile;
}

const BusinessDetailsHero = ({ profile }: BusinessDetailsHeroProps) => {
    const { t } = useTranslation();
    const { addFavorite, removeFavorite } = useFavorites();
    const [copied, setCopied] = useState(false);

    const toggleFavorite = async () => {
        if (profile.isFavorite) {
            await removeFavorite(profile.id);
        } else {
            await addFavorite(profile.id);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        const shareData = {
            title: profile.name,
            text: profile.description || `Check out ${profile.name}`,
            url,
        };

        if (navigator.share && navigator.canShare?.(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (err: any) {
                // User cancelled — not an error worth toasting
                if (err.name !== "AbortError") toast.error("Couldn't open share sheet.");
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                toast.success("Link copied to clipboard!");
                setTimeout(() => setCopied(false), 2000);
            } catch {
                toast.error("Couldn't copy link.");
            }
        }
    };

    const bannerImages = profile.media.length > 0
        ? profile.media.map(m => m.url)
        : ["https://images.pexels.com/photos/33899554/pexels-photo-33899554.jpeg"];

    const addressLabel = profile.address || (profile.city ? `${profile.city}, ${profile.country?.name || ''}` : profile.country?.name || '');

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
                        {bannerImages.map((src, i) => (
                            <CarouselItem key={i}>
                                <div className="relative aspect-[21/9] w-full overflow-hidden rounded-[2.5rem] shadow-2xl">
                                    <img
                                        src={src}
                                        alt={profile.name}
                                        className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {bannerImages.length > 1 && (
                        <>
                            <div className="absolute top-1/2 -translate-y-1/2 left-4 md:left-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CarouselPrevious className="relative left-0 bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20" />
                            </div>
                            <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CarouselNext className="relative right-0 bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20" />
                            </div>
                        </>
                    )}
                </Carousel>

                {/* Quick Actions Float */}
                <div className="absolute top-6 right-6 flex gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleShare}
                        className="rounded-full bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 hover:scale-110 transition-all"
                    >
                        {copied ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleFavorite}
                        className={cn(
                            "rounded-full backdrop-blur-xl transition-all duration-300",
                            profile.isFavorite
                                ? "bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20"
                                : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-110"
                        )}
                    >
                        <Heart
                            size={18}
                            className={cn(
                                "transition-colors duration-300",
                                profile.isFavorite && "fill-current"
                            )}
                        />
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
                                {profile.type && (
                                    <Badge className="bg-primary/20 backdrop-blur-md border-primary/20 text-primary-foreground capitalize">
                                        {profile.type.name.replace('_', ' ')}
                                    </Badge>
                                )}
                                {profile.tags.slice(0, 2).map(tag => (
                                    <Badge key={tag.id} className="bg-white/10 backdrop-blur-md border-white/10 text-white">
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">{profile.name}</h1>
                                <div className="flex items-center gap-4 text-white/70">
                                    <div className="flex items-center gap-1">
                                        <MapPin size={16} className="text-primary" />
                                        <span className="text-sm">{addressLabel}</span>
                                    </div>
                                    {profile.rating !== null ? (
                                        <div className="flex items-center gap-1">
                                            <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                            <span className="text-sm font-bold text-white">{profile.rating}</span>
                                            {profile.reviewCount > 0 && (
                                                <span className="text-xs text-white/50">({profile.reviewCount} reviews)</span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-white/50">No reviews yet</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {profile.allowReservations && (
                            <Button
                                onClick={() => document.getElementById('reservation-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 hover:scale-105 transition-all text-lg font-bold"
                            >
                                <Calendar className="mr-2" size={20} />
                                {t("business_page.header.reserve_table_button")}
                            </Button>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Content for Mobile */}
            <div className="md:hidden space-y-6 px-2">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <MapPin size={14} />
                        <span>{addressLabel}</span>
                    </div>
                </div>

                {profile.description && (
                    <p className="text-muted-foreground leading-relaxed">
                        {profile.description}
                    </p>
                )}

                <div className="flex flex-wrap gap-2">
                    {profile.type && <Badge variant="secondary" className="rounded-full capitalize">{profile.type.name.replace('_', ' ')}</Badge>}
                    {profile.tags.map(tag => (
                        <Badge key={tag.id} variant="secondary" className="rounded-full">{tag.name}</Badge>
                    ))}
                </div>

                {profile.allowReservations && (
                    <Button
                        onClick={() => document.getElementById('reservation-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/10"
                    >
                        {t("business_page.header.reserve_table_button")}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default BusinessDetailsHero;

