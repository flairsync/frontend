import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight } from "lucide-react";
import { animate, createTimeline, onScroll, stagger, text, utils } from 'animejs';

import React, { useEffect, useLayoutEffect } from 'react';

const IntegrationSection = () => {

    return (
        <div
            className=" scroll-container flex justify-center items-center min-h-screen bg-white font-sans text-zinc-900">
            <div className=" square w-[1100px] h-[550px] bg-[#6366F1] rounded-3xl p-16 flex items-center justify-between relative overflow-hidden shadow-2xl">
                {/* Left Section */}
                <div className="flex-1 max-w-lg z-10">
                    <h1
                        className=" text-6xl font-extrabold text-white mb-6 leading-tight">
                        Seamless Setup, Zero Hassle
                    </h1>
                    <p className=" text-xl text-white/90 mb-10">
                        No complicated integrations. Just create your account, set up your business details, and start managing everything from one place — right away.
                    </p>
                    <Button className="bg-white text-[#6366F1] font-semibold py-7 px-8 hover:cursor-pointer text-lg hover:bg-zinc-100 transition-colors duration-200">
                        Book a Demo
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>

                {/* Right Section - Visual Elements */}
                <div className="flex-1 flex justify-center items-center absolute right-0 top-0 h-full w-1/2">
                    {/* Main Card */}
                    <Card className="absolute top-1/4 right-20 w-[300px] h-[400px] bg-white rounded-xl shadow-lg transform rotate-6">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm text-zinc-500 font-medium">Overdraft Prevention</span>
                                <span className="text-xs text-green-500 font-semibold">Currently On</span>
                            </div>
                            <Separator />
                            <div className="flex flex-col items-center mt-6 mb-4">
                                <div className="relative w-36 h-36">
                                    <svg className="w-full h-full" viewBox="0 0 100 100">
                                        <circle
                                            className="text-gray-200 stroke-current"
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
                                        ></circle>
                                        <text x="50" y="50" textAnchor="middle" dy="0.35em" className="text-3xl font-bold text-zinc-800">
                                            93%
                                        </text>
                                    </svg>
                                </div>
                                <span className="text-sm font-medium mt-2">Weekly Progress</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="w-full h-24 bg-zinc-100 rounded-lg">
                                    {/* Placeholder for chart */}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Small top card */}
                    <Card className="absolute top-16 right-40 w-48 h-24 bg-white rounded-xl shadow-md transform -rotate-12 z-20"></Card>

                    {/* Small lock icon card */}
                    <Card className="absolute bottom-20 right-80 w-24 h-24 bg-white rounded-xl shadow-md transform -rotate-6 z-20"></Card>
                </div>
            </div>
        </div>
    );
};

export default IntegrationSection;
