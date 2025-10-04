"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Phone, Mail, Globe, Instagram, Facebook } from "lucide-react";
import { motion } from "framer-motion";

// ---- 📦 Data ---- //
const CONTACT_INFO = {
    phone: "+376 123 456",
    email: "info@cafemontserrat.ad",
};

const SOCIAL_LINKS = [
    {
        id: "instagram",
        label: "Instagram",
        icon: <Instagram className="w-4 h-4" />,
        href: "https://instagram.com",
    },
    {
        id: "facebook",
        label: "Facebook",
        icon: <Facebook className="w-4 h-4" />,
        href: "https://facebook.com",
    },
    {
        id: "website",
        label: "Website",
        icon: <Globe className="w-4 h-4" />,
        href: "https://cafemontserrat.ad",
    },
];

// ---- ☎️ Component ---- //
const BusinessDetailsContact: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight">
                {t("business_page.contact.section_title", "Contact Us")}
            </h2>

            <Card className="border border-gray-200 shadow-sm">
                <CardContent className="space-y-6 pt-6">
                    {/* Contact Info */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-700">
                            <Phone className="w-5 h-5 text-emerald-600" />
                            <a
                                href={`tel:${CONTACT_INFO.phone}`}
                                className="hover:underline transition-colors"
                            >
                                {CONTACT_INFO.phone}
                            </a>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <Mail className="w-5 h-5 text-blue-600" />
                            <a
                                href={`mailto:${CONTACT_INFO.email}`}
                                className="hover:underline transition-colors"
                            >
                                {CONTACT_INFO.email}
                            </a>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100"></div>

                    {/* Social Links */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-3">
                            {t("business_page.contact.follow_us", "Follow us")}
                        </h3>

                        <div className="flex flex-wrap gap-3">
                            {SOCIAL_LINKS.map((link, index) => (
                                <motion.a
                                    key={link.id}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.97 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        {link.icon}
                                        {t(
                                            `business_page.contact.buttons.${link.id}`,
                                            link.label
                                        )}
                                    </Button>
                                </motion.a>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
};

export default BusinessDetailsContact;
