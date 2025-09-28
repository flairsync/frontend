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
        <div className="flex justify-center items-center min-h-screen bg-white font-sans text-zinc-900 p-8">
            <div className="w-[1100px] flex flex-col md:flex-row gap-16 md:gap-32 p-8">
                {/* Left Section */}
                <div className="flex-1 max-w-lg">
                    <span className="text-lg font-medium text-purple-600 mb-2">
                        <span role="img" aria-label="fire">🔥</span> FAQ
                    </span>
                    <h1 className="text-5xl font-extrabold mb-2">
                        {t('landing_page.faq.title')}
                    </h1>
                    <p className="text-lg text-zinc-600 mb-8">
                        {t('landing_page.faq.subtitle')}
                    </p>
                    <Button className="bg-[#6366F1] hover:bg-[#5859E9] text-white font-semibold py-7 px-8 text-lg transition-colors duration-200">
                        {t('landing_page.faq.cta_button')}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>

                {/* Right Section - Accordion */}
                <div className="flex-1 max-w-2xl mt-12 md:mt-0">
                    <Accordion type="single" collapsible className="w-full">
                        {faqItems.map((item, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-lg text-left hover:no-underline hover:cursor-pointer font-semibold text-zinc-800 py-6">
                                    {item.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-base text-zinc-600 pb-6">
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
