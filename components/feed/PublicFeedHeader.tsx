import React, { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import { usePageContext } from "vike-react/usePageContext";
import { useTranslation } from "react-i18next";
import WebsiteLogo from "../shared/WebsiteLogo";
import HeaderProfileAvatar from "../shared/HeaderProfileAvatar";

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
        <header
            ref={headerRef}
            className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-md border-b"
        >
            <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
                {/* Logo */}
                <a href="/feed" className="flex items-center">
                    <WebsiteLogo />
                </a>

                {/* Desktop actions */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <HeaderProfileAvatar />
                    ) : (
                        <a href="/login">
                            <Button className="px-8">
                                {t("landing_page.header.joinUsButton")}
                            </Button>
                        </a>
                    )}
                </div>

                {/* Mobile toggle */}
                <button
                    className="md:hidden text-foreground"
                    onClick={() => setIsOpen((prev) => !prev)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* ---------------------------------------------
             * Mobile menu
             * --------------------------------------------*/}
            {isOpen && (
                <div className="md:hidden border-t bg-background/95 backdrop-blur-md shadow-lg">
                    <nav className="flex flex-col px-6 py-4 space-y-4">
                        <a
                            href="/feed"
                            className="text-foreground hover:text-primary transition"
                            onClick={() => setIsOpen(false)}
                        >
                            Feed
                        </a>

                        <a
                            href="/explore"
                            className="text-foreground hover:text-primary transition"
                            onClick={() => setIsOpen(false)}
                        >
                            Explore
                        </a>

                        <div className="pt-3 border-t">
                            {user ? (
                                <HeaderProfileAvatar />
                            ) : (
                                <a href="/login" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full">
                                        {t("landing_page.header.joinUsButton")}
                                    </Button>
                                </a>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default PublicFeedHeader;
