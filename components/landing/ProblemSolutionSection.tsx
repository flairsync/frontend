import React, { useLayoutEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { animate, onScroll, utils, Scope, createScope } from "animejs";
import { useTranslation } from "react-i18next";

interface Solution {
    id: number;
    color: string;
}

const solutions: Solution[] = [
    { id: 1, color: "bg-indigo-600" },
    { id: 2, color: "bg-indigo-600" },
    { id: 3, color: "bg-indigo-600" },
    { id: 4, color: "bg-indigo-600" },
];

const ProblemSolutionSection = () => {
    const { t } = useTranslation();
    const [activeSolution, setActiveSolution] = useState<Solution>(solutions[0]);
    const scope = useRef<Scope>(null);

    const handleSolutionClick = (solution: Solution) => {
        setActiveSolution(solution);
    };

    useLayoutEffect(() => {
        scope.current = createScope().add(() => {
            utils.$("#prob_solution_title").forEach(($el) => {
                animate($el, {
                    opacity: [0, 1],
                    x: ["10rem", "0rem"],
                    duration: 3000,
                    alternate: true,
                    easing: "inOutQuad",
                    autoplay: onScroll({ sync: 1, enter: "bottom top", leave: "center top" }),
                });
            });

            utils.$("#prob_sol_left_panel > *").forEach(($el, index) => {
                animate($el, {
                    opacity: [0, 1],
                    x: ["-10rem", "0rem"],
                    duration: 3000,
                    easing: "inOutQuad",
                    autoplay: onScroll({ sync: 1, enter: "bottom top", leave: "center top" }),
                    delay: index * 500,
                });
            });

            utils.$("#prob_sol_right_panel").forEach(($el) => {
                animate($el, {
                    opacity: [0, 1],
                    x: ["10rem", "0rem"],
                    duration: 3000,
                    alternate: true,
                    easing: "inOutQuad",
                    autoplay: onScroll({ sync: 1, enter: "bottom top", leave: "center top" }),
                });
            });
        });

        return () => scope.current?.revert();
    }, []);

    return (
        <div className="font-sans bg-white text-zinc-900 py-16 px-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6" id="landing_prob_sol_section">
                {/* Top Section */}
                <div className="mb-16">
                    <h1 className="text-4xl font-bold mb-4 leading-[1.3]" id="prob_solution_title">
                        {t("landing_page.problemSolution.title")}
                    </h1>
                    <p className="text-lg text-zinc-600 max-w-3xl" id="prob_solution_subtitle">
                        {t("landing_page.problemSolution.subtitle")}
                    </p>
                </div>

                <Separator className="bg-zinc-200 mb-16" />

                {/* Main Content Section */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Panel */}
                    <div id="prob_sol_left_panel">
                        <h2 className="text-3xl font-bold mb-8">
                            {t("landing_page.problemSolution.leftPanelTitle")}
                        </h2>
                        <div className="space-y-4">
                            {solutions.map((solution) => (
                                <div
                                    key={solution.id}
                                    className={cn(
                                        "p-6 rounded-lg cursor-pointer transition-colors duration-200 ease-in-out",
                                        activeSolution.id === solution.id
                                            ? solution.color + " text-white shadow-xl"
                                            : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800"
                                    )}
                                    onClick={() => handleSolutionClick(solution)}
                                >
                                    <div className="flex items-center space-x-4 mb-2">
                                        <div
                                            className={cn(
                                                "w-8 h-8 flex items-center justify-center rounded-full font-bold",
                                                activeSolution.id === solution.id
                                                    ? "bg-white text-indigo-600"
                                                    : "bg-zinc-300 text-zinc-600"
                                            )}
                                        >
                                            {solution.id}
                                        </div>
                                        <h3 className="text-lg font-semibold">
                                            {t(
                                                `landing_page.problemSolution.solutions.${solution.id - 1}.title`
                                            )}
                                        </h3>
                                    </div>
                                    <p
                                        className={cn(
                                            "text-sm",
                                            activeSolution.id === solution.id ? "text-white/80" : "text-zinc-500"
                                        )}
                                    >
                                        {t(
                                            `landing_page.problemSolution.solutions.${solution.id - 1}.description`
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div id="prob_sol_right_panel">
                        <Card className="rounded-2xl p-6 bg-zinc-100 border-none h-full">
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl font-bold mb-4">
                                    {t(
                                        `landing_page.problemSolution.solutions.${activeSolution.id - 1}.cardTitle`
                                    )}
                                </CardTitle>
                                <CardDescription className="text-lg text-zinc-600">
                                    {t(
                                        `landing_page.problemSolution.solutions.${activeSolution.id - 1}.cardDescription`
                                    )}
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
