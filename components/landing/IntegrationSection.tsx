import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

const IntegrationSection = () => {
    const { t } = useTranslation("landing");

    return (
        <div className="w-full bg-background font-sans text-foreground py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="w-full bg-primary rounded-3xl p-6 sm:p-10 md:p-16 flex flex-col lg:flex-row items-center justify-between relative overflow-hidden shadow-2xl">
                    {/* Left Section */}
                    <div className="flex-1 max-w-lg z-10 text-center lg:text-left mb-10 lg:mb-0">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 md:mb-6 leading-tight">
                            {t("landing_page.integration.title")}
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 md:mb-10">
                            {t("landing_page.integration.subtitle")}
                        </p>
                        <Button className="bg-white text-primary font-semibold py-5 sm:py-6 px-6 sm:px-8 hover:cursor-pointer text-base sm:text-lg hover:bg-white/90 transition-colors duration-200 rounded-xl shadow-lg w-full sm:w-auto">
                            {t("landing_page.integration.buttonText")}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>

                    {/* Right Section - Visual Elements */}
                    <div className="flex-1 flex justify-center items-center relative w-full lg:w-1/2 min-h-[320px] sm:min-h-[400px] overflow-hidden">
                        {/* Main Card */}
                        <Card className="relative lg:absolute lg:top-1/4 lg:right-20 w-64 sm:w-72 lg:w-[300px] bg-white rounded-xl shadow-2xl transform rotate-3 lg:rotate-6 hover:rotate-0 transition-transform duration-500 z-10 border-0">
                            <CardContent className="p-5 sm:p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm text-gray-500 font-medium">
                                        {t("landing_page.integration.mainCard.title")}
                                    </span>
                                    <span className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full">
                                        {t("landing_page.integration.mainCard.status")}
                                    </span>
                                </div>
                                <Separator className="bg-gray-100" />
                                <div className="flex flex-col items-center mt-6 mb-5">
                                    <div className="relative w-32 h-32 sm:w-40 sm:h-40">
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
                                                className="text-primary progress-ring__circle stroke-current transition-all duration-700 ease-in-out"
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
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-2xl sm:text-3xl font-bold text-gray-800">
                                                {t("landing_page.integration.mainCard.progress")}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium mt-3 text-gray-500">
                                        {t("landing_page.integration.mainCard.progressLabel")}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="w-full h-16 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                                        <div className="h-full w-2/3 bg-primary/15 ml-0 rounded-r-lg"></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Small top card — hidden on mobile to avoid overflow */}
                        <Card className="absolute top-0 right-10 lg:right-40 w-32 h-16 sm:w-48 sm:h-24 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg transform -rotate-12 z-0 hidden sm:block border-0"></Card>

                        {/* Small lock icon card — hidden on mobile to avoid overflow */}
                        <Card className="absolute bottom-10 lg:left-auto lg:right-80 w-20 h-20 sm:w-24 sm:h-24 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg transform -rotate-6 z-20 items-center justify-center border-0 hidden sm:flex">
                            <div className="text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            </div>
                        </Card>
                    </div>
            </div>
            </div>
        </div>
    );
};

export default IntegrationSection;
