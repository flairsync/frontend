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
import { ThemeComponentProps } from "../registry";
import BusinessDetailsMenu from "@/components/business_details/BusinessDetailsMenu";
import BusinessDetailsTableReservation from "@/components/business_details/BusinessDetailsTableReservation";
import BusinessDetailsInfoCards from "@/components/business_details/BusinessDetailsInfoCards";
import BusinessDetailsReviews from "@/components/business_details/BusinessDetailsReviews";
import { sortOpeningHours, formatOpeningPeriod, getOrderedMedia, SECTION_CONTAINER } from "../utils";
import { useBodyThemeScope } from "../useBodyThemeScope";

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

// Scopes the shared marketplace components (BusinessDetailsMenu,
// BusinessDetailsTableReservation, BusinessDetailsReviews, ...) to this
// theme's cream/burgundy identity instead of FlairSync's own fixed
// blue/rounded chrome — see features/themes/useBodyThemeScope.ts.
const SHADCN_VARS: Record<string, string> = {
    "--background": "#faf6ee",
    "--foreground": "#2a2422",
    "--card": "#faf6ee",
    "--card-foreground": "#2a2422",
    "--popover": "#faf6ee",
    "--popover-foreground": "#2a2422",
    "--primary": "#7a2331",
    "--primary-foreground": "#faf6ee",
    "--secondary": "#f0e9db",
    "--secondary-foreground": "#2a2422",
    "--muted": "#f0e9db",
    "--muted-foreground": "#7a6f63",
    "--accent": "#f0e9db",
    "--accent-foreground": "#2a2422",
    "--border": "#ddd0b8",
    "--input": "#ddd0b8",
    "--ring": "#7a2331",
    "--radius": "0rem",
};

const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { delay, duration: 0.6, ease: "easeOut" as const },
});

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export function ClassicTheme({ profile, menu }: ThemeComponentProps) {
    const { t } = useTranslation("feed");
    useBodyThemeScope(SHADCN_VARS);

    const media = getOrderedMedia(profile.media);
    const hours = sortOpeningHours(profile.openingHours);
    const hasMenu = !!menu && menu.categories.length > 0;
    const addressLabel = profile.address || (profile.city ? `${profile.city}, ${profile.country?.name || ""}` : profile.country?.name || "");

    return (
        <main style={{ ...TOKENS, ...SHADCN_VARS }} className="min-h-screen bg-[var(--t-bg)] text-[var(--t-fg)] font-serif">
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
                                <button
                                    onClick={() => scrollTo("reservation-section")}
                                    className="px-8 py-3 rounded-none border-2 border-[var(--t-accent)] bg-[var(--t-accent)] text-[var(--t-bg)] text-sm tracking-wide hover:opacity-90 transition-opacity"
                                >
                                    {t("business_page.header.reserve_table_button", "Reserve a Table")}
                                </button>
                            )}
                            {profile.allowOrders && hasMenu && (
                                <button
                                    onClick={() => scrollTo("menu-section")}
                                    className="px-8 py-3 rounded-none border-2 border-[var(--t-accent)] text-[var(--t-accent)] text-sm tracking-wide hover:bg-[var(--t-accent)] hover:text-[var(--t-bg)] transition-colors"
                                >
                                    {t("business_page.header.order_online_button", "Order Online")}
                                </button>
                            )}
                        </motion.div>
                    )}
                </div>
            </header>

            {/* Live status / rating / map */}
            <section className={`${SECTION_CONTAINER} py-16`}>
                <BusinessDetailsInfoCards profile={profile} />
            </section>

            {/* Gallery */}
            {media.length > 0 && (
                <section className="px-6 pb-20 max-w-3xl mx-auto">
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

            {/* Menu + ordering */}
            {hasMenu && (
                <section id="menu-section" className={`${SECTION_CONTAINER} py-20 border-t border-[var(--t-border)]`}>
                    <BusinessDetailsMenu menu={menu!} business={profile} />
                </section>
            )}

            {/* Reservations */}
            {profile.allowReservations && (
                <section className={`${SECTION_CONTAINER} py-20 border-t border-[var(--t-border)]`}>
                    <BusinessDetailsTableReservation businessId={profile.id} />
                </section>
            )}

            {/* Opening hours */}
            {hours.length > 0 && (
                <section className="px-6 py-20 max-w-2xl mx-auto border-t border-[var(--t-border)]">
                    <h2 className="text-3xl text-center font-bold mb-14">
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
            <section className={`${SECTION_CONTAINER} py-20 border-t border-[var(--t-border)]`}>
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
