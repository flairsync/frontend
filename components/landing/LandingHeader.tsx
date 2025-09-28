import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import WebsiteLogo from "../shared/WebsiteLogo";

const NAV_LINKS = [
    { name: "home_tab_title", href: "#home" },
    { name: "businesses_tab_title", href: "/feed" },
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
        className={`relative ${active ? "font-bold" : ""} text-foreground hover:text-primary transition hover:cursor-pointer`}
    >
        {children}
        <svg
            className="absolute left-0 -bottom-1 w-full h-1 text-green-500 transition-all duration-500 ease-in-out"
            style={{ width: active ? "100%" : "0%", transformOrigin: "right" }}
            viewBox="0 0 100 4"
            preserveAspectRatio="none"
        >
            <line x1="0" y1="2" x2="100" y2="2" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
    </a>
);

type HeaderProps = {
    activeTag?: string;
};

const LandingHeader = (props: HeaderProps) => {
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
        <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-background/70">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Left Section: Logo + Nav */}
                <div className="flex items-center space-x-12">
                    <a href="/">
                        <WebsiteLogo />
                    </a>
                    <nav className="hidden md:flex space-x-8 items-center">
                        {NAV_LINKS.map((val) => (
                            <AnimatedNavLink key={val.name} active={isActiveHash(val.href)} href={val.href}>
                                {t(`landing_page.header.navLinks.${val.name}`)}
                            </AnimatedNavLink>
                        ))}
                    </nav>
                </div>

                {/* Right Section: Join Us + Mobile Menu */}
                <div className="md:flex hidden items-center space-x-4">
                    <a href="/login">
                        <Button
                            className="px-8 py-2 hover:cursor-pointer bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
                            variant="default"
                        >
                            {t("landing_page.header.joinUsButton")}
                        </Button>
                    </a>
                    <button className="md:hidden text-foreground" onClick={toggleMenu}>
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
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