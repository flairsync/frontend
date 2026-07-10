import React from "react";
import { Button } from "@/components/ui/button";
import { resolveLinkHref } from "@/features/site-builder/linkPresets";

export interface CtaBannerProps {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonHref?: string;
    backgroundColor?: string;
    textColor?: string;
}

const CtaBanner: React.FC<CtaBannerProps> = ({
    title = "Ready to visit us?",
    subtitle,
    buttonText = "Reserve a Table",
    buttonHref = "reservations",
    backgroundColor = "#f5b400",
    textColor = "#111827",
}) => {
    return (
        <section
            className="relative overflow-hidden rounded-[2.5rem] px-8 py-16 sm:py-20 text-center space-y-5 shadow-xl"
            style={{ backgroundColor, color: textColor }}
        >
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-black/5 blur-3xl" />
            <div className="relative space-y-5">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{title}</h2>
                {subtitle && <p className="max-w-xl mx-auto opacity-80 text-lg leading-relaxed">{subtitle}</p>}
                <Button
                    asChild
                    size="lg"
                    className="rounded-full px-8 py-6 text-base font-bold mt-2 bg-foreground text-background hover:bg-foreground/90 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                    <a href={resolveLinkHref(buttonHref)}>{buttonText}</a>
                </Button>
            </div>
        </section>
    );
};

export default CtaBanner;
