import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { MapPin, Phone, Mail, Facebook, Instagram, Globe, Star } from "lucide-react";
import { ThemeComponentProps } from "../registry";
import { sortOpeningHours, formatOpeningPeriod, formatMenuPrice, getOrderedMedia } from "../utils";

// Terracotta/amber, rounded organic shapes, cozy asymmetric layout — the
// "cafe/bistro" identity. Distinct from Modern Minimal (flat/monochrome) and
// Classic (symmetric/serif) via warmth, tilt, and rounded chrome.
const TOKENS = {
    "--t-bg": "#fdf6ee",
    "--t-fg": "#3b2a1e",
    "--t-muted": "#f4e3ce",
    "--t-muted-fg": "#8a6f56",
    "--t-accent": "#c1633b",
    "--t-accent-fg": "#fff8f0",
} as CSSProperties;

// Varying aspect ratios for the masonry-ish grid, cycled by index.
const TILE_ASPECT = ["aspect-square", "aspect-[4/5]", "aspect-[4/5]", "aspect-square"];

export function WarmBistroTheme({ profile, menu }: ThemeComponentProps) {
    const { t } = useTranslation("feed");

    const media = getOrderedMedia(profile.media);
    const hours = sortOpeningHours(profile.openingHours);
    const categories = menu?.getOrderedCategories().filter((c) => (c.items?.length ?? 0) > 0) ?? [];
    const hasMenu = categories.length > 0;
    const addressLabel = profile.address || (profile.city ? `${profile.city}, ${profile.country?.name || ""}` : profile.country?.name || "");
    const heroImage = media[0];
    const today = dayjs().format("dddd").toLowerCase();

    return (
        <main style={TOKENS} className="min-h-screen bg-[var(--t-bg)] text-[var(--t-fg)]">
            {/* Hero */}
            <header className="px-6 md:px-16 py-16 md:py-24 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="order-2 md:order-1"
                >
                    {profile.logo && (
                        <img src={profile.logo} alt="" className="w-16 h-16 rounded-2xl object-cover mb-6 shadow-md" />
                    )}
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{profile.name}</h1>
                    {profile.description && (
                        <p className="mt-4 text-[var(--t-muted-fg)] leading-relaxed max-w-md">{profile.description}</p>
                    )}
                    <div className="mt-6 flex flex-wrap items-center gap-2">
                        {profile.rating !== null && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--t-muted)] px-3 py-1 text-sm font-medium">
                                <Star size={14} className="fill-[var(--t-accent)] text-[var(--t-accent)]" />
                                {profile.rating}
                                {profile.reviewCount > 0 && <span className="text-[var(--t-muted-fg)] font-normal">({profile.reviewCount})</span>}
                            </span>
                        )}
                        {addressLabel && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--t-muted)] px-3 py-1 text-sm">
                                <MapPin size={14} /> {addressLabel}
                            </span>
                        )}
                        {profile.tags.slice(0, 2).map((tag) => (
                            <span key={tag.id} className="rounded-full bg-[var(--t-muted)] px-3 py-1 text-sm">{tag.name}</span>
                        ))}
                    </div>

                    {(profile.allowReservations || profile.allowOrders) && (
                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            {profile.allowReservations && (
                                <a
                                    href={`/business/${profile.id}`}
                                    className="px-8 py-3.5 rounded-full bg-[var(--t-accent)] text-[var(--t-accent-fg)] font-medium text-center shadow-md hover:opacity-90 transition-opacity"
                                >
                                    {t("business_page.header.reserve_table_button", "Reserve a Table")}
                                </a>
                            )}
                            {profile.allowOrders && (
                                <a
                                    href={`/diner/${profile.id}`}
                                    className="px-8 py-3.5 rounded-full border-2 border-[var(--t-accent)] text-[var(--t-accent)] font-medium text-center hover:bg-[var(--t-muted)] transition-colors"
                                >
                                    {t("business_page.header.order_online_button", "Order Online")}
                                </a>
                            )}
                        </div>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="order-1 md:order-2"
                >
                    {heroImage ? (
                        <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl md:rotate-2">
                            <img src={heroImage.url} alt={profile.name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="aspect-[4/3] rounded-3xl shadow-xl md:rotate-2 bg-gradient-to-br from-[var(--t-accent)] to-[var(--t-muted)]" />
                    )}
                </motion.div>
            </header>

            {/* Gallery */}
            {media.length > 1 && (
                <section className="px-6 md:px-16 py-16">
                    <h2 className="text-2xl font-bold mb-8">{t("business_page.gallery.section_title", "Gallery")}</h2>
                    <PhotoProvider>
                        <div className="columns-2 md:columns-3 gap-3 max-w-5xl">
                            {media.slice(1).map((m, i) => (
                                <PhotoView key={m.id} src={m.url}>
                                    <div className={`mb-3 rounded-2xl overflow-hidden cursor-pointer ${TILE_ASPECT[i % TILE_ASPECT.length]}`}>
                                        <img src={m.url} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                    </div>
                                </PhotoView>
                            ))}
                        </div>
                    </PhotoProvider>
                </section>
            )}

            {/* Menu */}
            {hasMenu && (
                <section className="px-6 md:px-16 py-16 max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-8">{t("business_page.menu.section_title", "Menu")}</h2>
                    <div className="space-y-6">
                        {categories.map((category, i) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="rounded-3xl bg-[var(--t-muted)] p-8"
                            >
                                <h3 className="text-lg font-bold mb-5">{category.name}</h3>
                                <ul className="space-y-5">
                                    {(category.items ?? []).map((item) => {
                                        const thumb = item.media?.[0]?.url;
                                        return (
                                            <li key={item.id} className="flex gap-4 items-start">
                                                {thumb && (
                                                    <img src={thumb} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                                                )}
                                                <div className="flex-1 flex justify-between gap-4">
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        {item.description && (
                                                            <p className="text-sm text-[var(--t-muted-fg)] mt-0.5">{item.description}</p>
                                                        )}
                                                    </div>
                                                    <span className="whitespace-nowrap font-medium">
                                                        {formatMenuPrice(item.price, profile.currency)}
                                                    </span>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Opening hours */}
            {hours.length > 0 && (
                <section className="px-6 md:px-16 py-16 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold mb-8">{t("business_page.timing.section_title", "Opening Hours")}</h2>
                    <div className="rounded-3xl bg-[var(--t-muted)] p-8 space-y-2">
                        {hours.map((day) => {
                            const isToday = day.day.toLowerCase() === today;
                            return (
                                <div
                                    key={day.id}
                                    className={`flex justify-between items-center rounded-2xl px-4 py-2.5 ${isToday ? "bg-[var(--t-accent)] text-[var(--t-accent-fg)]" : ""}`}
                                >
                                    <span className="capitalize font-medium">{t(`shared.days.${day.day.toLowerCase()}`, day.day)}</span>
                                    {day.isClosed ? (
                                        <span className={isToday ? "" : "text-[var(--t-muted-fg)]"}>{t("business_page.timing.closed", "Closed")}</span>
                                    ) : (
                                        <span className="text-right text-sm">
                                            {day.periods.map((p) => (
                                                <span key={p.id} className="block">{formatOpeningPeriod(p)}</span>
                                            ))}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Contact / footer */}
            <footer className="px-6 md:px-16 py-16">
                <div className="max-w-2xl mx-auto rounded-3xl bg-[var(--t-muted)] p-10 text-center space-y-4">
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
                        {addressLabel && <span className="inline-flex items-center gap-2"><MapPin size={16} className="text-[var(--t-accent)]" /> {addressLabel}</span>}
                        {profile.phone && <span className="inline-flex items-center gap-2"><Phone size={16} className="text-[var(--t-accent)]" /> {profile.phone}</span>}
                        {profile.email && <span className="inline-flex items-center gap-2"><Mail size={16} className="text-[var(--t-accent)]" /> {profile.email}</span>}
                    </div>
                    <div className="flex items-center justify-center gap-3">
                        {profile.facebook && (
                            <a href={profile.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[var(--t-accent)] text-[var(--t-accent-fg)] flex items-center justify-center">
                                <Facebook size={16} />
                            </a>
                        )}
                        {profile.instagram && (
                            <a href={profile.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[var(--t-accent)] text-[var(--t-accent-fg)] flex items-center justify-center">
                                <Instagram size={16} />
                            </a>
                        )}
                        {profile.website && (
                            <a href={profile.website} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[var(--t-accent)] text-[var(--t-accent-fg)] flex items-center justify-center">
                                <Globe size={16} />
                            </a>
                        )}
                    </div>
                </div>
            </footer>
        </main>
    );
}
