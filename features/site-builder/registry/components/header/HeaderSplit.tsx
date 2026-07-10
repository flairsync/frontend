import React from "react";
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
        <div
            className="flex flex-col justify-center gap-4 p-8 sm:p-12"
            style={{ backgroundColor: primaryColor, color: textColor }}
        >
            {showLogo && logo && (
                <img src={logo} alt={businessName || "Logo"} className="h-14 w-14 rounded-2xl object-cover shadow-lg" />
            )}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{businessName || "Your Restaurant"}</h1>
            {tagline && <p className="text-base opacity-80 max-w-md">{tagline}</p>}
            {buttonText && (
                <Button asChild size="lg" className="rounded-2xl w-fit mt-2">
                    <a href={resolveLinkHref(buttonHref)}>{buttonText}</a>
                </Button>
            )}
        </div>
    );

    const imageBlock = (
        <div
            className="min-h-[280px] bg-cover bg-center bg-muted"
            style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
        />
    );

    return (
        <section className="grid sm:grid-cols-2 rounded-[2rem] overflow-hidden">
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
