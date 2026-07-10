import React from "react";
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
            className="relative overflow-hidden rounded-[2rem] px-8 py-16 sm:py-24 text-center space-y-6 bg-cover bg-center"
            style={{
                backgroundColor: primaryColor,
                color: textColor,
                backgroundImage: backgroundImage
                    ? `linear-gradient(rgba(0,0,0,0.35),rgba(0,0,0,0.35)), url(${backgroundImage})`
                    : undefined,
            }}
        >
            {showLogo && logo && (
                <img
                    src={logo}
                    alt={businessName || "Logo"}
                    className="mx-auto h-16 w-16 rounded-2xl object-cover shadow-lg"
                />
            )}
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{businessName || "Your Restaurant"}</h1>
            {tagline && <p className="max-w-xl mx-auto text-base sm:text-lg opacity-80">{tagline}</p>}
            {buttonText && (
                <Button asChild size="lg" className="rounded-2xl mt-2">
                    <a href={resolveLinkHref(buttonHref)}>{buttonText}</a>
                </Button>
            )}
        </section>
    );
};

export default HeaderCentered;
