import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

const IntegrationSection = () => {
    const { t } = useTranslation();

    return (
        <div className="scroll-container flex justify-center items-center min-h-screen bg-white font-sans text-zinc-900 py-16 px-4">
            <div className="w-full max-w-7xl bg-[#6366F1] rounded-3xl p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between relative overflow-hidden shadow-2xl min-h-[550px]">
                {/* Left Section */}
                <div className="flex-1 max-w-lg z-10 text-center lg:text-left mb-12 lg:mb-0">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                        {t("landing_page.integration.title")}
                    </h1>
                    <p className="text-lg sm:text-xl text-white/90 mb-10">
                        {t("landing_page.integration.subtitle")}
                    </p>
                    <Button className="bg-white text-[#6366F1] font-semibold py-6 px-8 hover:cursor-pointer text-lg hover:bg-zinc-100 transition-colors duration-200 rounded-xl shadow-lg">
                        {t("landing_page.integration.buttonText")}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>

                {/* Right Section - Visual Elements */}
                <div className="flex-1 flex justify-center items-center relative w-full lg:w-1/2 min-h-[400px]">
                    {/* Main Card */}
                    <Card className="relative lg:absolute lg:top-1/4 lg:right-20 w-72 h-96 sm:w-[300px] sm:h-[400px] bg-white rounded-xl shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-500 z-10">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm text-zinc-500 font-medium">
                                    {t("landing_page.integration.mainCard.title")}
                                </span>
                                <span className="text-xs text-green-500 font-semibold bg-green-100 px-2 py-1 rounded-full">
                                    {t("landing_page.integration.mainCard.status")}
                                </span>
                            </div>
                            <Separator />
                            <div className="flex flex-col items-center mt-8 mb-6">
                                <div className="relative w-40 h-40">
                                    <svg className="w-full h-full" viewBox="0 0 100 100">
                                        <circle
                                            className="text-gray-100 stroke-current"
                                            strokeWidth="10"
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="transparent"
                                        ></circle>
                                        <circle
                                            className="text-[#6366F1] progress-ring__circle stroke-current transition-all duration-700 ease-in-out"
                                            strokeWidth="10"
                                            strokeLinecap="round"
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="transparent"
                                            strokeDasharray="251.2"
                                            strokeDashoffset="20.1"
                                            transform="rotate(-90 50 50)"
                                        ></circle>
                                        <text
                                            x="50"
                                            y="50"
                                            textAnchor="middle"
                                            dy="0.35em"
                                            className="text-3xl font-bold text-zinc-800"
                                        >
                                            {t("landing_page.integration.mainCard.progress")}
                                        </text>
                                    </svg>
                                </div>
                                <span className="text-sm font-medium mt-4 text-zinc-600">
                                    {t("landing_page.integration.mainCard.progressLabel")}
                                </span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="w-full h-20 bg-zinc-50 rounded-lg border border-zinc-100 overflow-hidden">
                                    <div className="h-full w-2/3 bg-[#6366F1]/10 ml-0 rounded-r-lg"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Small top card */}
                    <Card className="absolute top-0 right-10 lg:right-40 w-32 h-16 sm:w-48 sm:h-24 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg transform -rotate-12 z-0 hidden sm:block"></Card>

                    {/* Small lock icon card */}
                    <Card className="absolute bottom-10 left-10 lg:left-auto lg:right-80 w-20 h-20 sm:w-24 sm:h-24 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg transform -rotate-6 z-20 flex items-center justify-center">
                        <div className="text-[#6366F1]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default IntegrationSection;
