import React, { useEffect, useRef, useState } from "react";
import { Menu, X, Compass, Store, ChevronDown, Briefcase, Newspaper, ShoppingBag } from "lucide-react";
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import WebsiteLogo from "../shared/WebsiteLogo";
import { usePageContext } from "vike-react/usePageContext";
import HeaderProfileAvatar from "../shared/HeaderProfileAvatar";
import MobileProfileSheet from "../shared/MobileProfileSheet";
import { LanguageSwitcher } from "../shared/LanguageSwitcher";
import { ThemeToggle } from "../shared/ThemeToggle";
import { TextSizeToggle } from "../shared/TextSizeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "@/features/profile/useProfile";

const NAV_LINKS = [
    { name: "home_tab_title", href: "#home" },
    { name: "features_tab_title", href: "#features" },
    { name: "solution_tab_title", href: "#prob_solution" },
    { name: "integration_tab_title", href: "#integration" },
    { name: "pricing_tab_title", href: "#pricing" },
    { name: "faq_tab_title", href: "#faq" },
];

const AnimatedNavLink = ({
    href,
    children,
    active,
}: {
    href: string;
    children: React.ReactNode;
    active: boolean;
}) => (
    <a
        href={href}
        className={`relative ${active ? "font-bold text-primary" : "text-foreground/80"} hover:text-primary transition-colors duration-200 text-sm font-medium hover:cursor-pointer`}
    >
        {children}
        <svg
            className="absolute left-0 -bottom-1 w-full h-0.5 text-primary transition-all duration-300 ease-out"
            style={{ width: active ? "100%" : "0%", transformOrigin: "right" }}
            viewBox="0 0 100 2"
            preserveAspectRatio="none"
        >
            <line x1="0" y1="1" x2="100" y2="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    </a>
);

type HeaderProps = {
    activeTag?: string;
    showSectionNav?: boolean;
    disableEntryAnimation?: boolean;
    className?: string;
    // Pages that are prerendered (built once, no per-request SSR) can't rely on
    // pageContext.user — it's frozen at build time. Those pages pass this to
    // force a live client-side auth check instead.
    liveAuthCheck?: boolean;
};

