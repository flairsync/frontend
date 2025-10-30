import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Settings, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const ownedBusinesses = [
    {
        id: 1,
        name: "PixelForge Studio",
        members: 5,
        createdAt: "Feb 2024",
        revenue: "€1,230",
    },
    {
        id: 2,
        name: "Skyline Tech",
        members: 9,
        createdAt: "Nov 2023",
        revenue: "€2,780",
    },
];

const OwnedPage = () => {
    return (
        <div className="p-6 w-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">My Businesses</h1>
                    <p className="text-zinc-500 mt-1">
                        Manage the businesses you own and monitor their performance.
                    </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4">
                    + Create Business
                </Button>
            </div>

            {ownedBusinesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ownedBusinesses.map((biz) => (
                        <Card
                            key={biz.id}
                            className="hover:shadow-md transition-all border border-zinc-200"
                        >
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Building className="h-6 w-6 text-zinc-600" />
                                    <CardTitle>{biz.name}</CardTitle>
                                </div>
                                <span className="text-sm text-zinc-500">{biz.createdAt}</span>
                            </CardHeader>

                            <CardContent>
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <p className="text-sm text-zinc-600 flex items-center gap-1">
                                            <Users className="h-4 w-4 text-zinc-500" /> Members: {biz.members}
                                        </p>
                                        <p className="text-sm text-zinc-600">
                                            Revenue: <span className="font-medium">{biz.revenue}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <a
                                        href={`/business/${biz.id}/manage`}
                                        className="text-blue-600 text-sm font-medium hover:underline"
                                    >
                                        View dashboard
                                    </a>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2 text-zinc-700 border-zinc-300"
                                        >
                                            <Settings className="h-4 w-4" /> Settings
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" /> Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center text-zinc-500 border border-dashed border-zinc-300 rounded-lg p-10">
                    <p className="text-lg font-medium mb-2">You don’t own any businesses yet.</p>
                    <p className="text-sm mb-4">
                        Create a new business to start managing your own team and sales.
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                        Create Business
                    </Button>
                </div>
            )}
        </div>
    );
};

export default OwnedPage;
