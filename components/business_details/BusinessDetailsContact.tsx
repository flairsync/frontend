"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Phone, Mail, Globe, Instagram, Facebook, MessageSquare, ExternalLink, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { DiscoveryBusinessProfile } from "@/models/discovery/DiscoveryBusinessProfile";

interface BusinessDetailsContactProps {
    profile: DiscoveryBusinessProfile;
}

const BusinessDetailsContact: React.FC<BusinessDetailsContactProps> = ({ profile }) => {
    const { t } = useTranslation();

    const socialLinks = [
        {
            id: "instagram",
            label: "Instagram",
            icon: <Instagram size={18} />,
            href: profile.instagram,
            color: "hover:bg-pink-500/10 hover:text-pink-500"
        },
        {
            id: "facebook",
            label: "Facebook",
            icon: <Facebook size={18} />,
            href: profile.facebook,
            color: "hover:bg-blue-600/10 hover:text-blue-600"
        },
    ].filter(link => !!link.href);

    return (
        <section className="space-y-12 pb-12">
            <div className="space-y-2 text-center max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold tracking-tight">
                    {t("business_page.contact.section_title", "Get in Touch")}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm">
                    {t("business_page.contact.subtitle", "Have questions or want to make a special request? We're here to help you make your visit perfect.")}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Contact Methods */}
                <div className="space-y-6">
                    <Card className="bg-card border-border/50 rounded-[2rem] overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                        <CardContent className="p-8 space-y-6">
                            {profile.phone && (
                                <div className="flex items-center gap-5">
                                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600">
                                        <Phone size={24} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            {t("business_page.contact.phone_label", "Phone")}
                                        </p>
                                        <a href={`tel:${profile.phone}`} className="text-xl font-bold hover:text-primary transition-colors tracking-tight block">
                                            {profile.phone}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {profile.email && (
                                <div className="flex items-center gap-5">
                                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
                                        <Mail size={24} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            {t("business_page.contact.email_label", "Email")}
                                        </p>
                                        <a href={`mailto:${profile.email}`} className="text-xl font-bold hover:text-primary transition-colors tracking-tight block">
                                            {profile.email}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Button className="w-full h-14 rounded-2xl bg-foreground text-background hover:bg-foreground/90 text-md font-bold tracking-tight shadow-lg">
                        <MessageSquare className="mr-2" size={18} />
                        {t("business_page.contact.send_message_button", "Send us a Message")}
                    </Button>
                </div>

                {/* Social & Web */}
                <div className="space-y-8 flex flex-col justify-center">
                    {socialLinks.length > 0 && (
                        <>
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold tracking-tight">
                                    {t("business_page.contact.social_title", "Find us on Social Media")}
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    {t("business_page.contact.social_subtitle", "Stay updated with our latest news, events and daily specials.")}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {socialLinks.map((link) => (
                                    <motion.a
                                        key={link.id}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ y: -2, scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        className={`flex-1 min-w-[130px] flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50 transition-all ${link.color}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {link.icon}
                                            <span className="font-bold text-sm">{link.label}</span>
                                        </div>
                                        <ExternalLink size={12} className="opacity-40" />
                                    </motion.a>
                                ))}
                            </div>
                        </>
                    )}

                    {profile.website && (
                        <div className="pt-4">
                            <a
                                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                                target="_blank"
                                className="inline-flex items-center gap-2 text-primary font-bold hover:underline group text-sm"
                            >
                                <Globe size={16} />
                                {t("business_page.contact.visit_website", "Visit our Website")}
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default BusinessDetailsContact;

