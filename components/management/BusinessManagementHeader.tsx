import React, { useEffect, useState } from "react";
import { Menu, X, ChevronDown, ShoppingBag } from "lucide-react";
import { Button } from "../ui/button";
import { usePageContext } from "vike-react/usePageContext";
import { useTranslation } from "react-i18next";
import WebsiteLogo from "../shared/WebsiteLogo";
import HeaderProfileAvatar from "../shared/HeaderProfileAvatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderProps = {
    activeTag?: string;
};

const BusinessManagementHeader = ({ activeTag }: HeaderProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();
    const { user } = usePageContext();


    /* ---------------------------------------------
     * Close mobile menu on route change / resize
     * --------------------------------------------*/
    useEffect(() => {
        const closeMenu = () => setIsOpen(false);
        window.addEventListener("resize", closeMenu);
        return () => window.removeEventListener("resize", closeMenu);
    }, []);

    return (
        <header
            className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-md border-b h-20 pb-20"
        >
            <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
                {/* Logo */}
                <a href="/feed" className="flex items-center">
                    <WebsiteLogo />
                </a>

                {/* Desktop actions */}
                <div className="hidden md:flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="gap-2">
                                <ShoppingBag className="w-4 h-4" />
                                Marketplace
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                                <a href="/marketplace/guest" className="cursor-pointer">Guest Shop</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a href="/marketplace/b2b" className="cursor-pointer">B2B Supplies</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a href="/marketplace/saas" className="cursor-pointer">Official Gear</a>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {user ? (
                        <HeaderProfileAvatar />
                    ) : (
                        <a href="/login">
                            <Button className="px-8">
                                {t("join_us_tab_title")}
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
                            Home
                        </a>

                        <a
                            href="/manage/overview"
                            className="text-foreground hover:text-primary transition"
                            onClick={() => setIsOpen(false)}
                        >
                            Dashboard
                        </a>

                        <a
                            href="/manage/businesses"
                            className="text-foreground hover:text-primary transition"
                            onClick={() => setIsOpen(false)}
                        >
                            Businesses
                        </a>

                        {/* Mobile Marketplace Links */}
                        <div className="pt-2 flex flex-col space-y-3">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Marketplace</span>
                            <a
                                href="/marketplace/guest"
                                className="text-foreground hover:text-primary transition pl-2 border-l-2 border-transparent hover:border-primary"
                                onClick={() => setIsOpen(false)}
                            >
                                Guest Shop
                            </a>
                            <a
                                href="/marketplace/b2b"
                                className="text-foreground hover:text-primary transition pl-2 border-l-2 border-transparent hover:border-primary"
                                onClick={() => setIsOpen(false)}
                            >
                                B2B Supplies
                            </a>
                            <a
                                href="/marketplace/saas"
                                className="text-foreground hover:text-primary transition pl-2 border-l-2 border-transparent hover:border-primary"
                                onClick={() => setIsOpen(false)}
                            >
                                Official Gear
                            </a>
                        </div>

                        <div className="pt-3 border-t">
                            {user ? (
                                <HeaderProfileAvatar />
                            ) : (
                                <a href="/login" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full">
                                        {t("join_us_tab_title")}
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

export default BusinessManagementHeader;
