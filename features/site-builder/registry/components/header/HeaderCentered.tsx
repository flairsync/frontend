import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
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
    defaultBackgroundImage?: string;
    rating?: number | null;
    reviewCount?: number;
}

const HeaderCentered: React.FC<HeaderCenteredProps> = ({
    primaryColor = "#1c1a2e",
    textColor = "#ffffff",
    backgroundImage,
    showLogo = true,
    buttonText,
    buttonHref,
    businessName,
    tagline,
    logo,
    defaultBackgroundImage,
    rating,
    reviewCount,
}) => {
    const image = backgroundImage || defaultBackgroundImage;

    return (
        <section className="relative overflow-hidden rounded-[2.5rem] shadow-2xl min-h-[460px] sm:min-h-[560px] flex items-end">
            {image ? (
                <>
                    <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
                </>
            ) : (
                <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: primaryColor }}>
                    <div className="absolute -top-32 -left-16 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-24 -right-10 h-96 w-96 rounded-full bg-black/20 blur-3xl" />
                    <div className="absolute top-1/3 right-1/4 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative w-full p-5 sm:p-10"
            >
                <div
                    className="max-w-xl mx-auto text-center space-y-4 rounded-[2rem] px-8 py-10 sm:px-12 sm:py-12 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl"
                    style={{ color: textColor }}
                >
                    {showLogo && logo && (
                        <img
                            src={logo}
                            alt={businessName || "Logo"}
                            className="mx-auto h-16 w-16 rounded-2xl object-cover shadow-xl ring-4 ring-white/25"
                        />
                    )}
                    {rating != null && (
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold backdrop-blur-md">
                            <Star size={13} className="text-yellow-400 fill-yellow-400" />
                            {rating}
                            {reviewCount ? <span className="opacity-70 font-medium">({reviewCount})</span> : null}
                        </div>
                    )}
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
                        {businessName || "Your Restaurant"}
                    </h1>
                    {tagline && <p className="text-base sm:text-lg opacity-80 leading-relaxed">{tagline}</p>}
                    {buttonText && (
                        <Button
                            asChild
                            size="lg"
                            className="rounded-full px-8 py-6 text-base font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 mt-1"
                        >
                            <a href={resolveLinkHref(buttonHref)}>{buttonText}</a>
                        </Button>
                    )}
                </div>
            </motion.div>
        </section>
    );
};

export default HeaderCentered;
