import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Autoplay from "embla-carousel-autoplay";
import { MapPin, Phone, Mail, Facebook, Instagram, Globe, Star } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeComponentProps } from "../registry";
import { sortOpeningHours, formatOpeningPeriod, formatMenuPrice, getOrderedMedia } from "../utils";

// Cream + burgundy, serif display type, symmetric/centered, decorative
// card-and-border chrome — the "traditional restaurant" identity. Distinct
// from Modern Minimal (monochrome/left-aligned/no chrome) and Warm Bistro
// (rounded/asymmetric/photo-led).
const TOKENS = {
    "--t-bg": "#faf6ee",
    "--t-fg": "#2a2422",
    "--t-muted": "#f0e9db",
    "--t-muted-fg": "#7a6f63",
    "--t-border": "#ddd0b8",
    "--t-accent": "#7a2331",
} as CSSProperties;

const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { delay, duration: 0.6, ease: "easeOut" as const },
});

export function ClassicTheme({ profile, menu }: ThemeComponentProps) {
    const { t } = useTranslation("feed");

    const media = getOrderedMedia(profile.media);
    const hours = sortOpeningHours(profile.openingHours);
    const categories = menu?.getOrderedCategories().filter((c) => (c.items?.length ?? 0) > 0) ?? [];
    const hasMenu = categories.length > 0;
    const addressLabel = profile.address || (profile.city ? `${profile.city}, ${profile.country?.name || ""}` : profile.country?.name || "");

    return (
        <main style={TOKENS} className="min-h-screen bg-[var(--t-bg)] text-[var(--t-fg)] font-serif">
            {/* Hero */}
            <header className="px-6 py-24 text-center bg-[var(--t-muted)] border-b border-[var(--t-border)]">
                <div className="max-w-2xl mx-auto flex flex-col items-center">
                    {profile.logo && (
                        <motion.img
                            {...fadeUp(0)}
                            src={profile.logo}
                            alt={profile.name}
                            className="w-20 h-20 rounded-full object-cover border-2 border-[var(--t-accent)] mb-6"
                        />
                    )}
                    <motion.h1 {...fadeUp(0.1)} className="text-4xl md:text-6xl font-bold tracking-tight">
                        {profile.name}
                    </motion.h1>
                    <motion.div {...fadeUp(0.15)} className="mt-4 flex items-center gap-3">
                        <span className="h-px w-10 bg-[var(--t-accent)]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--t-accent)]" />
                        <span className="h-px w-10 bg-[var(--t-accent)]" />
                    </motion.div>
                    {profile.description && (
                        <motion.p {...fadeUp(0.2)} className="mt-6 text-[var(--t-muted-fg)] leading-relaxed">
                            {profile.description}
                        </motion.p>
                    )}
                    <motion.div {...fadeUp(0.3)} className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-[var(--t-muted-fg)]">
                        {profile.rating !== null && (
                            <span className="inline-flex items-center gap-1">
                                <Star size={14} className="fill-[var(--t-accent)] text-[var(--t-accent)]" />
                                {profile.rating}
                                {profile.reviewCount > 0 && <span>({profile.reviewCount})</span>}
                            </span>
                        )}
                        {addressLabel && (
                            <span className="inline-flex items-center gap-1">
                                <MapPin size={14} /> {addressLabel}
                            </span>
                        )}
                    </motion.div>

                    {(profile.allowReservations || profile.allowOrders) && (
                        <motion.div {...fadeUp(0.4)} className="mt-10 flex flex-wrap items-center justify-center gap-4">
                            {profile.allowReservations && (
                                <a
                                    href={`/business/${profile.id}`}
                                    className="px-8 py-3 rounded-none border-2 border-[var(--t-accent)] bg-[var(--t-accent)] text-[var(--t-bg)] text-sm tracking-wide hover:opacity-90 transition-opacity"
                                >
                                    {t("business_page.header.reserve_table_button", "Reserve a Table")}
                                </a>
                            )}
                            {profile.allowOrders && (
                                <a
                                    href={`/diner/${profile.id}`}
                                    className="px-8 py-3 rounded-none border-2 border-[var(--t-accent)] text-[var(--t-accent)] text-sm tracking-wide hover:bg-[var(--t-accent)] hover:text-[var(--t-bg)] transition-colors"
                                >
                                    {t("business_page.header.order_online_button", "Order Online")}
                                </a>
                            )}
                        </motion.div>
                    )}
                </div>
            </header>

            {/* Gallery */}
            {media.length > 0 && (
                <section className="px-6 py-20 max-w-3xl mx-auto">
                    <div className="border-8 border-[var(--t-muted)] shadow-lg">
                        <Carousel plugins={[Autoplay({ delay: 5000 })]}>
                            <CarouselContent>
                                {media.map((m) => (
                                    <CarouselItem key={m.id}>
                                        <div className="aspect-[4/3] w-full overflow-hidden">
                                            <img src={m.url} alt={profile.name} loading="lazy" className="w-full h-full object-cover" />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            {media.length > 1 && (
                                <>
                                    <CarouselPrevious className="left-4 bg-[var(--t-bg)]/90 border-[var(--t-accent)] text-[var(--t-accent)] rounded-none hover:bg-[var(--t-accent)] hover:text-[var(--t-bg)]" />
                                    <CarouselNext className="right-4 bg-[var(--t-bg)]/90 border-[var(--t-accent)] text-[var(--t-accent)] rounded-none hover:bg-[var(--t-accent)] hover:text-[var(--t-bg)]" />
                                </>
                            )}
                        </Carousel>
                    </div>
                </section>
            )}

            {/* Menu */}
            {hasMenu && (
                <section className="px-6 py-20 max-w-3xl mx-auto">
                    <h2 className="text-3xl text-center font-bold mb-14">
                        {t("business_page.menu.section_title", "Menu")}
                    </h2>
                    <div className="space-y-10">
                        {categories.map((category, i) => (
                            <motion.div key={category.id} {...fadeUp(i * 0.05)}>
                                <Card className="border-[var(--t-border)] bg-[var(--t-bg)] text-[var(--t-fg)] rounded-none shadow-none">
                                    <CardContent className="p-8">
                                        <h3 className="text-center text-xl font-bold mb-6 flex items-center gap-4 justify-center">
                                            <span className="h-px flex-1 max-w-16 bg-[var(--t-border)]" />
                                            {category.name}
                                            <span className="h-px flex-1 max-w-16 bg-[var(--t-border)]" />
                                        </h3>
                                        <ul className="space-y-4">
                                            {(category.items ?? []).map((item) => (
                                                <li key={item.id}>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="font-medium">{item.name}</span>
                                                        <span className="flex-1 border-b border-dotted border-[var(--t-muted-fg)] mx-1 translate-y-[-3px]" />
                                                        <span className="font-medium whitespace-nowrap">
                                                            {formatMenuPrice(item.price, profile.currency)}
                                                        </span>
                                                    </div>
                                                    {item.description && (
                                                        <p className="text-sm text-[var(--t-muted-fg)] mt-1">{item.description}</p>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Opening hours */}
            {hours.length > 0 && (
                <section className="px-6 py-20 max-w-2xl mx-auto">
                    <h2 className="text-3xl text-center font-bold mb-14">
                        {t("business_page.timing.section_title", "Opening Hours")}
                    </h2>
                    <Card className="border-[var(--t-border)] bg-[var(--t-muted)] rounded-none shadow-none">
                        <CardContent className="p-8 divide-y divide-[var(--t-border)]">
                            {hours.map((day) => (
                                <div key={day.id} className="flex justify-between items-center py-3">
                                    <span className="capitalize font-medium">{t(`shared.days.${day.day.toLowerCase()}`, day.day)}</span>
                                    {day.isClosed ? (
                                        <span className="italic text-[var(--t-muted-fg)]">{t("business_page.timing.closed", "Closed")}</span>
                                    ) : (
                                        <span className="text-right text-sm">
                                            {day.periods.map((p) => (
                                                <span key={p.id} className="block">{formatOpeningPeriod(p)}</span>
                                            ))}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>
            )}

            {/* Contact / footer */}
            <footer className="px-6 py-16 border-t border-[var(--t-border)] bg-[var(--t-muted)]">
                <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 text-center md:text-left">
                    <div className="space-y-3">
                        {addressLabel && <p className="flex items-center justify-center md:justify-start gap-2"><MapPin size={16} className="text-[var(--t-accent)]" /> {addressLabel}</p>}
                        {profile.phone && <p className="flex items-center justify-center md:justify-start gap-2"><Phone size={16} className="text-[var(--t-accent)]" /> {profile.phone}</p>}
                        {profile.email && <p className="flex items-center justify-center md:justify-start gap-2"><Mail size={16} className="text-[var(--t-accent)]" /> {profile.email}</p>}
                    </div>
                    <div className="flex items-center justify-center md:justify-end gap-4">
                        {profile.facebook && <a href={profile.facebook} target="_blank" rel="noreferrer" className="text-[var(--t-accent)]"><Facebook size={20} /></a>}
                        {profile.instagram && <a href={profile.instagram} target="_blank" rel="noreferrer" className="text-[var(--t-accent)]"><Instagram size={20} /></a>}
                        {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="text-[var(--t-accent)]"><Globe size={20} /></a>}
                    </div>
                </div>
            </footer>
        </main>
    );
}
