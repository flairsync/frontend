import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { MapPin, Phone, Mail, Facebook, Instagram, Globe, Star, Landmark } from "lucide-react";
import { ThemeComponentProps } from "../registry";
import BusinessDetailsMenu from "@/components/business_details/BusinessDetailsMenu";
import BusinessDetailsTableReservation from "@/components/business_details/BusinessDetailsTableReservation";
import BusinessDetailsInfoCards from "@/components/business_details/BusinessDetailsInfoCards";
import BusinessDetailsReviews from "@/components/business_details/BusinessDetailsReviews";
import { sortOpeningHours, formatOpeningPeriod, getOrderedMedia, SECTION_CONTAINER } from "../utils";
import { useBodyThemeScope } from "../useBodyThemeScope";

// Stone + aged copper/gold, small-caps serif, arch-topped image frames
// echoing the Romanesque architecture of Andorra's old towns (e.g. Sant
// Joan de Caselles, Casa de la Vall) — a heritage/old-quarter identity.
// The rounded-t-full "arch" frame is this theme's signature and is reused
// for both the hero image and the gallery grid.
const TOKENS = {
    "--t-bg": "#f5f1e8",
    "--t-fg": "#2b2620",
    "--t-muted": "#e9e1d0",
    "--t-muted-fg": "#7d7461",
    "--t-border": "#d4c9ab",
    "--t-accent": "#9c6b2e",
    "--t-accent-fg": "#f5f1e8",
} as CSSProperties;

