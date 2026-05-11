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

const LandingFaqSection = () => {
    const { t } = useTranslation();

    const faqItems = [
        {
            question: 'Do I need technical knowledge to use the platform?',
            answer: 'Not at all. Our system is designed to be simple and intuitive. You can set up your business and start managing it in minutes.',
        },
        {
            question: 'Can I manage multiple restaurants or cafés with one account?',
            answer: 'Yes, you can easily manage multiple locations from a single account with our platform. The growth and pro plans are designed specifically for this purpose.',
        },
        {
            question: 'Is there a free trial available?',
            answer: 'Yes, we offer a 14-day free trial so you can explore all the features before committing to a plan.',
        },
        {
            question: 'Does the platform work on phones and tablets?',
            answer: 'Our platform is fully responsive and optimized for use on a variety of devices, including phones, tablets, and desktops.',
        },
        {
            question: 'Can I add unlimited menu items?',
            answer: 'The Pro plan includes unlimited menu items. The Starter and Growth plans have limits on the number of menus you can have per business.',
        },
    ];

    return (
        <div className="flex justify-center items-center min-h-[80vh] bg-background font-sans text-foreground py-16 px-4">
            <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-12 lg:gap-24 px-4 sm:px-6">
                {/* Left Section */}
                <div className="flex-1 max-w-lg lg:sticky lg:top-24 h-fit">
                    <span className="text-lg font-medium text-primary mb-2 block">
                        <span role="img" aria-label="fire" className="mr-2">🔥</span>FAQ
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
                        {t('landing_page.faq.title')}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                        {t('landing_page.faq.subtitle')}
                    </p>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 px-8 text-lg transition-transform duration-200 hover:scale-105 active:scale-95 rounded-xl shadow-lg w-full sm:w-auto">
                        {t('landing_page.faq.cta_button')}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>

                {/* Right Section - Accordion */}
                <div className="flex-1 w-full lg:max-w-2xl mt-8 lg:mt-0">
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqItems.map((item, index) => (
                            <AccordionItem key={index} value={`item-${index}`} className="border rounded-xl px-4 data-[state=open]:bg-muted data-[state=open]:border-border transition-colors">
                                <AccordionTrigger className="text-lg text-left hover:no-underline hover:cursor-pointer font-semibold text-foreground py-6">
                                    {item.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-base text-muted-foreground pb-6 leading-relaxed">
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
