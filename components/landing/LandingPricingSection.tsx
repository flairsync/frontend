import { useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { animate, createScope, onScroll, Scope, stagger, text, utils } from 'animejs';
interface Plan {
    name: string;
    monthlyPrice: string;
    yearlyPrice: string;
    description: string;
    features: string[];
    gradientClass: string;
    buttonClass: string;
}

const plans: Plan[] = [
    {
        name: 'Starter',
        monthlyPrice: '€9.99',
        yearlyPrice: '€71.99',
        description: 'Ideal for small coffee shops or new restaurants just getting started.',
        features: [
            '1 Business',
            'Up to 2 Menus per business',
            'Up to 4 Staff members',
            '1 Floor layout',
            'Basic Inventory Management',
            'Customer Visibility',
        ],
        gradientClass: 'from-[#8A89F9] to-[#6366F1]',
        buttonClass: 'bg-[#98D26C] hover:bg-[#8ac263] text-zinc-900',
    },
    {
        name: 'Growth',
        monthlyPrice: '€79.99',
        yearlyPrice: '€575.99',
        description: 'Best for growing restaurants with multiple staff and expanded services.',
        features: [
            'Up to 3 Businesses',
            'Up to 5 Menus per business',
            'Up to 20 Staff members',
            '3 Floor layouts per business',
            'Full Inventory Management',
            'Analytics Dashboard',
            'Customer Visibility',
        ],
        gradientClass: 'from-[#F3F4F6] to-[#F3F4F6]',
        buttonClass: 'bg-white hover:bg-zinc-100 text-[#6366F1] border border-[#6366F1]',
    },
    {
        name: 'Pro',
        monthlyPrice: '€129.99',
        yearlyPrice: '€935.99',
        description: 'Designed for established businesses or restaurant chains managing high operations.',
        features: [
            'Up to 10 Businesses',
            'Unlimited Menus per business',
            'Up to 50 Staff members',
            'Unlimited Floor layouts',
            'Advanced Inventory',
            'Full Analytics Suite',
            'Customer Visibility',
        ],
        gradientClass: 'from-[#F3F4F6] to-[#F3F4F6]',
        buttonClass: 'bg-white hover:bg-zinc-100 text-[#6366F1] border border-[#6366F1]',
    },
];

const LandingPricingSection = () => {
    const [isMonthly, setIsMonthly] = useState(true);

    const scope = useRef<Scope>(null);


    useLayoutEffect(() => {

        scope.current = createScope().add(self => {

            utils.$(["#landing_pricing_cards_container", "#landing_pricing_selector"]).forEach(($square) => {
                animate($square, {
                    opacity: [0, 1],
                    y: ["10rem", "0rem"],
                    duration: 3000,
                    alternate: true,
                    easing: 'inOutQuad', // ✅ correct key
                    autoplay: onScroll({
                        sync: 1,
                        enter: 'bottom top',
                        leave: 'center top',
                    }),

                })
            });


            const headerTxt = text.split('#landing_pricing_title', {
                chars: { wrap: 'clip' },
            });

            animate(headerTxt.chars, {
                y: [
                    { to: ['100%', '0%'] },
                ],
                duration: 750,
                ease: 'out(3)',
                delay: stagger(50),
                loop: false,
                autoplay: onScroll({
                    sync: 1,
                    enter: 'bottom top',
                    leave: 'center top',
                }),
            });

        });


        return () => scope.current?.revert();
    });

    return (
        <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 flex flex-col items-center justify-center p-8">
            <div className="text-center mb-10">
                <h1 className="text-5xl font-extrabold mb-2" id='landing_pricing_title'>
                    Choose The Plans That Suits You!
                </h1>
            </div>

            {/* Toggle Buttons */}
            <div className="flex bg-zinc-200 p-1 rounded-full mb-12 relative gap-3" id='landing_pricing_selector'>

                <Button
                    onClick={() => setIsMonthly(true)}
                    className={cn(
                        "rounded-full px-6 py-2 transition-all duration-300 hover:cursor-pointer hover:scale-105 ",
                        isMonthly ? ' shadow-sm' : 'bg-transparent text-zinc-600'
                    )}
                >
                    Bill monthly
                </Button>
                <Button
                    onClick={() => setIsMonthly(false)}
                    className={cn(
                        "rounded-full px-6 py-2 transition-all duration-300 relative hover:cursor-pointer hover:scale-105",
                        !isMonthly ? ' shadow-sm' : 'bg-transparent text-zinc-600'
                    )}
                >
                    Bill yearly (41% off)
                </Button>
            </div>

            {/* Pricing Cards */}
            <div
                id='landing_pricing_cards_container'
                className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.map((plan, index) => (
                    <Card
                        key={index}
                        className={cn(
                            "rounded-xl p-6 shadow-lg transform transition-all duration-300 hover:scale-[1.02] border-none",
                            plan.name === 'Starter'
                                ? 'bg-gradient-to-b from-[#8A89F9] to-[#6366F1] text-white'
                                : 'bg-zinc-100'
                        )}
                    >
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className={cn("text-2xl font-bold mb-4", plan.name === 'Starter' ? '' : 'text-zinc-900')}>
                                {plan.name}
                            </CardTitle>
                            <h2 className={cn("text-5xl font-extrabold", plan.name === 'Starter' ? 'text-white' : 'text-zinc-900')}>
                                {isMonthly ? plan.monthlyPrice : plan.yearlyPrice}
                            </h2>
                            <CardDescription className={cn("text-sm mt-1", plan.name === 'Starter' ? 'text-white/80' : 'text-zinc-600')}>
                                {plan.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center text-sm font-medium">
                                        <Check
                                            className={cn(
                                                "w-4 h-4 mr-3",
                                                plan.name === 'Starter' ? 'text-white' : 'text-[#6366F1]'
                                            )}
                                        />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <div className="flex justify-center">
                                <Button className={cn("w-full py-6 font-semibold rounded-lg", plan.buttonClass)}>
                                    Choose Plan
                                </Button>
                            </div>
                            <p className={cn("text-xs mt-3 text-center", plan.name === 'Starter' ? 'text-white/70' : 'text-zinc-500')}>
                                *Billed annually, plus application taxes
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default LandingPricingSection;