// Scopes the shared marketplace components (BusinessDetailsMenu,
// BusinessDetailsTableReservation, BusinessDetailsReviews, ...) to this
// theme's stone/copper identity instead of FlairSync's own fixed
// blue/rounded chrome — see features/themes/useBodyThemeScope.ts.
const SHADCN_VARS: Record<string, string> = {
    "--background": "#f5f1e8",
    "--foreground": "#2b2620",
    "--card": "#f5f1e8",
    "--card-foreground": "#2b2620",
    "--popover": "#f5f1e8",
    "--popover-foreground": "#2b2620",
    "--primary": "#9c6b2e",
    "--primary-foreground": "#f5f1e8",
    "--secondary": "#e9e1d0",
    "--secondary-foreground": "#2b2620",
    "--muted": "#e9e1d0",
    "--muted-foreground": "#7d7461",
    "--accent": "#e9e1d0",
    "--accent-foreground": "#2b2620",
    "--border": "#d4c9ab",
    "--input": "#d4c9ab",
    "--ring": "#9c6b2e",
    "--radius": "0.25rem",
};

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export function VallAntigaTheme({ profile, menu }: ThemeComponentProps) {
    const { t } = useTranslation("feed");
    useBodyThemeScope(SHADCN_VARS);

    const media = getOrderedMedia(profile.media);
    const hours = sortOpeningHours(profile.openingHours);
    const hasMenu = !!menu && menu.categories.length > 0;
    const addressLabel = profile.address || (profile.city ? `${profile.city}, ${profile.country?.name || ""}` : profile.country?.name || "");
    const heroImage = media[0];

    return (
        <main style={{ ...TOKENS, ...SHADCN_VARS }} className="min-h-screen bg-[var(--t-bg)] text-[var(--t-fg)]">
            {/* Hero — centered, symmetric, arch-topped image frame */}
            <header className="px-6 pt-20 pb-16 text-center">
                <div className="max-w-xl mx-auto flex flex-col items-center">
                    {heroImage ? (
                        <motion.div
                            initial={{ opacity: 0, y: -16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="w-40 h-52 md:w-48 md:h-64 rounded-t-full overflow-hidden border-4 border-[var(--t-accent)] shadow-lg mb-8"
                        >
                            <img src={heroImage.url} alt="" className="w-full h-full object-cover" />
                        </motion.div>
                    ) : profile.logo ? (
                        <img src={profile.logo} alt={profile.name} className="w-20 h-20 rounded-full object-cover border-2 border-[var(--t-accent)] mb-6" />
                    ) : (
                        <Landmark size={40} className="text-[var(--t-accent)] mb-6" />
                    )}

                    <h1 className="text-4xl md:text-5xl font-semibold tracking-[0.03em] uppercase" style={{ fontVariant: "small-caps" }}>
                        {profile.name}
                    </h1>
                    <div className="mt-4 flex items-center gap-3">
                        <span className="h-px w-12 bg-[var(--t-accent)]" />
                        <Landmark size={14} className="text-[var(--t-accent)]" />
                        <span className="h-px w-12 bg-[var(--t-accent)]" />
                    </div>
                    {profile.description && (
                        <p className="mt-6 text-[var(--t-muted-fg)] leading-relaxed">{profile.description}</p>
                    )}
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-[var(--t-muted-fg)]">
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
                    </div>

                    {(profile.allowReservations || profile.allowOrders) && (
                        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                            {profile.allowReservations && (
                                <button
                                    onClick={() => scrollTo("reservation-section")}
                                    className="px-8 py-3 border-2 border-[var(--t-accent)] bg-[var(--t-accent)] text-[var(--t-accent-fg)] text-sm tracking-wide uppercase hover:opacity-90 transition-opacity"
                                >
                                    {t("business_page.header.reserve_table_button", "Reserve a Table")}
                                </button>
                            )}
                            {profile.allowOrders && hasMenu && (
                                <button
                                    onClick={() => scrollTo("menu-section")}
                                    className="px-8 py-3 border-2 border-[var(--t-accent)] text-[var(--t-accent)] text-sm tracking-wide uppercase hover:bg-[var(--t-accent)] hover:text-[var(--t-accent-fg)] transition-colors"
                                >
                                    {t("business_page.header.order_online_button", "Order Online")}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Live status / rating / map */}
            <section className={`${SECTION_CONTAINER} py-16 border-t border-[var(--t-border)]`}>
                <BusinessDetailsInfoCards profile={profile} />
            </section>

            {/* Gallery — arch-topped frames, echoing the hero */}
            {media.length > 1 && (
                <section className="px-6 py-16 border-t border-[var(--t-border)]">
                    <div className={`${SECTION_CONTAINER} !px-0`}>
                        <h2 className="text-2xl font-semibold text-center uppercase tracking-wide mb-10">
                            {t("business_page.gallery.section_title", "Gallery")}
                        </h2>
                        <PhotoProvider>
                            <div className="flex flex-wrap justify-center gap-5">
                                {media.slice(1).map((m) => (
                                    <PhotoView key={m.id} src={m.url}>
                                        <div className="w-28 h-36 md:w-36 md:h-48 rounded-t-full overflow-hidden border-2 border-[var(--t-border)] cursor-pointer">
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
                    <h2 className="text-2xl font-semibold text-center uppercase tracking-wide mb-10">
                        {t("business_page.timing.section_title", "Opening Hours")}
                    </h2>
                    <div className="border border-[var(--t-border)] bg-[var(--t-muted)] p-8 divide-y divide-[var(--t-border)]">
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
                    </div>
                </section>
            )}

            {/* Reviews */}
            <section className={`${SECTION_CONTAINER} py-16 border-t border-[var(--t-border)]`}>
                <BusinessDetailsReviews businessId={profile.id} businessName={profile.name} />
            </section>

            {/* Contact / footer */}
            <footer className="px-6 py-16 border-t border-[var(--t-border)] bg-[var(--t-muted)]">
                <div className="max-w-3xl mx-auto text-center space-y-5">
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
                        {addressLabel && <span className="inline-flex items-center gap-2"><MapPin size={16} className="text-[var(--t-accent)]" /> {addressLabel}</span>}
                        {profile.phone && <span className="inline-flex items-center gap-2"><Phone size={16} className="text-[var(--t-accent)]" /> {profile.phone}</span>}
                        {profile.email && <span className="inline-flex items-center gap-2"><Mail size={16} className="text-[var(--t-accent)]" /> {profile.email}</span>}
                    </div>
                    <div className="flex items-center justify-center gap-3">
                        {profile.facebook && (
                            <a href={profile.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border-2 border-[var(--t-accent)] text-[var(--t-accent)] flex items-center justify-center">
                                <Facebook size={16} />
                            </a>
                        )}
                        {profile.instagram && (
                            <a href={profile.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border-2 border-[var(--t-accent)] text-[var(--t-accent)] flex items-center justify-center">
                                <Instagram size={16} />
                            </a>
                        )}
                        {profile.website && (
                            <a href={profile.website} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border-2 border-[var(--t-accent)] text-[var(--t-accent)] flex items-center justify-center">
                                <Globe size={16} />
                            </a>
                        )}
                    </div>
                </div>
            </footer>
        </main>
    );
}
