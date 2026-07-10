import React from "react";
import { Button } from "@/components/ui/button";
import { DiscoveryBusinessProfile } from "@/models/discovery/DiscoveryBusinessProfile";

export interface HeaderProps {
    title?: string;
    subtitle?: string;
    backgroundColor?: string;
    textColor?: string;
    showLogo?: boolean;
    ctaLabel?: string;
    ctaHref?: string;
    business?: DiscoveryBusinessProfile | null;
}

const Header: React.FC<HeaderProps> = ({
    title,
    subtitle,
    backgroundColor = "#111827",
    textColor = "#ffffff",
    showLogo = true,
    ctaLabel,
    ctaHref,
    business,
}) => {
    const resolvedTitle = title || business?.name || "Your Restaurant";
    const resolvedSubtitle = subtitle ?? business?.description ?? "";

    return (
        <section
            className="relative overflow-hidden rounded-[2rem] px-8 py-16 sm:py-24 text-center space-y-6"
            style={{ backgroundColor, color: textColor }}
        >
            {showLogo && business?.logo && (
                <img
                    src={business.logo}
                    alt={resolvedTitle}
                    className="mx-auto h-16 w-16 rounded-2xl object-cover shadow-lg"
                />
            )}
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{resolvedTitle}</h1>
            {resolvedSubtitle && (
                <p className="max-w-xl mx-auto text-base sm:text-lg opacity-80">{resolvedSubtitle}</p>
            )}
            {ctaLabel && (
                <Button asChild size="lg" className="rounded-2xl mt-2">
                    <a href={ctaHref || "#"}>{ctaLabel}</a>
                </Button>
            )}
        </section>
    );
};

export default Header;
