import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveLinkHref } from "@/features/site-builder/linkPresets";
import type { HeaderNavLink } from "./HeaderCentered";

export interface HeaderSplitProps {
    primaryColor?: string;
    textColor?: string;
    backgroundImage?: string;
    showLogo?: boolean;
    navLinks?: HeaderNavLink[];
    buttonText?: string;
    buttonHref?: string;
    imageOnRight?: boolean;
    // Auto-bound business facts — never owner-editable text, see registry defaultBindings.
    businessName?: string;
    tagline?: string;
    logo?: string;
    defaultBackgroundImage?: string;
    rating?: number | null;
    reviewCount?: number;
}

const HeaderSplit: React.FC<HeaderSplitProps> = ({
    primaryColor = "#1c1a2e",
    textColor = "#ffffff",
    backgroundImage,
    showLogo = true,
    navLinks,
    buttonText,
    buttonHref,
    imageOnRight = true,
    businessName,
    tagline,
    logo,
    defaultBackgroundImage,
    rating,
    reviewCount,
}) => {
    const image = backgroundImage || defaultBackgroundImage;

    const textBlock = (
        <motion.div
            initial={{ opacity: 0, x: imageOnRight ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative overflow-hidden flex flex-col justify-center gap-4 p-10 sm:p-14"
            style={{ backgroundColor: primaryColor, color: textColor }}
        >
            <div className="absolute -top-20 -left-16 h-56 w-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-10 h-64 w-64 rounded-full bg-black/20 blur-3xl pointer-events-none" />

            <div className="relative space-y-4">
                {showLogo && logo && (
                    <img
                        src={logo}
                        alt={businessName || "Logo"}
                        className="h-14 w-14 rounded-2xl object-cover shadow-xl ring-4 ring-white/20"
                    />
                )}
                {rating != null && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-md">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        {rating}
                        {reviewCount ? <span className="opacity-70 font-medium">({reviewCount})</span> : null}
                    </div>
                )}
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
                    {businessName || "Your Restaurant"}
                </h1>
                {tagline && <p className="text-base sm:text-lg opacity-80 leading-relaxed max-w-md">{tagline}</p>}
                {buttonText && (
                    <Button
                        asChild
                        size="lg"
                        className="rounded-full w-fit px-8 py-6 text-base font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 mt-1"
                    >
                        <a href={resolveLinkHref(buttonHref)}>{buttonText}</a>
                    </Button>
                )}
            </div>
        </motion.div>
    );

    const imageBlock = (
        <div className="relative min-h-[340px] bg-cover bg-center bg-muted overflow-hidden" style={image ? { backgroundImage: `url(${image})` } : undefined}>
            {image && (
                <div
                    className={`absolute inset-y-0 w-28 bg-gradient-to-r ${imageOnRight ? "left-0 from-black/25 to-transparent" : "right-0 from-transparent to-black/25"
                        }`}
                />
            )}
        </div>
    );

    return (
        <section className="relative rounded-[2.5rem] overflow-hidden shadow-2xl">
            {navLinks && navLinks.length > 0 && (
                <nav
                    className="relative z-10 flex flex-wrap justify-center gap-x-6 gap-y-2 px-6 py-4 text-sm font-semibold"
                    style={{ backgroundColor: primaryColor, color: textColor }}
                >
                    {navLinks.map((link) => (
                        <a key={link.id} href={resolveLinkHref(link.href)} className="opacity-80 hover:opacity-100 transition-opacity">
                            {link.text}
                        </a>
                    ))}
                </nav>
            )}
            <div className="grid sm:grid-cols-2">
                {imageOnRight ? (
                    <>
                        {textBlock}
                        {imageBlock}
                    </>
                ) : (
                    <>
                        {imageBlock}
                        {textBlock}
                    </>
                )}
            </div>
        </section>
    );
};

export default HeaderSplit;
