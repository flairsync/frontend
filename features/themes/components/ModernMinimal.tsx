import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { PhotoProvider } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { MapPin, Phone, Mail, Facebook, Instagram, Globe, Star } from "lucide-react";
import { ThemeComponentProps } from "../registry";
import { GalleryImage } from "@/components/shared/GalleryImage";
import { sortOpeningHours, formatOpeningPeriod, formatMenuPrice, getOrderedMedia } from "../utils";

// Monochrome, high-contrast, sharp edges — no rounded pills, no color
// accents beyond foreground/background. Distinct from Classic (warm/serif/
// symmetric) and Warm Bistro (rounded/asymmetric/color) by deliberate
// restraint.
const TOKENS = {
    "--t-bg": "#ffffff",
    "--t-fg": "#0a0a0a",
    "--t-muted": "#f4f4f5",
    "--t-muted-fg": "#71717a",
    "--t-border": "#e4e4e7",
} as CSSProperties;

export function ModernMinimalTheme({ profile, menu }: ThemeComponentProps) {
    const { t } = useTranslation("feed");

    const media = getOrderedMedia(profile.media);
    const hours = sortOpeningHours(profile.openingHours);
    const categories = menu?.getOrderedCategories().filter((c) => (c.items?.length ?? 0) > 0) ?? [];
    const hasMenu = categories.length > 0;
    const addressLabel = profile.address || (profile.city ? `${profile.city}, ${profile.country?.name || ""}` : profile.country?.name || "");
    const showCtaBar = profile.allowReservations || profile.allowOrders;

    return (
        <main style={TOKENS} className="min-h-screen bg-[var(--t-bg)] text-[var(--t-fg)]">
            {/* Hero */}
            <motion.header
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="px-6 md:px-16 pt-20 pb-14 max-w-5xl"
            >
                {profile.logo && (
                    <img
                        src={profile.logo}
                        alt=""
                        className="w-14 h-14 object-cover mb-8 grayscale"
                    />
                )}
                <h1 className="text-5xl md:text-8xl font-bold tracking-tight leading-[0.95]">
                    {profile.name}
                </h1>
                {profile.description && (
                    <p className="mt-6 text-lg text-[var(--t-muted-fg)] max-w-2xl">
                        {profile.description}
                    </p>
                )}
                <div className="mt-8 h-px w-full bg-[var(--t-border)]" />
                <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[var(--t-muted-fg)]">
                    {profile.rating !== null && (
                        <span className="inline-flex items-center gap-1 text-[var(--t-fg)] font-medium">
                            <Star size={14} className="fill-current" />
                            {profile.rating}
                            {profile.reviewCount > 0 && <span className="text-[var(--t-muted-fg)] font-normal">({profile.reviewCount})</span>}
                        </span>
                    )}
                    {profile.rating !== null && addressLabel && <span>&middot;</span>}
                    {addressLabel && <span>{addressLabel}</span>}
                    {profile.tags.slice(0, 3).map((tag) => (
                        <span key={tag.id}>&middot; {tag.name}</span>
                    ))}
                </div>
            </motion.header>

            {/* Gallery */}
            {media.length > 0 && (
                <section className="pb-14">
                    <PhotoProvider>
                        <div className="flex gap-px overflow-x-auto px-6 md:px-16">
                            {media.map((m) => (
                                <GalleryImage key={m.id} url={m.url} blurHash={m.blurHash} />
                            ))}
                        </div>
                    </PhotoProvider>
                </section>
            )}

            {/* Menu */}
            {hasMenu && (
                <section className="px-6 md:px-16 py-14 border-t border-[var(--t-border)]">
                    <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--t-muted-fg)] mb-10">
                        {t("business_page.menu.section_title", "Menu")}
                    </h2>
                    <div className="space-y-12 max-w-3xl">
                        {categories.map((category, i) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <h3 className="text-xs uppercase tracking-[0.2em] text-[var(--t-muted-fg)] mb-4">
                                    {category.name}
                                </h3>
                                <ul className="space-y-4">
                                    {(category.items ?? []).map((item) => (
                                        <li key={item.id} className="flex justify-between gap-6">
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                {item.description && (
                                                    <p className="text-sm text-[var(--t-muted-fg)] mt-0.5">{item.description}</p>
                                                )}
                                            </div>
                                            <span className="whitespace-nowrap font-medium">
                                                {formatMenuPrice(item.price, profile.currency)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Opening hours */}
            {hours.length > 0 && (
                <section className="px-6 md:px-16 py-14 border-t border-[var(--t-border)]">
                    <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--t-muted-fg)] mb-10">
                        {t("business_page.timing.section_title", "Opening Hours")}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-3 max-w-3xl">
                        {hours.map((day) => (
                            <div key={day.id} className="flex justify-between text-sm py-2 border-b border-[var(--t-border)]">
                                <span className="capitalize">{t(`shared.days.${day.day.toLowerCase()}`, day.day)}</span>
                                {day.isClosed ? (
                                    <span className="text-[var(--t-muted-fg)]">{t("business_page.timing.closed", "Closed")}</span>
                                ) : (
                                    <span className="text-right">
                                        {day.periods.map((p, i) => (
                                            <span key={p.id} className="block">{formatOpeningPeriod(p)}</span>
                                        ))}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Contact / footer */}
            <footer className="px-6 md:px-16 py-14 border-t border-[var(--t-border)] grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                <div className="space-y-2">
                    {addressLabel && (
                        <p className="flex items-center gap-2 text-[var(--t-muted-fg)]"><MapPin size={14} /> {addressLabel}</p>
                    )}
                </div>
                <div className="space-y-2">
                    {profile.phone && <p className="flex items-center gap-2 text-[var(--t-muted-fg)]"><Phone size={14} /> {profile.phone}</p>}
                    {profile.email && <p className="flex items-center gap-2 text-[var(--t-muted-fg)]"><Mail size={14} /> {profile.email}</p>}
                </div>
                <div className="flex gap-4">
                    {profile.facebook && <a href={profile.facebook} target="_blank" rel="noreferrer" className="text-[var(--t-muted-fg)] hover:text-[var(--t-fg)]"><Facebook size={16} /></a>}
                    {profile.instagram && <a href={profile.instagram} target="_blank" rel="noreferrer" className="text-[var(--t-muted-fg)] hover:text-[var(--t-fg)]"><Instagram size={16} /></a>}
                    {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="text-[var(--t-muted-fg)] hover:text-[var(--t-fg)]"><Globe size={16} /></a>}
                </div>
            </footer>

            {showCtaBar && <div className="h-20" />}

            {/* Sticky CTA bar */}
            {showCtaBar && (
                <div className="fixed bottom-0 inset-x-0 border-t border-[var(--t-border)] bg-[var(--t-bg)] px-6 md:px-16 py-4 flex gap-3 justify-center md:justify-end">
                    {profile.allowReservations && (
                        <a
                            href={`/business/${profile.id}`}
                            className="px-6 py-3 text-sm font-medium bg-[var(--t-fg)] text-[var(--t-bg)] hover:opacity-90 transition-opacity"
                        >
                            {t("business_page.header.reserve_table_button", "Reserve a Table")}
                        </a>
                    )}
                    {profile.allowOrders && (
                        <a
                            href={`/diner/${profile.id}`}
                            className="px-6 py-3 text-sm font-medium border border-[var(--t-fg)] hover:bg-[var(--t-muted)] transition-colors"
                        >
                            {t("business_page.header.order_online_button", "Order Online")}
                        </a>
                    )}
                </div>
            )}
        </main>
    );
}
