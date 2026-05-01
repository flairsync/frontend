import React, { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronDown, ShoppingBag, Newspaper, Video, Briefcase } from "lucide-react";
import { Button } from "../ui/button";
import { usePageContext } from "vike-react/usePageContext";
import { useTranslation } from "react-i18next";
import WebsiteLogo from "../shared/WebsiteLogo";
import HeaderProfileAvatar from "../shared/HeaderProfileAvatar";
import { motion, AnimatePresence } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderProps = {
    activeTag?: string;
    className?: string;
};

const PublicFeedHeader = ({ activeTag, className }: HeaderProps) => {
    const { user } = usePageContext();
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const headerRef = useRef<HTMLElement>(null);

    /* ---------------------------------------------
     * Sync header height to CSS variable
     * --------------------------------------------*/
    useEffect(() => {
        const updateHeaderHeight = () => {
            if (headerRef.current) {
                document.documentElement.style.setProperty(
                    "--public-header-height",
                    `${headerRef.current.offsetHeight}px`
                );
            }
        };

        updateHeaderHeight();
        window.addEventListener("resize", updateHeaderHeight);

        return () => window.removeEventListener("resize", updateHeaderHeight);
    }, []);

    /* ---------------------------------------------
     * Close mobile menu on resize
     * --------------------------------------------*/
    useEffect(() => {
        const closeMenu = () => setIsOpen(false);
        window.addEventListener("resize", closeMenu);
        return () => window.removeEventListener("resize", closeMenu);
    }, []);

    return (
        <motion.header
            ref={headerRef}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`z-50 bg-background/60 backdrop-blur-xl border-b border-white/10 ${className || "fixed top-0 w-full"}`}
        >
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <a href="/feed" className="flex items-center hover:opacity-80 transition-opacity">
                    <WebsiteLogo />
                </a>

                {/* Desktop actions */}
                <div className="hidden md:flex items-center gap-6">
                    <nav className="flex items-center gap-6 mr-4">
                        <a href="/feed" className="flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors">
                            <Newspaper className="w-3.5 h-3.5" />
                            {t("public_feed.header.feed", "Feed")}
                        </a>
                        <a href="/explore" className="flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors">
                            <Video className="w-3.5 h-3.5" />
                            {t("public_feed.header.explore", "Explore")}
                        </a>
                        <a href="/jobs" className="flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors">
                            <Briefcase className="w-3.5 h-3.5" />
                            {t("public_feed.header.jobs", "Jobs")}
                        </a>

                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors outline-none">
                                <ShoppingBag className="w-3.5 h-3.5" />
                                {t("public_feed.header.marketplace", "Marketplace")}
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48 bg-background/95 backdrop-blur-md border-white/10 mt-2">
                                <DropdownMenuItem asChild>
                                    <a href="/marketplace/guest" className="cursor-pointer py-2">
                                        Guest Shop
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <a href="/marketplace/b2b" className="cursor-pointer py-2">
                                        B2B Supplies
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <a href="/marketplace/saas" className="cursor-pointer py-2">
                                        Official Gear
                                    </a>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </nav>
                    {user ? (
                        <HeaderProfileAvatar />
                    ) : (
                        <a href="/login">
                            <Button className="px-6 rounded-full font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
                                {t("landing_page.header.joinUsButton")}
                            </Button>
                        </a>
                    )}
                </div>

                {/* Mobile toggle */}
                <button
                    className="md:hidden p-2 rounded-full hover:bg-foreground/5 transition-colors"
                    onClick={() => setIsOpen((prev) => !prev)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* ---------------------------------------------
             * Mobile menu
             * --------------------------------------------*/}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t bg-background/95 backdrop-blur-lg overflow-hidden"
                    >
                        <nav className="flex flex-col px-6 py-6 space-y-4">
                            <a
                                href="/feed"
                                className="flex items-center gap-2 text-lg font-medium hover:text-primary transition"
                                onClick={() => setIsOpen(false)}
                            >
                                <Newspaper className="w-5 h-5" />
                                {t("public_feed.header.feed", "Feed")}
                            </a>

                            <a
                                href="/explore"
                                className="flex items-center gap-2 text-lg font-medium hover:text-primary transition"
                                onClick={() => setIsOpen(false)}
                            >
                                <Video className="w-5 h-5" />
                                {t("public_feed.header.explore", "Explore")}
                            </a>

                            <a
                                href="/jobs"
                                className="flex items-center gap-2 text-lg font-medium hover:text-primary transition"
                                onClick={() => setIsOpen(false)}
                            >
                                <Briefcase className="w-5 h-5" />
                                {t("public_feed.header.jobs", "Jobs")}
                            </a>

                            {/* Mobile Marketplace Links */}
                            <div className="pt-2 flex flex-col space-y-3 pl-2 border-l-2 border-white/10 ml-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest bg-background px-1 rounded inline-block -ml-4 w-max">
                                    {t("public_feed.header.marketplace", "Marketplace")}
                                </span>
                                <a
                                    href="/marketplace/guest"
                                    className="text-md font-medium text-foreground/80 hover:text-primary transition"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Guest Shop
                                </a>
                                <a
                                    href="/marketplace/b2b"
                                    className="text-md font-medium text-foreground/80 hover:text-primary transition"
                                    onClick={() => setIsOpen(false)}
                                >
                                    B2B Supplies
                                </a>
                                <a
                                    href="/marketplace/saas"
                                    className="text-md font-medium text-foreground/80 hover:text-primary transition"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Official Gear
                                </a>
                            </div>

                            <div className="pt-4 border-t border-foreground/5">
                                {user ? (
                                    <div className="flex items-center gap-3">
                                        <HeaderProfileAvatar />
                                    </div>
                                ) : (
                                    <a href="/login" onClick={() => setIsOpen(false)}>
                                        <Button className="w-full rounded-full py-6 text-lg font-semibold">
                                            {t("landing_page.header.joinUsButton")}
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default PublicFeedHeader;

