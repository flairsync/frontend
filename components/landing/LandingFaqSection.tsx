import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight } from "lucide-react";
import React from 'react';
import { useTranslation } from 'react-i18next';
import { navigate } from 'vike/client/router';

const LandingFaqSection = () => {
    const { t } = useTranslation("landing");

    // P1-7 (QA, 2026-11-18): every question/answer was hardcoded English.
    const faqItems = (t('landing_page.faq.items', { returnObjects: true }) as { question: string, answer: string }[]) ?? [];

    return (
        <div className="flex justify-center items-center bg-background font-sans text-foreground py-16 px-4">
            <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8 lg:gap-24 px-4 sm:px-6">
                {/* Left Section */}
                <div className="flex-1 max-w-lg lg:sticky lg:top-24 h-fit">
                    <span className="text-base font-medium text-primary mb-2 block">
                        <span role="img" aria-label="fire" className="mr-2">🔥</span>FAQ
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                        {t('landing_page.faq.title')}
                    </h1>
                    <p className="text-base sm:text-lg text-muted-foreground mb-6 md:mb-8 leading-relaxed">
                        {t('landing_page.faq.subtitle')}
                    </p>
                    <Button
                        onClick={() => navigate('/support')}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5 sm:py-6 px-6 sm:px-8 text-base sm:text-lg transition-transform duration-200 hover:scale-105 active:scale-95 rounded-xl shadow-lg w-full sm:w-auto"
                    >
                        {t('landing_page.faq.cta_button')}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>

                {/* Right Section - Accordion */}
                <div className="flex-1 w-full lg:max-w-2xl">
                    <Accordion type="single" collapsible className="w-full space-y-3 md:space-y-4">
                        {faqItems.map((item, index) => (
                            <AccordionItem key={index} value={`item-${index}`} className="border rounded-xl px-3 sm:px-4 data-[state=open]:bg-muted data-[state=open]:border-border transition-colors">
                                <AccordionTrigger className="text-sm sm:text-base md:text-lg text-left hover:no-underline hover:cursor-pointer font-semibold text-foreground py-4 sm:py-6">
                                    {item.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-sm sm:text-base text-muted-foreground pb-4 sm:pb-6 leading-relaxed">
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </div>
    );
};

export default LandingFaqSection;
