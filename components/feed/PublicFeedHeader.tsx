import React, { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import { usePageContext } from "vike-react/usePageContext";
import { useTranslation } from "react-i18next";
import WebsiteLogo from "../shared/WebsiteLogo";
import HeaderProfileAvatar from "../shared/HeaderProfileAvatar";
import { motion, AnimatePresence } from "framer-motion";

type HeaderProps = {
    activeTag?: string;
};

const PublicFeedHeader = ({ activeTag }: HeaderProps) => {
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
            className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-white/10"
        >
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <a href="/feed" className="flex items-center hover:opacity-80 transition-opacity">
                    <WebsiteLogo />
                </a>

                {/* Desktop actions */}
                <div className="hidden md:flex items-center gap-6">
                    <nav className="flex items-center gap-6 mr-4">
                        <a href="/feed" className="text-sm font-medium hover:text-primary transition-colors">
                            {t("public_feed.header.feed", "Feed")}
                        </a>
                        <a href="/explore" className="text-sm font-medium hover:text-primary transition-colors">
                            {t("public_feed.header.explore", "Explore")}
                        </a>
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
                                className="text-lg font-medium hover:text-primary transition"
                                onClick={() => setIsOpen(false)}
                            >
                                {t("public_feed.header.feed", "Feed")}
                            </a>

                            <a
                                href="/explore"
                                className="text-lg font-medium hover:text-primary transition"
                                onClick={() => setIsOpen(false)}
                            >
                                {t("public_feed.header.explore", "Explore")}
                            </a>

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

