import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { resolveLinkHref } from "@/features/site-builder/linkPresets";
import type { NavLinkItem } from "@/features/site-builder/types";

export interface NavbarSimpleProps {
    primaryColor?: string;
    textColor?: string;
    showLogo?: boolean;
    navLinks?: NavLinkItem[];
    buttonText?: string;
    buttonHref?: string;
    // Auto-bound business facts — never owner-editable text, see registry defaultBindings.
    businessName?: string;
    logo?: string;
}

const NavbarSimple: React.FC<NavbarSimpleProps> = ({
    primaryColor = "#1c1a2e",
    textColor = "#ffffff",
    showLogo = true,
    navLinks,
    buttonText,
    buttonHref,
    businessName,
    logo,
}) => {
    const links = navLinks || [];

    return (
        <header className="sticky top-0 z-30 rounded-2xl shadow-lg" style={{ backgroundColor: primaryColor, color: textColor }}>
            <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    {showLogo && logo && (
                        <img src={logo} alt={businessName || "Logo"} className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                    )}
                    <span className="truncate font-bold text-base sm:text-lg">{businessName || "Your Restaurant"}</span>
                </div>

                {/* Desktop nav — collapses to the mobile menu below `lg` so links never overflow */}
                <nav className="hidden lg:flex items-center gap-6 shrink-0">
                    {links.map((link) => (
                        <a
                            key={link.id}
                            href={resolveLinkHref(link.href)}
                            className="text-sm font-semibold whitespace-nowrap opacity-80 hover:opacity-100 transition-opacity"
                        >
                            {link.text}
                        </a>
                    ))}
                    {buttonText && (
                        <Button asChild size="sm" className="rounded-full font-bold">
                            <a href={resolveLinkHref(buttonHref)}>{buttonText}</a>
                        </Button>
                    )}
                </nav>

                {/* Mobile menu */}
                <Sheet>
                    <SheetTrigger asChild>
                        <button
                            className="lg:hidden shrink-0 w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                            style={{ color: textColor }}
                            aria-label="Open menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="flex flex-col gap-1 p-6 pt-12">
                        {links.map((link) => (
                            <SheetClose asChild key={link.id}>
                                <a
                                    href={resolveLinkHref(link.href)}
                                    className="px-2 py-2.5 rounded-lg text-sm font-semibold hover:bg-muted transition-colors"
                                >
                                    {link.text}
                                </a>
                            </SheetClose>
                        ))}
                        {buttonText && (
                            <SheetClose asChild>
                                <Button asChild className="rounded-full font-bold mt-2">
                                    <a href={resolveLinkHref(buttonHref)}>{buttonText}</a>
                                </Button>
                            </SheetClose>
                        )}
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
};

export default NavbarSimple;
