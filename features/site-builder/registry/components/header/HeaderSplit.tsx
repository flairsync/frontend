import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { resolveLinkHref } from "@/features/site-builder/linkPresets";

export interface HeaderSplitProps {
    primaryColor?: string;
    textColor?: string;
    backgroundImage?: string;
    showLogo?: boolean;
    buttonText?: string;
    buttonHref?: string;
    imageOnRight?: boolean;
    // Auto-bound business facts — never owner-editable text, see registry defaultBindings.
    businessName?: string;
    tagline?: string;
    logo?: string;
}

const HeaderSplit: React.FC<HeaderSplitProps> = ({
    primaryColor = "#111827",
    textColor = "#ffffff",
    backgroundImage,
    showLogo = true,
    buttonText,
    buttonHref,
    imageOnRight = true,
    businessName,
    tagline,
    logo,
}) => {
    const textBlock = (
        <motion.div
            initial={{ opacity: 0, x: imageOnRight ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col justify-center gap-5 p-10 sm:p-14"
            style={{ backgroundColor: primaryColor, color: textColor }}
        >
            {showLogo && logo && (
                <img
                    src={logo}
                    alt={businessName || "Logo"}
                    className="h-16 w-16 rounded-2xl object-cover shadow-xl ring-4 ring-white/20"
                />
            )}
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
                {businessName || "Your Restaurant"}
            </h1>
            {tagline && <p className="text-base sm:text-lg opacity-80 leading-relaxed max-w-md">{tagline}</p>}
            {buttonText && (
                <Button
                    asChild
                    size="lg"
                    className="rounded-full w-fit px-8 py-6 text-base font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 mt-2"
                >
                    <a href={resolveLinkHref(buttonHref)}>{buttonText}</a>
                </Button>
            )}
        </motion.div>
    );

    const imageBlock = (
        <div
            className="relative min-h-[320px] bg-cover bg-center bg-muted overflow-hidden"
            style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
        >
            {backgroundImage && (
                <div
                    className={`absolute inset-y-0 w-24 bg-gradient-to-r ${imageOnRight ? "left-0 from-black/20 to-transparent" : "right-0 from-transparent to-black/20"
                        }`}
                />
            )}
        </div>
    );

    return (
        <section className="grid sm:grid-cols-2 rounded-[2.5rem] overflow-hidden shadow-2xl">
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
        </section>
    );
};

export default HeaderSplit;
