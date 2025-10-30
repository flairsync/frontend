"use client";

import React from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
    Crown,
    Building,
    Heart,
    LucideNewspaper,
    Plus,
} from "lucide-react";
import { useSubscriptions } from "@/features/subscriptions/useSubscriptions";

const OverviewPage: React.FC = () => {
    const { currentUserSubscription } = useSubscriptions();

    // Dummy data
    const ownedBusinesses = [
        { id: "1", name: "Café Aroma" },
        { id: "2", name: "Downtown Deli" },
    ];

    const joinedBusinesses = [
        { id: "3", name: "Sunset Grill" },
        { id: "4", name: "Morning Brew Coffee" },
    ];

    const subscription = {
        plan: "Pro",
        renewalDate: "2025-11-10",
        status: "Active",
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8">
            <div className="max-w-6xl mx-auto space-y-10">
                {/* HEADER */}
                <div>
                    <h1 className="text-3xl font-semibold mb-2">Overview</h1>
                    <p className="text-zinc-500">
                        Welcome back! Here’s a quick summary of your account.
                    </p>
                </div>

                {/* SUBSCRIPTION STATUS */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Card className="shadow-sm border-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Crown className="h-5 w-5 text-primary" />
                                Subscription
                            </CardTitle>
                            <a href="/manage/billing">
                                <Button variant="outline" size="sm">
                                    Manage Billing
                                </Button>
                            </a>
                        </CardHeader>

                        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            {currentUserSubscription ? (
                                <>
                                    <div>
                                        <p className="text-zinc-500">Plan</p>
                                        <p className="font-semibold">{subscription.plan}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500">Next Renewal</p>
                                        <p className="font-semibold">{subscription.renewalDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500">Status</p>
                                        <p
                                            className={`font-semibold ${subscription.status === "Active"
                                                    ? "text-green-600"
                                                    : "text-red-500"
                                                }`}
                                        >
                                            {subscription.status}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center py-8">
                                    <Crown className="h-10 w-10 text-primary mb-3" />
                                    <p className="font-medium mb-2">No Active Subscription</p>
                                    <a href="/manage/plans">
                                        <Button className="gap-2">
                                            <Crown className="h-4 w-4" />
                                            View Plans
                                        </Button>
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <Separator />

                {/* BUSINESS SUMMARY */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <h2 className="text-xl font-semibold mb-4">Your Businesses</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Card className="p-5 hover:shadow-lg transition">
                            <CardContent className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Building className="h-6 w-6 text-primary" />
                                    <div>
                                        <p className="font-semibold text-lg">
                                            {ownedBusinesses.length}
                                        </p>
                                        <p className="text-sm text-zinc-500">Owned</p>
                                    </div>
                                </div>
                                <a href="/manage/owned">
                                    <Button variant="outline" size="sm">
                                        View
                                    </Button>
                                </a>
                            </CardContent>
                        </Card>

                        <Card className="p-5 hover:shadow-lg transition">
                            <CardContent className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Heart className="h-6 w-6 text-primary" />
                                    <div>
                                        <p className="font-semibold text-lg">
                                            {joinedBusinesses.length}
                                        </p>
                                        <p className="text-sm text-zinc-500">Joined</p>
                                    </div>
                                </div>
                                <a href="/manage/joined">
                                    <Button variant="outline" size="sm">
                                        View
                                    </Button>
                                </a>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                <Separator />

                {/* QUICK ACTIONS */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="flex flex-wrap gap-4">
                        <a href="/manage/owned">
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create Business
                            </Button>
                        </a>
                        <a href="/manage/billing">
                            <Button variant="outline" className="gap-2">
                                <LucideNewspaper className="h-4 w-4" />
                                View Billing
                            </Button>
                        </a>
                        <a href="/manage/help">
                            <Button variant="outline" className="gap-2">
                                <LucideNewspaper className="h-4 w-4" />
                                Get Help
                            </Button>
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default OverviewPage;
