import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { resolveLinkHref } from "@/features/site-builder/linkPresets";

export interface HeaderCenteredProps {
    primaryColor?: string;
    textColor?: string;
    backgroundImage?: string;
    showLogo?: boolean;
    buttonText?: string;
    buttonHref?: string;
    // Auto-bound business facts — never owner-editable text, see registry defaultBindings.
    businessName?: string;
    tagline?: string;
    logo?: string;
}

const HeaderCentered: React.FC<HeaderCenteredProps> = ({
    primaryColor = "#111827",
    textColor = "#ffffff",
    backgroundImage,
    showLogo = true,
    buttonText,
    buttonHref,
    businessName,
    tagline,
    logo,
}) => {
    return (
        <section
            className="relative overflow-hidden rounded-[2.5rem] shadow-2xl bg-cover bg-center"
            style={{
                backgroundColor: primaryColor,
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            }}
        >
            {backgroundImage && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
            )}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative px-8 py-20 sm:py-32 text-center space-y-6"
                style={{ color: textColor }}
            >
                {showLogo && logo && (
                    <img
                        src={logo}
                        alt={businessName || "Logo"}
                        className="mx-auto h-20 w-20 rounded-2xl object-cover shadow-2xl ring-4 ring-white/20"
                    />
                )}
                <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]">
                    {businessName || "Your Restaurant"}
                </h1>
                {tagline && (
                    <p className="max-w-xl mx-auto text-lg sm:text-xl opacity-80 leading-relaxed">{tagline}</p>
                )}
                {buttonText && (
                    <Button
                        asChild
                        size="lg"
                        className="rounded-full px-8 py-6 text-base font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 mt-2"
                    >
                        <a href={resolveLinkHref(buttonHref)}>{buttonText}</a>
                    </Button>
                )}
            </motion.div>
        </section>
    );
};

export default HeaderCentered;
