import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { MapPin, Phone, Mail, Facebook, Instagram, Globe, Star, Snowflake } from "lucide-react";
import { ThemeComponentProps } from "../registry";
import BusinessDetailsMenu from "@/components/business_details/BusinessDetailsMenu";
import BusinessDetailsTableReservation from "@/components/business_details/BusinessDetailsTableReservation";
import BusinessDetailsInfoCards from "@/components/business_details/BusinessDetailsInfoCards";
import BusinessDetailsReviews from "@/components/business_details/BusinessDetailsReviews";
import { sortOpeningHours, formatOpeningPeriod, getOrderedMedia, SECTION_CONTAINER } from "../utils";
import { useBodyThemeScope } from "../useBodyThemeScope";

// Ice-blue + frosted glass, full-bleed photo hero, scattered snowflake
// motifs — a ski-resort/winter-chalet identity. Distinct from the other
// themes via its full-bleed dark-overlay hero and translucent "frosted"
// chrome instead of solid cards.
const TOKENS = {
    "--t-bg": "#f4f9fc",
    "--t-fg": "#10202e",
    "--t-muted": "#e3eff6",
    "--t-muted-fg": "#5b7a90",
    "--t-border": "#cfe3ee",
    "--t-accent": "#1c6ea4",
    "--t-accent-fg": "#ffffff",
} as CSSProperties;

// Scopes the shared marketplace components (BusinessDetailsMenu,
// BusinessDetailsTableReservation, BusinessDetailsReviews, ...) to this
// theme's icy-blue identity instead of FlairSync's own fixed blue/rounded
// chrome — see features/themes/useBodyThemeScope.ts.
const SHADCN_VARS: Record<string, string> = {
    "--background": "#f4f9fc",
    "--foreground": "#10202e",
    "--card": "#f4f9fc",
    "--card-foreground": "#10202e",
    "--popover": "#f4f9fc",
    "--popover-foreground": "#10202e",
    "--primary": "#1c6ea4",
    "--primary-foreground": "#ffffff",
    "--secondary": "#e3eff6",
    "--secondary-foreground": "#10202e",
    "--muted": "#e3eff6",
    "--muted-foreground": "#5b7a90",
    "--accent": "#e3eff6",
    "--accent-foreground": "#10202e",
    "--border": "#cfe3ee",
    "--input": "#cfe3ee",
    "--ring": "#1c6ea4",
    "--radius": "0.75rem",
};

// Fixed positions/sizes/delays for the ambient snowflake motifs so they
// don't reshuffle on every render.
const SNOWFLAKES = [
    { top: "12%", left: "8%", size: 18, delay: 0 },
    { top: "22%", left: "88%", size: 14, delay: 0.4 },
    { top: "68%", left: "6%", size: 12, delay: 0.8 },
    { top: "78%", left: "92%", size: 20, delay: 1.2 },
    { top: "40%", left: "50%", size: 10, delay: 1.6 },
];

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export function AlpineSnowTheme({ profile, menu }: ThemeComponentProps) {
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
            {/* Hero — full-bleed photo (or icy gradient) with a frosted glass card */}
            <header className="relative min-h-[85vh] flex items-end overflow-hidden">
                {heroImage ? (
                    <img src={heroImage.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--t-muted)] to-[var(--t-accent)]/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1520] via-[#0a1520]/40 to-transparent" />

                {SNOWFLAKES.map((s, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-white/70 pointer-events-none"
                        style={{ top: s.top, left: s.left }}
                        animate={{ y: [0, 14, 0], opacity: [0.4, 0.9, 0.4] }}
                        transition={{ duration: 4 + i, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
                    >
                        <Snowflake size={s.size} />
                    </motion.div>
                ))}

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="relative z-10 w-full px-6 pb-14 pt-24"
                >
                    <div className="max-w-3xl mx-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/25 p-8 md:p-10 text-center text-white shadow-2xl">
                        {profile.logo && (
                            <img
                                src={profile.logo}
                                alt={profile.name}
                                className="w-16 h-16 rounded-full object-cover border-2 border-white/60 mx-auto mb-5"
                            />
                        )}
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{profile.name}</h1>
                        {profile.description && (
                            <p className="mt-4 text-white/80 leading-relaxed max-w-xl mx-auto">{profile.description}</p>
                        )}
                        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
                            {profile.rating !== null && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 border border-white/25 px-3 py-1">
                                    <Star size={14} className="fill-white text-white" />
                                    {profile.rating}
                                    {profile.reviewCount > 0 && <span className="text-white/70">({profile.reviewCount})</span>}
                                </span>
                            )}
                            {addressLabel && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 border border-white/25 px-3 py-1">
                                    <MapPin size={14} /> {addressLabel}
                                </span>
                            )}
                        </div>

                        {(profile.allowReservations || profile.allowOrders) && (
                            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                                {profile.allowReservations && (
                                    <button
                                        onClick={() => scrollTo("reservation-section")}
                                        className="px-7 py-3 rounded-full bg-[var(--t-accent)] text-[var(--t-accent-fg)] font-medium hover:opacity-90 transition-opacity"
                                    >
                                        {t("business_page.header.reserve_table_button", "Reserve a Table")}
                                    </button>
                                )}
                                {profile.allowOrders && hasMenu && (
                                    <button
                                        onClick={() => scrollTo("menu-section")}
                                        className="px-7 py-3 rounded-full bg-white/15 border border-white/40 text-white font-medium hover:bg-white/25 transition-colors"
                                    >
                                        {t("business_page.header.order_online_button", "Order Online")}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
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
                            <Snowflake size={20} className="text-[var(--t-accent)]" />
                            {t("business_page.gallery.section_title", "Gallery")}
                        </h2>
                        <PhotoProvider>
                            <div className="columns-2 md:columns-3 gap-3">
                                {media.slice(1).map((m) => (
                                    <PhotoView key={m.id} src={m.url}>
                                        <div className="mb-3 rounded-xl overflow-hidden border border-[var(--t-border)] shadow-sm cursor-pointer">
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
                    <h2 className="text-2xl font-bold text-center mb-10">
                        {t("business_page.timing.section_title", "Opening Hours")}
                    </h2>
                    <div className="rounded-2xl bg-white/60 backdrop-blur-sm border border-[var(--t-border)] p-6 space-y-1">
                        {hours.map((day) => {
                            const isToday = day.day.toLowerCase() === today;
                            return (
                                <div
                                    key={day.id}
                                    className={`flex justify-between items-center rounded-xl px-4 py-2.5 ${isToday ? "bg-[var(--t-accent)] text-[var(--t-accent-fg)]" : ""}`}
                                >
                                    <span className="capitalize font-medium flex items-center gap-2">
                                        {isToday && <Snowflake size={13} />}
                                        {t(`shared.days.${day.day.toLowerCase()}`, day.day)}
                                    </span>
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
                <div className="max-w-2xl mx-auto rounded-2xl bg-white/70 backdrop-blur-sm border border-[var(--t-border)] p-10 text-center space-y-4">
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