const LandingHeader = ({ activeTag, showSectionNav = true, disableEntryAnimation, className, liveAuthCheck = false }: HeaderProps) => {
    const { user: ssrUser } = usePageContext();
    const { userProfile, loadingUserProfile } = useProfile({ enabled: liveAuthCheck });
    const user = liveAuthCheck ? (userProfile ?? null) : ssrUser;
    const authResolved = !liveAuthCheck || !loadingUserProfile;
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation("landing");
    const headerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const onResize = () => {
            if (headerRef.current) {
                document.documentElement.style.setProperty(
                    "--public-header-height",
                    `${headerRef.current.offsetHeight}px`
                );
            }
            // Only auto-close the mobile drawer when the viewport actually crosses
            // into the desktop layout (matches the `md:` breakpoint that swaps the
            // hamburger for the desktop nav) — not on every `resize` event. Mobile
            // browsers fire `resize` for reasons unrelated to a width change (e.g.
            // the address bar collapsing/expanding on scroll), which was closing
            // the drawer out from under the user before they could tap anything
            // inside it, including the Login button.
            if (window.innerWidth >= 768) setIsOpen(false);
        };
        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const isActiveHash = (href: string) => {
        if (activeTag) return activeTag.toLowerCase() === href.slice(1).toLowerCase();
        return false;
    };

    return (
        <header
            ref={headerRef}
            className={`fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-white/10 shadow-sm ${className ?? ""}`}
        >
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Left: Logo + Desktop section nav (landing only) */}
                <div className="flex items-center space-x-10">
                    <a href="/" className="hover:opacity-90 transition-opacity">
                        <WebsiteLogo />
                    </a>
                    {showSectionNav && (
                        <nav className="hidden lg:flex space-x-8 items-center">
                            {NAV_LINKS.map((val) => (
                                <AnimatedNavLink key={val.name} active={isActiveHash(val.href)} href={val.href}>
                                    {t(`landing_page.header.navLinks.${val.name}`)}
                                </AnimatedNavLink>
                            ))}
                        </nav>
                    )}
                </div>

                {/* Right: nav links + Language/Theme + Auth */}
                <div className="flex items-center space-x-2">
                    {/* Desktop: Explore dropdown (landing) OR individual links (other pages) */}
                    <div className="hidden md:flex items-center">
                        {showSectionNav ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-1.5">
                                        <Compass className="w-4 h-4" />
                                        {t("landing_page.header.explore", "Explore")}
                                        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuItem asChild>
                                        <a href="/feed" className="flex items-center gap-2">
                                            <Compass className="w-4 h-4 text-muted-foreground" />
                                            {t("public_feed.title", "Explore Feed")}
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <a href="/jobs" className="flex items-center gap-2">
                                            <Briefcase className="w-4 h-4 text-muted-foreground" />
                                            {t("landing_page.header.jobs", "Jobs")}
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <a href="/marketplace/guest" className="flex items-center gap-2">
                                            <Store className="w-4 h-4 text-muted-foreground" />
                                            {t("marketplace.title", "Marketplace")}
                                        </a>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <nav className="flex items-center gap-5 mr-2">
                                <a href="/feed" className="flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                                    <Newspaper className="w-4 h-4" />
                                    {t("public_feed.title", "Feed")}
                                </a>
                                <a href="/jobs" className="flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                                    <Briefcase className="w-4 h-4" />
                                    {t("landing_page.header.jobs", "Jobs")}
                                </a>
                                <a href="/marketplace/guest" className="flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                                    <ShoppingBag className="w-4 h-4" />
                                    {t("marketplace.title", "Marketplace")}
                                </a>
                            </nav>
                        )}
                    </div>

                    {authResolved && !user && <LanguageSwitcher compact />}
                    {authResolved && !user && <ThemeToggle />}
                    {authResolved && !user && <TextSizeToggle />}

                    {/* Desktop auth */}
                    <div className="hidden md:flex items-center pl-2 border-l border-border/50">
                        {!authResolved ? (
                            <div className="w-9 h-9" />
                        ) : user ? (
                            <HeaderProfileAvatar />
                        ) : (
                            <a href="/login">
                                <Button className="px-5 py-2 ml-1 hover:cursor-pointer bg-primary text-primary-foreground rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-sm">
                                    {t("landing_page.header.joinUsButton")}
                                </Button>
                            </a>
                        )}
                    </div>

                    {/* Mobile: avatar sheet (logged in) + hamburger */}
                    <div className="md:hidden flex items-center gap-2">
                        {authResolved && user && <MobileProfileSheet />}
                        <button
                            className="lg:hidden p-2 text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile slide-down nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden border-t bg-background/95 backdrop-blur-xl overflow-hidden"
                    >
                        <nav className="flex flex-col px-6 py-6 space-y-4">
                            {showSectionNav && NAV_LINKS.map((val) => (
                                <a
                                    key={val.name}
                                    href={val.href}
                                    className={`text-base font-medium ${isActiveHash(val.href) ? "text-primary" : "text-foreground/80"} hover:text-primary transition-colors`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {t(`landing_page.header.navLinks.${val.name}`)}
                                </a>
                            ))}

                            {showSectionNav && <div className="h-px w-full bg-border/50" />}

                            <a href="/feed" className="flex items-center gap-2 text-base font-medium text-foreground/80 hover:text-primary" onClick={() => setIsOpen(false)}>
                                <Compass className="w-5 h-5" />
                                {t("public_feed.title", "Explore Feed")}
                            </a>
                            <a href="/jobs" className="flex items-center gap-2 text-base font-medium text-foreground/80 hover:text-primary" onClick={() => setIsOpen(false)}>
                                <Briefcase className="w-5 h-5" />
                                {t("landing_page.header.jobs", "Jobs")}
                            </a>
                            <a href="/marketplace/guest" className="flex items-center gap-2 text-base font-medium text-foreground/80 hover:text-primary" onClick={() => setIsOpen(false)}>
                                <Store className="w-5 h-5" />
                                {t("marketplace.title", "Marketplace")}
                            </a>

                            {authResolved && !user && (
                                <div className="pt-1 flex items-center gap-2">
                                    <LanguageSwitcher />
                                    <ThemeToggle />
                                    <TextSizeToggle />
                                </div>
                            )}

                            {authResolved && !user && (
                                <div className="pt-4">
                                    <a href="/login" onClick={() => setIsOpen(false)}>
                                        <Button className="w-full rounded-full bg-primary text-primary-foreground">
                                            {t("landing_page.header.joinUsButton")}
                                        </Button>
                                    </a>
                                </div>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default LandingHeader;
