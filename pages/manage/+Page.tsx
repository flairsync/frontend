import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, LogIn, Building2, Crown, Settings } from "lucide-react";
import { motion } from "framer-motion";
import BusinessManagementHeader from "@/components/management/BusinessManagementHeader";

const ManagePage: React.FC = () => {
    // Dummy data
    const ownedBusinesses = [
        { id: "1", name: "Café Aroma" },
        { id: "2", name: "Downtown Deli" },
    ];

    const staffBusinesses = [
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
            <BusinessManagementHeader />

            <div className="max-w-5xl mx-auto space-y-10">
                {/* SUBSCRIPTION OVERVIEW */}
                <Card className="shadow-md border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Crown className="h-5 w-5 text-primary" />
                                Subscription Overview
                            </CardTitle>
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Settings className="h-4 w-4" />
                            Manage Plan
                        </Button>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-zinc-500">Current Plan</p>
                            <p className="font-semibold">{subscription.plan}</p>
                        </div>
                        <div>
                            <p className="text-zinc-500">Renewal Date</p>
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
                    </CardContent>
                </Card>

                <Separator />

                {/* OWNED BUSINESSES */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Your Restaurants</h2>
                        <Button variant="default" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create New
                        </Button>
                    </div>

                    {ownedBusinesses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {ownedBusinesses.map((biz) => (
                                <motion.div
                                    key={biz.id}
                                    whileHover={{ scale: 1.03 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card
                                        className="cursor-pointer hover:shadow-lg transition"
                                        onClick={() =>
                                            (window.location.href = `/manage/${biz.id}/owner/dashboard`)
                                        }
                                    >
                                        <CardContent className="flex items-center gap-3 p-5">
                                            <Building2 className="h-6 w-6 text-primary" />
                                            <span className="font-medium text-lg">{biz.name}</span>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-500 text-sm">
                            You don’t own any businesses yet.
                        </p>
                    )}
                </section>

                <Separator />

                {/* STAFF BUSINESSES */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Businesses You Work At</h2>
                        <Button variant="outline" className="gap-2">
                            <LogIn className="h-4 w-4" />
                            Join Business
                        </Button>
                    </div>

                    {staffBusinesses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {staffBusinesses.map((biz) => (
                                <motion.div
                                    key={biz.id}
                                    whileHover={{ scale: 1.03 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card
                                        className="cursor-pointer hover:shadow-md transition"
                                        onClick={() =>
                                            (window.location.href = `/manage/${biz.id}/staff/dashboard`)
                                        }
                                    >
                                        <CardContent className="flex items-center gap-3 p-5">
                                            <Building2 className="h-6 w-6 text-zinc-600 dark:text-zinc-300" />
                                            <span className="font-medium text-lg">{biz.name}</span>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-500 text-sm">
                            You are not a staff member in any businesses yet.
                        </p>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ManagePage;
