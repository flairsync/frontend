import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform } from "framer-motion";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { MapPin, Phone, Mail, Facebook, Instagram, Globe, Star, Snowflake } from "lucide-react";
import { ThemeComponentProps } from "../registry";
import BusinessDetailsMenu from "@/components/business_details/BusinessDetailsMenu";
import BusinessDetailsTableReservation from "@/components/business_details/BusinessDetailsTableReservation";
import BusinessDetailsInfoCards from "@/components/business_details/BusinessDetailsInfoCards";
import BusinessDetailsReviews from "@/components/business_details/BusinessDetailsReviews";
import { sortOpeningHours, formatOpeningPeriod, getOrderedMedia, getSignatureMenuItems, SECTION_CONTAINER } from "../utils";
import { useBodyThemeScope } from "../useBodyThemeScope";
import { TiltCard } from "../TiltCard";
import { DepthCarousel } from "../DepthCarousel";

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

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

// Fixed positions/sizes/delays so the star field doesn't reshuffle on every render.
const STARS = [
    { top: "8%", left: "12%", size: 2, delay: 0 },
    { top: "14%", left: "28%", size: 1.5, delay: 0.6 },
    { top: "6%", left: "45%", size: 2.5, delay: 1.1 },
    { top: "18%", left: "62%", size: 1.5, delay: 0.3 },
    { top: "10%", left: "78%", size: 2, delay: 1.6 },
    { top: "22%", left: "8%", size: 1.5, delay: 2.1 },
    { top: "26%", left: "38%", size: 1.5, delay: 0.9 },
    { top: "16%", left: "90%", size: 2, delay: 1.4 },
    { top: "30%", left: "70%", size: 1.5, delay: 0.4 },
    { top: "24%", left: "20%", size: 2, delay: 1.9 },
];

// This business's local hour right now, from its own timezone — falls back
// to the viewer's clock if the timezone string is missing/invalid. Drives
// the hero's day/night mood below: this theme's own "dynamic" signature,
// reacting to real conditions rather than a fixed animation.
function useIsNightAt(timezone?: string): boolean {
    let hour = new Date().getHours();
    try {
        if (timezone) {
            hour = parseInt(
                new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hourCycle: "h23" }).format(new Date()),
                10,
            );
        }
    } catch {
        // Invalid IANA timezone string — keep the viewer's local hour.
    }
    return hour < 6 || hour >= 20;
}

type Flake = { x: number; y: number; r: number; speed: number; drift: number; angle: number };

