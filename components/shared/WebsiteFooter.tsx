"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Facebook, Linkedin, Twitter, Info, FileText, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

// Social Links
const socialLinks = [
    { icon: Facebook, label: "Facebook", url: "https://facebook.com" },
    { icon: Twitter, label: "Twitter", url: "https://twitter.com" },
    { icon: Linkedin, label: "LinkedIn", url: "https://linkedin.com" },
];

// Quick Links
const quickLinks = [
    { title: "Home", url: "/", icon: Info },
    { title: "About Us", url: "/about", icon: Info },
    { title: "Integrations", url: "/#integration", icon: Info },
    { title: "Features", url: "/#features", icon: Info },
    { title: "Pricing", url: "/#pricing", icon: Info },
    { title: "Contact Us", url: "/contact", icon: Info },
];

// Support Links
const supportLinks = [
    { title: "FAQ's", url: "/#faq", icon: HelpCircle },
    { title: "Support Center", url: "/support", icon: HelpCircle },
    { title: "Privacy Policy", url: "/privacy", icon: FileText },
    { title: "Terms", url: "/terms", icon: FileText },
];

const WebsiteFooter = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-card text-card-foreground font-sans border-t border-border mt-16">
            <div className="container mx-auto max-w-7xl px-6 py-16 space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand & Social */}
                    <div className="space-y-4 text-center sm:text-left">
                        <h2 className="text-3xl font-extrabold">FlairSync</h2>
                        <p className="text-muted-foreground">{t("footer.follow_us", { defaultValue: "Follow us" })}</p>
                        <div className="flex justify-center sm:justify-start gap-2">
                            {socialLinks.map(({ icon: Icon, label, url }) => (
                                <Button
                                    key={label}
                                    asChild
                                    variant="outline"
                                    size="icon"
                                    aria-label={label}
                                    className="hover:bg-primary hover:text-primary-foreground transition-colors rounded-md"
                                >
                                    <a href={url} target="_blank" rel="noopener noreferrer">
                                        <Icon className="w-5 h-5" />
                                    </a>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <nav className="space-y-4 text-center sm:text-left">
                        <h3 className="text-lg font-semibold">{t("footer.quick_links.title", { defaultValue: "Quick Links" })}</h3>
                        <ul className="space-y-2">
                            {quickLinks.map(({ title, url, icon: Icon }) => (
                                <li key={title}>
                                    <a
                                        href={url}
                                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200"
                                    >
                                        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
                                        {t(`footer.quick_links.${title.toLowerCase().replace(/ /g, "_")}`, { defaultValue: title })}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Support Links */}
                    <nav className="space-y-4 text-center sm:text-left">
                        <h3 className="text-lg font-semibold">{t("footer.support.title", { defaultValue: "Support" })}</h3>
                        <ul className="space-y-2">
                            {supportLinks.map(({ title, url, icon: Icon }) => (
                                <li key={title}>
                                    <a
                                        href={url}
                                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200"
                                    >
                                        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
                                        {t(`footer.support.${title.toLowerCase().replace(/[' ]/g, "_")}`, { defaultValue: title })}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Contact & Newsletter */}
                    <div className="space-y-6 text-center sm:text-left">
                        <div>
                            <h3 className="text-lg font-semibold">{t("footer.contact.title", { defaultValue: "Contact" })}</h3>
                            <address className="not-italic text-muted-foreground mt-2 space-y-1">
                                <p>Andorra La Vella, AD500, Andorra</p>
                                <p>+376 123 456</p>
                            </address>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold">
                                {t("footer.newsletter.title", { defaultValue: "Subscribe to our Newsletter" })}
                            </h4>
                            <form className="flex w-full max-w-sm mx-auto sm:mx-0 mt-3 items-center space-x-2">
                                <Input
                                    type="email"
                                    placeholder={t("footer.newsletter.placeholder", { defaultValue: "Enter your email" })}
                                    className="h-11 border-input focus-visible:ring-0 focus-visible:border-primary"
                                    required
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="h-11 w-11 bg-primary text-primary-foreground hover:bg-primary/90"
                                    aria-label="Subscribe"
                                >
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} FlairSync. {t("footer.rights", { defaultValue: "All Rights Reserved." })}
                </div>
            </div>
        </footer>
    );
};

export default WebsiteFooter;
