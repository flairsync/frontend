import React from "react";
import { Button } from "@/components/ui/button";
import { resolveLinkHref } from "@/features/site-builder/linkPresets";

export interface CallToActionProps {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonHref?: string;
    backgroundColor?: string;
    textColor?: string;
}

const CallToAction: React.FC<CallToActionProps> = ({
    title = "Ready to visit us?",
    subtitle,
    buttonText = "Reserve a Table",
    buttonHref = "reservations",
    backgroundColor = "#f5b400",
    textColor = "#111827",
}) => {
    return (
        <section
            className="rounded-[2rem] px-8 py-14 text-center space-y-4"
            style={{ backgroundColor, color: textColor }}
        >
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            {subtitle && <p className="max-w-xl mx-auto opacity-80">{subtitle}</p>}
            <Button asChild size="lg" className="rounded-2xl mt-2 bg-foreground text-background hover:bg-foreground/90">
                <a href={resolveLinkHref(buttonHref)}>{buttonText}</a>
            </Button>
        </section>
    );
};

export default CallToAction;
