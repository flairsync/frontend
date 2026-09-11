import type { CSSProperties } from "react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform } from "framer-motion";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { MapPin, Phone, Mail, Facebook, Instagram, Globe, Star, Mountain, TreePine, Flag } from "lucide-react";
import { ThemeComponentProps } from "../registry";
import BusinessDetailsMenu from "@/components/business_details/BusinessDetailsMenu";
import BusinessDetailsTableReservation from "@/components/business_details/BusinessDetailsTableReservation";
import BusinessDetailsInfoCards from "@/components/business_details/BusinessDetailsInfoCards";
import BusinessDetailsReviews from "@/components/business_details/BusinessDetailsReviews";
import { sortOpeningHours, formatOpeningPeriod, getOrderedMedia, getSignatureMenuItems, SECTION_CONTAINER } from "../utils";
import { useBodyThemeScope } from "../useBodyThemeScope";
import { TiltCard } from "../TiltCard";
import { DepthCarousel } from "../DepthCarousel";

// One waypoint per unit height in the trail's viewBox. Swings the path out to
// alternating sides at each waypoint's midpoint and back to center at its
// edges, so a card placed on the outside of each swing reads as sitting
// "on the trail". Coarse (not pixel-matched to the card list below), but
// this is a decorative backdrop, not a data visualization.
function buildTrailPath(waypointCount: number, segmentHeight: number): string {
    if (waypointCount === 0) return "";
    let d = "M50,0";
    for (let i = 0; i < waypointCount; i++) {
        const side = i % 2 === 0 ? 82 : 18;
        const y0 = i * segmentHeight;
        const y1 = (i + 1) * segmentHeight;
        const mid = (y0 + y1) / 2;
        const ease = segmentHeight * 0.3;
        d += ` C50,${y0 + ease} ${side},${mid - ease} ${side},${mid}`;
        d += ` C${side},${mid + ease} 50,${y1 - ease} 50,${y1}`;
    }
    return d;
}

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
    const trailRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: trailProgress } = useScroll({ target: trailRef, offset: ["start 0.8", "end 0.65"] });
    const trailPathLength = useTransform(trailProgress, [0, 1], [0, 1]);

    const media = getOrderedMedia(profile.media);
    const hours = sortOpeningHours(profile.openingHours);
    const hasMenu = !!menu && menu.categories.length > 0;
    const addressLabel = profile.address || (profile.city ? `${profile.city}, ${profile.country?.name || ""}` : profile.country?.name || "");
    const heroImage = media[0];
    const signatureDishes = getSignatureMenuItems(menu);
    const trailSegmentHeight = 100;
    const trailPath = buildTrailPath(signatureDishes.length, trailSegmentHeight);
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

            {/* Gallery — a ridgeline coverflow: angular, clipped-corner panes
               sliding past like a row of peaks, distinct from Alpine Snow's
               soft frosted coverflow */}
            {media.length > 1 && (
                <section className="px-6 md:px-10 pb-16 overflow-hidden">
                    <div className={`${SECTION_CONTAINER} !px-0`}>
                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                            <TreePine size={20} className="text-[var(--t-accent)]" />
                            {t("business_page.gallery.section_title", "Gallery")}
                        </h2>
                        <PhotoProvider>
                            <DepthCarousel
                                items={media.slice(1)}
                                autoplayDelay={4800}
                                depthStyle={(offset) => ({
                                    scale: Math.max(1 - Math.abs(offset) * 0.16, 0.6),
                                    opacity: Math.max(1 - Math.abs(offset) * 0.3, 0.35),
                                    rotateY: Math.max(-30, Math.min(30, -offset * 20)),
                                })}
                                renderItem={(m) => (
                                    <PhotoView key={m.id} src={m.url}>
                                        <div
                                            className="w-56 h-64 md:w-64 md:h-72 overflow-hidden border-2 border-[var(--t-accent)] cursor-pointer shadow-lg"
                                            style={{ clipPath: "polygon(0 12%, 12% 0, 100% 0, 100% 88%, 88% 100%, 0 100%)" }}
                                        >
                                            <img src={m.url} alt="" loading="lazy" className="w-full h-full object-cover" />
                                        </div>
                                    </PhotoView>
                                )}
                            />
                        </PhotoProvider>
                    </div>
                </section>
            )}

            {/* The Trail — signature dishes as waypoints along a winding path,
               drawn in as the section scrolls into view */}
            {signatureDishes.length > 0 && (
                <section className="py-16 border-t border-[var(--t-border)]">
                    <div className={SECTION_CONTAINER}>
                        <h2 className="text-2xl font-bold mb-12 flex items-center justify-center gap-2">
                            <Flag size={20} className="text-[var(--t-accent)]" />
                            {t("business_page.signature_dishes.section_title", "Along the Trail")}
                        </h2>
                        <div ref={trailRef} className="relative">
                            <svg
                                className="absolute inset-0 w-full h-full hidden md:block"
                                viewBox={`0 0 100 ${signatureDishes.length * trailSegmentHeight}`}
                                preserveAspectRatio="none"
                                aria-hidden
                            >
                                <motion.path
                                    d={trailPath}
                                    fill="none"
                                    stroke="var(--t-accent)"
                                    strokeWidth={0.6}
                                    strokeDasharray="2 2"
                                    style={{ pathLength: trailPathLength }}
                                />
                            </svg>
                            <div className="relative flex flex-col gap-10 [perspective:1000px]">
                                {signatureDishes.map((dish, i) => (
                                    <div key={dish.id} className={`md:w-[46%] ${i % 2 === 0 ? "md:mr-auto" : "md:ml-auto"}`}>
                                        <TiltCard maxDeg={6} scaleOnHover={1.02} className="flex items-center gap-4 rounded bg-[var(--t-bg)] border-2 border-[var(--t-border)] p-3 shadow-sm">
                                            <img src={dish.imageUrl} alt={dish.name} loading="lazy" className="w-20 h-20 rounded object-cover shrink-0" />
                                            <div>
                                                <p className="font-semibold">{dish.name}</p>
                                                <p className="text-sm text-[var(--t-muted-fg)] mt-0.5">{profile.currency || "€"}{dish.price}</p>
                                            </div>
                                        </TiltCard>
                                    </div>
                                ))}
                            </div>
                        </div>
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
