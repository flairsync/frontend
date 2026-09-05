import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { MapPin, Phone, Mail, Facebook, Instagram, Globe, Star, Mountain, TreePine } from "lucide-react";
import { ThemeComponentProps } from "../registry";
import BusinessDetailsMenu from "@/components/business_details/BusinessDetailsMenu";
import BusinessDetailsTableReservation from "@/components/business_details/BusinessDetailsTableReservation";
import BusinessDetailsInfoCards from "@/components/business_details/BusinessDetailsInfoCards";
import BusinessDetailsReviews from "@/components/business_details/BusinessDetailsReviews";
import { sortOpeningHours, formatOpeningPeriod, getOrderedMedia, SECTION_CONTAINER } from "../utils";
import { useBodyThemeScope } from "../useBodyThemeScope";

// Pine green + granite stone, rugged/outdoorsy — a Pyrenees hiking-lodge
// identity (Andorra's mountain landscape rather than its winter/ski side —
// see Alpine Snow for that). Distinguished from the other themes by the
// jagged mountain-skyline divider cut into the bottom of the hero.
const TOKENS = {
    "--t-bg": "#f7f5f0",
    "--t-fg": "#232821",
    "--t-muted": "#e8e4d8",
    "--t-muted-fg": "#6b6f5e",
    "--t-border": "#d8d3c0",
    "--t-accent": "#3f5d3a",
    "--t-accent-fg": "#f7f5f0",
} as CSSProperties;

