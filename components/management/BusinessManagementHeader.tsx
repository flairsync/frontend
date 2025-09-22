import React, { act, useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react"; // optional for icons
import { Button } from "../ui/button";
import { usePageContext } from "vike-react/usePageContext";
import { LanguageSwitcher } from "../shared/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import WebsiteLogo from "../shared/WebsiteLogo";
import { useAuth } from "@/features/auth/useAuth";
import { Avatar } from "../ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import HeaderProfileAvatar from "../shared/HeaderProfileAvatar";




type HeaderProps = {
    activeTag?: string
}
const BusinessManagementHeader = (props: HeaderProps) => {

    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => setIsOpen(!isOpen);
    const { t } = useTranslation();
    const {
        userAuthProfile
    } = useAuth();



    const isActiveHash = (href: string) => {

        if (props.activeTag) {
            return props.activeTag.toLowerCase() == href.slice(1).toLowerCase();
        }
        return false;
    }

    return (
        <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-background/70 ">
            <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
                {/* Left Section: Logo + Nav */}
                <div className="flex items-center space-x-12">
                    <a
                        href="/feed"
                    >
                        <WebsiteLogo />
                    </a>
                </div>

                {/* Right Section: Join Us + Mobile Menu */}
                <div className="md:flex hidden items-center space-x-4  ">
                    {/* <LanguageSwitcher /> */}

                    {
                        !userAuthProfile ? <HeaderProfileAvatar /> : <a
                            href="/login"
                        >

                            <Button
                                className="px-8 py-2 hover:cursor-pointer bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
                                variant="default"
                            >
                                {t("join_us_tab_title")}
                            </Button>

                        </a>
                    }

                    <button className="md:hidden text-foreground" onClick={toggleMenu}>
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu  TODO */}
            {/*  {isOpen && (
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
            )} */}
        </header>
    )
}

export default BusinessManagementHeader