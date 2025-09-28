import React, { useLayoutEffect, useRef } from 'react'

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { animate, onScroll, utils, text, stagger, Scope, createScope } from 'animejs';
import { useTranslation } from 'react-i18next';

interface Solution {
    id: number;
    title: string;
    description: string;
    color: string;
    cardTitle: string;
    cardDescription: string;
}

const solutions: Solution[] = [
    {
        id: 1,
        title: "prob1_title",
        description: "prob1_description",
        color: 'bg-indigo-600',
        cardTitle: 'prob1_card',
        cardDescription: 'prob1_card_description',
    },
    {
        id: 2,
        title: 'prob2_title',
        description: 'prob2_description',
        color: 'bg-indigo-600',
        cardTitle: 'prob2_card',
        cardDescription: 'prob2_card_description',
    },
    {
        id: 3,
        title: 'prob3_title',
        description: 'prob3_description',
        color: 'bg-indigo-600',
        cardTitle: 'prob3_card',
        cardDescription: 'prob3_card_description',
    },
    {
        id: 4,
        title: 'prob4_title',
        description: 'prob4_description',
        color: 'bg-indigo-600',
        cardTitle: 'prob4_card',
        cardDescription: 'prob4_card_description',
    },
];

const ProblemSolutionSection = () => {
    const { t } = useTranslation();
    const [activeSolution, setActiveSolution] = useState<Solution>(solutions[0]);
    const scope = useRef<Scope>(null);

    const handleSolutionClick = (solution: Solution) => {
        setActiveSolution(solution);
    };


    useLayoutEffect(() => {
        scope.current = createScope().add(self => {


            utils.$("#prob_solution_title").forEach(($square) => {
                animate($square, {
                    opacity: [0, 1],
                    x: ["10rem", "0rem"],
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
            utils.$("#prob_sol_left_panel > *").forEach(($square, index) => {
                animate($square, {
                    opacity: [0, 1],
                    x: ["-10rem", "0rem"],
                    duration: 3000,
                    alternate: false,
                    easing: 'inOutQuad', // ✅ correct key
                    autoplay: onScroll({
                        sync: 1,
                        enter: 'bottom top',
                        leave: 'center top',
                    }),
                    delay: index * 500, // stagger: each child delayed by 150ms

                })
            });
            utils.$("#prob_sol_right_panel").forEach(($square) => {
                animate($square, {
                    opacity: [0, 1],
                    x: ["10rem", "0rem"],
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


            const headerTxt = text.split('#prob_solution_title', {
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


            const headerSubtitle = text.split('#prob_solution_subtitle', {
                chars: { wrap: 'clip' },
            });

            animate(headerSubtitle.chars, {
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



    }, [])


    return (
        <div className="font-sans bg-white text-zinc-900 p-8">
            <div className="max-w-7xl mx-auto" id='landing_prob_sol_section'>
                {/* Top Section */}
                <div className="mb-16">
                    <h1 className="text-4xl font-bold mb-4 leading-[1.3]" id='prob_solution_title'>
                        We Know the Struggles of Running a Restaurant
                    </h1>
                    <p className="text-lg text-zinc-600 max-w-3xl" id='prob_solution_subtitle'>
                        Managing staff, tracking stock, updating menus, and keeping customers coming back can feel overwhelming.
                        That’s why we built a simple, all-in-one tool designed for cafés and restaurants.
                    </p>
                </div>

                <Separator className="bg-zinc-200 mb-16" />

                {/* Main Content Section */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Panel */}
                    <div id='prob_sol_left_panel'>
                        <h2 className="text-3xl font-bold mb-8">
                            How we can help you grow your business
                        </h2>
                        <div className="space-y-4">
                            {solutions.map((solution) => (
                                <div
                                    key={solution.id}
                                    className={cn(
                                        "p-6 rounded-lg cursor-pointer transition-colors duration-200 ease-in-out",
                                        activeSolution.id === solution.id
                                            ? solution.color + ' text-white shadow-xl'
                                            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                                    )}
                                    onClick={() => handleSolutionClick(solution)}
                                >
                                    <div className="flex items-center space-x-4 mb-2">
                                        <div
                                            className={cn(
                                                "w-8 h-8 flex items-center justify-center rounded-full font-bold",
                                                activeSolution.id === solution.id
                                                    ? 'bg-white text-indigo-600'
                                                    : 'bg-zinc-300 text-zinc-600'
                                            )}
                                        >
                                            {solution.id}
                                        </div>
                                        <h3 className="text-lg font-semibold">{t(solution.title)}</h3>
                                    </div>
                                    <p className={cn("text-sm", activeSolution.id === solution.id ? 'text-white/80' : 'text-zinc-500')}>
                                        {t(solution.description)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div id='prob_sol_right_panel'>
                        <Card className="rounded-2xl p-6 bg-zinc-100 border-none h-full">
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl font-bold mb-4">{t(activeSolution.cardTitle)}</CardTitle>
                                <CardDescription className="text-lg text-zinc-600">
                                    {t(activeSolution.cardDescription)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="mt-8 flex justify-center items-center h-48 bg-zinc-200 rounded-lg">
                                {/* Placeholder for future illustration or image */}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemSolutionSection;