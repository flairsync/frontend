import React from "react";
import { Button } from "@/components/ui/button";
import { resolveLinkHref } from "@/features/site-builder/linkPresets";

export interface CtaSplitProps {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonHref?: string;
    backgroundColor?: string;
    textColor?: string;
    backgroundImage?: string;
    imageOnRight?: boolean;
}

const CtaSplit: React.FC<CtaSplitProps> = ({
    title = "Ready to visit us?",
    subtitle,
    buttonText = "Reserve a Table",
    buttonHref = "reservations",
    backgroundColor = "#111827",
    textColor = "#ffffff",
    backgroundImage,
    imageOnRight = true,
}) => {
    const textBlock = (
        <div
            className="flex flex-col justify-center gap-4 p-10 sm:p-12"
            style={{ backgroundColor, color: textColor }}
        >
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{title}</h2>
            {subtitle && <p className="opacity-80 text-lg leading-relaxed max-w-md">{subtitle}</p>}
            <Button
                asChild
                size="lg"
                className="rounded-full w-fit px-8 py-6 text-base font-bold mt-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
                <a href={resolveLinkHref(buttonHref)}>{buttonText}</a>
            </Button>
        </div>
    );

    const imageBlock = (
        <div
            className="min-h-[220px] bg-cover bg-center bg-muted"
            style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
        />
    );

    return (
        <section className="grid sm:grid-cols-2 rounded-[2.5rem] overflow-hidden shadow-xl">
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

export default CtaSplit;
