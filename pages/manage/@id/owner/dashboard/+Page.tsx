import React from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BarChart, DollarSign, Users, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSalesGraph } from "@/components/management/DashboardSalesGraph";
import { DashboardOrdersGraph } from "@/components/management/DashboardOrdersGraph";

const OwnerDashboardPage: React.FC = () => {
    // Dummy data
    const stats = [
        { key: "sales", label: "Total Sales", value: "$12,450", icon: DollarSign },
        { key: "orders", label: "Orders Today", value: "72", icon: ShoppingBag },
        { key: "staff", label: "Active Staff", value: "8", icon: Users },
    ];

    const salesGraphData = [50, 75, 150, 120, 200, 170, 90]; // dummy weekly sales

    return (
        <div className="min-h-screen  p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
                        Dashboard
                    </h1>
                    <Button>Generate Report</Button>
                </div>

                <Separator />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.key} className="p-4">
                                <CardHeader className="flex items-center gap-3">
                                    <Icon className="h-6 w-6 text-primary" />
                                    <CardTitle className="text-lg">{stat.label}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 text-center">
                                        {stat.value}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Weekly report</CardTitle>
                        <CardDescription>Your business in the last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent
                        className="grid grid-cols-1 md:grid-cols-2 gap-3 "
                    >
                        <div className="  flex flex-1 ">
                            <DashboardSalesGraph />
                        </div>
                        <div className="  flex flex-1">
                            <DashboardOrdersGraph />
                        </div>
                    </CardContent>
                </Card>



                {/* Quick Actions */}
                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="hover:shadow-lg transition cursor-pointer">
                        <CardContent className="flex flex-col items-center justify-center gap-2">
                            <ShoppingBag className="h-6 w-6 text-primary" />
                            <p className="font-medium">View Orders</p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition cursor-pointer">
                        <CardContent className="flex flex-col items-center justify-center gap-2">
                            <Users className="h-6 w-6 text-primary" />
                            <p className="font-medium">Manage Staff</p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition cursor-pointer">
                        <CardContent className="flex flex-col items-center justify-center gap-2">
                            <BarChart className="h-6 w-6 text-primary" />
                            <p className="font-medium">View Analytics</p>
                        </CardContent>
                    </Card>
                </div> */}
            </div>
        </div>
    );
};

export default OwnerDashboardPage;
