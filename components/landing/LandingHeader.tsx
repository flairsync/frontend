import React, { useState } from "react";
import { Menu, X, Compass, Store } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import WebsiteLogo from "../shared/WebsiteLogo";
import { useProfile } from "@/features/profile/useProfile";
import { usePageContext } from "vike-react/usePageContext";
import HeaderProfileAvatar from "../shared/HeaderProfileAvatar";

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
};

const LandingHeader = (props: HeaderProps) => {
    const { user } = usePageContext();
    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => setIsOpen(!isOpen);
    const { t } = useTranslation();

    const isActiveHash = (href: string) => {
        if (props.activeTag) {
            return props.activeTag.toLowerCase() === href.slice(1).toLowerCase();
        }
        return false;
    };

    return (
        <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-white/10 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Left Section: Logo + Nav */}
                <div className="flex items-center space-x-10">
                    <a href="/" className="hover:opacity-90 transition-opacity">
                        <WebsiteLogo />
                    </a>
                    <nav className="hidden lg:flex space-x-8 items-center mt-1">
                        {NAV_LINKS.map((val) => (
                            <AnimatedNavLink key={val.name} active={isActiveHash(val.href)} href={val.href}>
                                {t(`landing_page.header.navLinks.${val.name}`)}
                            </AnimatedNavLink>
                        ))}
                    </nav>
                </div>

                {/* Right Section: Apps + Auth + Mobile Menu */}
                <div className="flex items-center space-x-4">
                    <div className="hidden md:flex items-center space-x-2 mr-2">
                        <a href="/feed">
                            <Button variant="ghost" className="text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2">
                                <Compass className="w-4 h-4" />
                                {t("public_feed.title", "Explore Feed")}
                            </Button>
                        </a>
                        <a href="/marketplace/guest">
                            <Button variant="ghost" className="text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2">
                                <Store className="w-4 h-4" />
                                {t("marketplace.title", "Marketplace")}
                            </Button>
                        </a>
                    </div>

                    <div className="hidden md:flex items-center pl-2 border-l border-border/50">
                        {user ? (
                            <HeaderProfileAvatar />
                        ) : (
                            <a href="/login">
                                <Button
                                    className="px-6 py-2 ml-2 hover:cursor-pointer bg-primary text-primary-foreground rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    {t("landing_page.header.joinUsButton")}
                                </Button>
                            </a>
                        )}
                    </div>

                    <button
                        className="lg:hidden p-2 text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                        onClick={toggleMenu}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden absolute top-20 left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border shadow-lg p-6 flex flex-col space-y-4">
                    <nav className="flex flex-col space-y-4">
                        {NAV_LINKS.map((val) => (
                            <a
                                key={val.name}
                                href={val.href}
                                className={`text-base font-medium ${isActiveHash(val.href) ? 'text-primary' : 'text-foreground/80'} hover:text-primary transition-colors`}
                                onClick={() => setIsOpen(false)}
                            >
                                {t(`landing_page.header.navLinks.${val.name}`)}
                            </a>
                        ))}

                        <div className="h-px w-full bg-border/50 my-2" />

                        <a href="/feed" className="flex items-center gap-2 text-base font-medium text-foreground/80 hover:text-primary" onClick={() => setIsOpen(false)}>
                            <Compass className="w-5 h-5" />
                            {t("public_feed.title", "Explore Feed")}
                        </a>
                        <a href="/marketplace/guest" className="flex items-center gap-2 text-base font-medium text-foreground/80 hover:text-primary" onClick={() => setIsOpen(false)}>
                            <Store className="w-5 h-5" />
                            {t("marketplace.title", "Marketplace")}
                        </a>

                        {!user && (
                            <div className="pt-4">
                                <a href="/login" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full rounded-full bg-primary text-primary-foreground">
                                        {t("landing_page.header.joinUsButton")}
                                    </Button>
                                </a>
                            </div>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default LandingHeader;





/*


import React, { act, useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react"; // optional for icons
import { Button } from "../ui/button";
import { usePageContext } from "vike-react/usePageContext";
import { LanguageSwitcher } from "../shared/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import WebsiteLogo from "../shared/WebsiteLogo";



const NAV_LINKS = [{
    name: "home_tab_title",
    href: "#home"
},
{
    name: "businesses_tab_title",
    href: "/feed"
},
{
    name: "features_tab_title",
    href: "#features"
},
{
    name: "solution_tab_title",
    href: "#prob_solution"
},
{
    name: "integration_tab_title",
    href: "#integration"
}, {
    name: "pricing_tab_title",
    href: "#pricing"
},
{
    name: "faq_tab_title",
    href: "#faq"
},]

const AnimatedNavLink = ({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) => {

    return (
        <a
            href={href}
            className={`relative ${active ? "font-bold" : ""} text-foreground hover:text-primary transition hover:cursor-pointer`}>
            {children}
            <svg
                className={`
          absolute left-0 -bottom-1 w-full h-1 text-green-500
          transition-all duration-500 ease-in-out 
        `}
                style={{
                    width: active ? "100%" : "0%",
                    transformOrigin: "right",
                }}

                viewBox="0 0 100 4"
                preserveAspectRatio="none"
            >
                <line
                    x1="0"
                    y1="2"
                    x2="100"
                    y2="2"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
            </svg>
        </a>
    );
};

type HeaderProps = {
    activeTag?: string
}
const LandingHeader = (props: HeaderProps) => {

    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => setIsOpen(!isOpen);
    const { t } = useTranslation();




    const isActiveHash = (href: string) => {

        if (props.activeTag) {
            return props.activeTag.toLowerCase() == href.slice(1).toLowerCase();
        }
        return false;
    }

    return (
        <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-background/70 ">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-12">
                    <a
                        href="/"
                    >
                        <WebsiteLogo />
                    </a>
                    <nav className="hidden md:flex space-x-8 items-center">
                        {
                            NAV_LINKS.map(val => {
                                return <AnimatedNavLink
                                    active={isActiveHash(val.href)}
                                    href={val.href}

                                >
                                    <>{t(val.name)}</>
                                </AnimatedNavLink>
                            })
                        }
                    </nav>
                </div>

                <div className="md:flex hidden items-center space-x-4  ">
                  <LanguageSwitcher />
                    <a
                        href="/feed"
                    >

                        <Button
                            className="px-8 py-2 hover:cursor-pointer bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
                            variant="default"
                        >
                            {t("find_business_tab_title")}
                        </Button>

                    </a>
                    <a
                        href="/login"
                    >

                        <Button
                            className="px-8 py-2 hover:cursor-pointer bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
                            variant="default"
                        >
                            {t("join_us_tab_title")}
                        </Button>

                    </a>
                    <button className="md:hidden text-foreground" onClick={toggleMenu}>
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div> 

           Mobile Menu  TODO
             {isOpen && (
                <div className="md:hidden bg-background/95 backdrop-blur-md shadow-md">
                    <nav className="flex flex-col px-6 py-4 space-y-3">
                        <a href="#features" className="text-foreground hover:text-primary transition" onClick={() => setIsOpen(false)}>Features</a>
                        <a href="#pricing" className="text-foreground hover:text-primary transition" onClick={() => setIsOpen(false)}>Pricing</a>
                        <a href="#faq" className="text-foreground hover:text-primary transition" onClick={() => setIsOpen(false)}>FAQ</a>
                        <a href="#contact" className="text-foreground hover:text-primary transition" onClick={() => setIsOpen(false)}>Contact</a>
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition">
                            Start Free Trial
                        </button>
                    </nav>
                </div>
            )} 
        </header>
    )
}

export default LandingHeader

*/