// Scopes the shared marketplace components (BusinessDetailsMenu,
// BusinessDetailsTableReservation, BusinessDetailsReviews, ...) to this
// theme's pine-green/stone identity instead of FlairSync's own fixed
// blue/rounded chrome — see features/themes/useBodyThemeScope.ts.
const SHADCN_VARS: Record<string, string> = {
    "--background": "#f7f5f0",
    "--foreground": "#232821",
    "--card": "#f7f5f0",
    "--card-foreground": "#232821",
    "--popover": "#f7f5f0",
    "--popover-foreground": "#232821",
    "--primary": "#3f5d3a",
    "--primary-foreground": "#f7f5f0",
    "--secondary": "#e8e4d8",
    "--secondary-foreground": "#232821",
    "--muted": "#e8e4d8",
    "--muted-foreground": "#6b6f5e",
    "--accent": "#e8e4d8",
    "--accent-foreground": "#232821",
    "--border": "#d8d3c0",
    "--input": "#d8d3c0",
    "--ring": "#3f5d3a",
    "--radius": "0.375rem",
};

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export function PyreneanPeakTheme({ profile, menu }: ThemeComponentProps) {
    const { t } = useTranslation("feed");
    useBodyThemeScope(SHADCN_VARS);

    const media = getOrderedMedia(profile.media);
    const hours = sortOpeningHours(profile.openingHours);
    const hasMenu = !!menu && menu.categories.length > 0;
    const addressLabel = profile.address || (profile.city ? `${profile.city}, ${profile.country?.name || ""}` : profile.country?.name || "");
    const heroImage = media[0];
    const today = new Date().toLocaleDateString(undefined, { weekday: "long" }).toLowerCase();

    return (
        <main style={{ ...TOKENS, ...SHADCN_VARS }} className="min-h-screen bg-[var(--t-bg)] text-[var(--t-fg)]">
            {/* Hero — image (or forest gradient) with a jagged mountain-skyline cut at the bottom */}
            <header className="relative h-[70vh] min-h-[480px] flex items-center justify-center overflow-hidden">
                {heroImage ? (
                    <img src={heroImage.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-[#5c7a52] to-[var(--t-accent)]" />
                )}
                <div className="absolute inset-0 bg-black/45" />

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="relative z-10 text-center px-6 text-white max-w-2xl"
                >
                    {profile.logo && (
                        <img src={profile.logo} alt={profile.name} className="w-16 h-16 rounded-full object-cover border-2 border-white/70 mx-auto mb-5" />
                    )}
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">{profile.name}</h1>
                    {profile.description && (
                        <p className="mt-4 text-white/85 leading-relaxed">{profile.description}</p>
                    )}
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
                        {profile.rating !== null && (
                            <span className="inline-flex items-center gap-1 rounded bg-white/15 border border-white/30 px-3 py-1">
                                <Star size={14} className="fill-white text-white" />
                                {profile.rating}
                                {profile.reviewCount > 0 && <span className="text-white/70">({profile.reviewCount})</span>}
                            </span>
                        )}
                        {addressLabel && (
                            <span className="inline-flex items-center gap-1 rounded bg-white/15 border border-white/30 px-3 py-1">
                                <MapPin size={14} /> {addressLabel}
                            </span>
                        )}
                        {profile.tags.slice(0, 2).map((tag) => (
                            <span key={tag.id} className="rounded bg-white/15 border border-white/30 px-3 py-1">{tag.name}</span>
                        ))}
                    </div>

                    {(profile.allowReservations || profile.allowOrders) && (
                        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                            {profile.allowReservations && (
                                <button
                                    onClick={() => scrollTo("reservation-section")}
                                    className="px-7 py-3 rounded bg-[var(--t-accent)] text-[var(--t-accent-fg)] font-medium hover:opacity-90 transition-opacity"
                                >
                                    {t("business_page.header.reserve_table_button", "Reserve a Table")}
                                </button>
                            )}
                            {profile.allowOrders && hasMenu && (
                                <button
                                    onClick={() => scrollTo("menu-section")}
                                    className="px-7 py-3 rounded border border-white/70 text-white font-medium hover:bg-white/15 transition-colors"
                                >
                                    {t("business_page.header.order_online_button", "Order Online")}
                                </button>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Jagged skyline divider into the page background */}
                <svg
                    className="absolute bottom-0 left-0 w-full h-16 md:h-24"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                    aria-hidden
                >
                    <path
                        d="M0,120 L0,70 L80,30 L160,80 L260,10 L340,60 L430,20 L520,75 L620,15 L720,65 L820,25 L910,70 L1000,35 L1090,80 L1200,40 L1200,120 Z"
                        fill="var(--t-bg)"
                    />
                </svg>
            </header>

            {/* Live status / rating / map */}
            <section className={`${SECTION_CONTAINER} py-16`}>
                <BusinessDetailsInfoCards profile={profile} />
            </section>

            {/* Gallery */}
            {media.length > 1 && (
                <section className="px-6 md:px-10 pb-16">
                    <div className={`${SECTION_CONTAINER} !px-0`}>
                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                            <TreePine size={20} className="text-[var(--t-accent)]" />
                            {t("business_page.gallery.section_title", "Gallery")}
                        </h2>
                        <PhotoProvider>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {media.slice(1).map((m) => (
                                    <PhotoView key={m.id} src={m.url}>
                                        <div className="aspect-square rounded overflow-hidden border-2 border-[var(--t-border)] cursor-pointer">
                                            <img src={m.url} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                        </div>
                                    </PhotoView>
                                ))}
                            </div>
                        </PhotoProvider>
                    </div>
                </section>
            )}

            {/* Menu + ordering */}
            {hasMenu && (
                <section id="menu-section" className={`${SECTION_CONTAINER} py-16 border-t border-[var(--t-border)]`}>
                    <BusinessDetailsMenu menu={menu!} business={profile} />
                </section>
            )}

            {/* Reservations */}
            {profile.allowReservations && (
                <section className={`${SECTION_CONTAINER} py-16 border-t border-[var(--t-border)]`}>
                    <BusinessDetailsTableReservation businessId={profile.id} />
                </section>
            )}

            {/* Opening hours */}
            {hours.length > 0 && (
                <section className="px-6 py-16 max-w-2xl mx-auto border-t border-[var(--t-border)]">
                    <h2 className="text-2xl font-bold text-center mb-10 flex items-center justify-center gap-2">
                        <Mountain size={20} className="text-[var(--t-accent)]" />
                        {t("business_page.timing.section_title", "Opening Hours")}
                    </h2>
                    <div className="border-2 border-[var(--t-border)] rounded divide-y divide-[var(--t-border)]">
                        {hours.map((day) => {
                            const isToday = day.day.toLowerCase() === today;
                            return (
                                <div
                                    key={day.id}
                                    className={`flex justify-between items-center px-5 py-3 ${isToday ? "bg-[var(--t-accent)] text-[var(--t-accent-fg)]" : ""}`}
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

            {/* Reviews */}
            <section className={`${SECTION_CONTAINER} py-16 border-t border-[var(--t-border)]`}>
                <BusinessDetailsReviews businessId={profile.id} businessName={profile.name} />
            </section>

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