// Continuous ambient snowfall across the hero, replacing the old five fixed
// <Snowflake/> icons — this theme's signature motion. A no-op single frame
// (flakes drawn at rest, no rAF loop) when the viewer prefers reduced motion.
function SnowfallCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const parent = canvas?.parentElement;
        if (!canvas || !parent) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let width = 0;
        let height = 0;
        let flakes: Flake[] = [];
        let frameId = 0;

        const resize = () => {
            width = parent.clientWidth;
            height = parent.clientHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const count = Math.round((width * height) / 12000);
            flakes = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                r: 1 + Math.random() * 2.5,
                speed: 0.3 + Math.random() * 0.8,
                drift: Math.random() * 0.6 - 0.3,
                angle: Math.random() * Math.PI * 2,
            }));
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            for (const f of flakes) {
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const step = () => {
            for (const f of flakes) {
                f.angle += 0.01;
                f.y += f.speed;
                f.x += f.drift + Math.sin(f.angle) * 0.3;
                if (f.y > height + 4) {
                    f.y = -4;
                    f.x = Math.random() * width;
                }
                if (f.x > width + 4) f.x = -4;
                if (f.x < -4) f.x = width + 4;
            }
            draw();
            frameId = requestAnimationFrame(step);
        };

        resize();
        draw();
        window.addEventListener("resize", resize);
        if (!prefersReducedMotion) frameId = requestAnimationFrame(step);

        return () => {
            window.removeEventListener("resize", resize);
            if (frameId) cancelAnimationFrame(frameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden />;
}

export function AlpineSnowTheme({ profile, menu }: ThemeComponentProps) {
    const { t } = useTranslation("feed");
    useBodyThemeScope(SHADCN_VARS);
    const heroRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroImageY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

    const media = getOrderedMedia(profile.media);
    const hours = sortOpeningHours(profile.openingHours);
    const hasMenu = !!menu && menu.categories.length > 0;
    const addressLabel = profile.address || (profile.city ? `${profile.city}, ${profile.country?.name || ""}` : profile.country?.name || "");
    const heroImage = media[0];
    const signatureDishes = getSignatureMenuItems(menu);
    const isNight = useIsNightAt(profile.timezone);
    const today = new Date().toLocaleDateString(undefined, { weekday: "long" }).toLowerCase();

    return (
        <main style={{ ...TOKENS, ...SHADCN_VARS }} className="min-h-screen bg-[var(--t-bg)] text-[var(--t-fg)]">
            {/* Hero — full-bleed photo (or icy gradient) drifting at a slower parallax
               rate than the page scroll, under a continuous ambient snowfall */}
            <header ref={heroRef} className="relative min-h-[85vh] flex items-end overflow-hidden">
                {heroImage ? (
                    <motion.img
                        src={heroImage.url}
                        alt=""
                        style={{ y: heroImageY }}
                        className="absolute inset-0 w-full h-[125%] object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--t-muted)] to-[var(--t-accent)]/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1520] via-[#0a1520]/40 to-transparent" />

                {/* Day/night mood — this business's own local conditions, not a
                   fixed look. A deep-sky tint and star field settle in after dark. */}
                {isNight && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.2 }}
                        className="absolute inset-0 bg-gradient-to-b from-[#0b1330]/70 via-[#0b1330]/15 to-transparent"
                    >
                        {STARS.map((s, i) => (
                            <motion.span
                                key={i}
                                className="absolute rounded-full bg-white"
                                style={{ top: s.top, left: s.left, width: s.size, height: s.size }}
                                animate={{ opacity: [0.2, 1, 0.2] }}
                                transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
                            />
                        ))}
                    </motion.div>
                )}

                <SnowfallCanvas />

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
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-1">
                                <span className="relative flex h-2 w-2">
                                    {profile.isOpen && (
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                    )}
                                    <span className={`relative inline-flex h-2 w-2 rounded-full ${profile.isOpen ? "bg-emerald-400" : "bg-white/50"}`} />
                                </span>
                                {profile.isOpen
                                    ? t("business_page.header.open_now", "Open now")
                                    : t("business_page.header.closed_now", "Closed now")}
                            </span>
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

            {/* Gallery — a frosted-pane coverflow: photos slide past like looking
               through angled ice panes, receding and fading with distance
               from center */}
            {media.length > 1 && (
                <section className="px-6 md:px-10 pb-16 overflow-hidden">
                    <div className={`${SECTION_CONTAINER} !px-0`}>
                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                            <Snowflake size={20} className="text-[var(--t-accent)]" />
                            {t("business_page.gallery.section_title", "Gallery")}
                        </h2>
                        <PhotoProvider>
                            <DepthCarousel
                                items={media.slice(1)}
                                autoplayDelay={4200}
                                depthStyle={(offset) => ({
                                    scale: Math.max(1 - Math.abs(offset) * 0.18, 0.55),
                                    opacity: Math.max(1 - Math.abs(offset) * 0.35, 0.25),
                                    rotateY: Math.max(-35, Math.min(35, -offset * 25)),
                                })}
                                renderItem={(m) => (
                                    <PhotoView key={m.id} src={m.url}>
                                        <div className="w-56 h-72 md:w-64 md:h-80 rounded-2xl overflow-hidden border border-white/40 bg-white/10 backdrop-blur-sm shadow-xl cursor-pointer">
                                            <img src={m.url} alt="" loading="lazy" className="w-full h-full object-cover" />
                                        </div>
                                    </PhotoView>
                                )}
                            />
                        </PhotoProvider>
                    </div>
                </section>
            )}

            {/* Signature dishes — frosted tiles in a snap-scrolling row, echoing
               the hero's frosted-glass chrome */}
            {signatureDishes.length > 0 && (
                <section className="py-16 border-t border-[var(--t-border)]">
                    <div className={`${SECTION_CONTAINER} !px-6 md:!px-10`}>
                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                            <Snowflake size={20} className="text-[var(--t-accent)]" />
                            {t("business_page.signature_dishes.section_title", "On the Mountain")}
                        </h2>
                        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:thin] [perspective:1000px]">
                            {signatureDishes.map((dish) => (
                                <TiltCard
                                    key={dish.id}
                                    maxDeg={10}
                                    className="relative shrink-0 w-56 h-72 snap-start rounded-2xl overflow-hidden border border-[var(--t-border)] shadow-md"
                                >
                                    <img src={dish.imageUrl} alt={dish.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4 rounded-2xl m-2 bg-white/10 backdrop-blur-md border border-white/20 text-white">
                                        <p className="font-semibold leading-tight">{dish.name}</p>
                                        <p className="text-sm text-white/80 mt-0.5">{profile.currency || "€"}{dish.price}</p>
                                    </div>
                                </TiltCard>
                            ))}
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
