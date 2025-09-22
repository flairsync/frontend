import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, LogIn, Building2 } from "lucide-react";
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
        { id: "5", name: "Pizza Palace" },
    ];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8">
            <BusinessManagementHeader />
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                {/* <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
                        Manage Businesses
                    </h1>
                    <div className="flex gap-2">
                        <Button onClick={handleCreateBusiness}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Business
                        </Button>
                        <Button variant="outline" onClick={handleJoinBusiness}>
                            <LogIn className="mr-2 h-4 w-4" />
                            Join Business
                        </Button>
                    </div>
                </div> */}

                <Separator />

                {/* Owned Businesses */}
                <Card>
                    <CardHeader>
                        <CardTitle>Owned Businesses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {ownedBusinesses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {ownedBusinesses.map((biz) => (
                                    <a
                                        href={`/manage/${biz.id}/owner/dashboard`}
                                    >
                                        <Card
                                            key={biz.id}
                                            className="cursor-pointer hover:shadow-lg transition"
                                        >
                                            <CardContent className="flex items-center gap-3 p-4">
                                                <Building2 className="h-6 w-6 text-primary" />
                                                <span className="font-medium">{biz.name}</span>
                                            </CardContent>
                                        </Card>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-zinc-500 text-sm">
                                You don’t own any businesses yet.
                            </p>
                        )}
                        <Card
                            key={"creater business "}
                            className="cursor-pointer hover:shadow-lg transition mt-4"
                        >
                            <CardContent className="flex items-center gap-3 p-4">
                                <Building2 className="h-6 w-6 text-primary" />
                                <span className="font-medium">Create a new one ?</span>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>

                {/* Staff Businesses */}
                <Card>
                    <CardHeader>
                        <CardTitle>Businesses You Work At</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {staffBusinesses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {staffBusinesses.map((biz) => (
                                    <a
                                        href={`/manage/${biz.id}/staff/dashboard`}
                                    >
                                        <Card
                                            key={biz.id}
                                            className="cursor-pointer hover:shadow-lg transition"
                                        >
                                            <CardContent className="flex items-center gap-3 p-4">
                                                <Building2 className="h-6 w-6 text-zinc-600 dark:text-zinc-300" />
                                                <span className="font-medium">{biz.name}</span>
                                            </CardContent>
                                        </Card>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-zinc-500 text-sm">
                                You are not a staff member in any businesses yet.
                            </p>
                        )}

                        <Card
                            key={"join_business"}
                            className="cursor-pointer hover:shadow-lg transition mt-4"
                        >
                            <CardContent className="flex items-center gap-3 p-4">
                                <Building2 className="h-6 w-6 text-primary" />
                                <span className="font-medium">Join a business?</span>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ManagePage;
