import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Settings, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Business } from "@/models/Business";
import { useMyBusinesses } from "@/features/business/useMyBusinesses";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ownedBusinesses: Business[] = [
];
const OwnedPage = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const {
        myBusinesses,
        loadingMyBussinesses: isLoading,
    } = useMyBusinesses(page, limit);

    return (
        <div className="p-6 w-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">My Businesses</h1>
                    <p className="text-zinc-500 mt-1">
                        Manage the businesses you own and monitor their performance.
                    </p>
                </div>
                <a href="/business/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4">
                        + Create Business
                    </Button>
                </a>
            </div>

            {isLoading && !myBusinesses?.length ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-zinc-500 font-medium">Loading your businesses...</p>
                </div>
            ) : myBusinesses && myBusinesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myBusinesses.map((biz) => (
                        <Card
                            key={biz.id}
                            className="hover:shadow-lg transition-all border border-zinc-200 group overflow-hidden"
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-zinc-100 shadow-sm">
                                        <AvatarImage src={biz.logo} alt={biz.name} />
                                        <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                                            {biz.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                                        {biz.name}
                                    </CardTitle>
                                </div>
                                <span className="text-xs text-zinc-400 font-medium">
                                    {new Date(biz.createdAt).toLocaleDateString()}
                                </span>
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex flex-col gap-1.5">
                                        <p className="text-sm text-zinc-500 flex items-center gap-2">
                                            <Users className="h-4 w-4 text-zinc-400" />
                                            <span className="font-medium text-zinc-700">Owner</span>
                                        </p>
                                        <p className="text-sm text-zinc-500 flex items-center gap-2">
                                            <Building className="h-4 w-4 text-zinc-400" />
                                            <span className="font-medium text-zinc-700">{biz.type?.name || "Other"}</span>
                                        </p>
                                    </div>

                                    <div className="pt-4 flex items-center justify-between border-t border-zinc-50">
                                        <a
                                            href={`/manage/${biz.id}/owner/dashboard`}
                                            className="inline-flex items-center text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors gap-1 group/link"
                                        >
                                            View Dashboard
                                            <span className="group-hover/link:translate-x-0.5 transition-transform">→</span>
                                        </a>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-2 text-zinc-500 hover:text-blue-600 hover:bg-blue-50"
                                                asChild
                                            >
                                                <a href={`/manage/${biz.id}/owner/settings`}>
                                                    <Settings className="h-4 w-4 mr-1" />
                                                    <span className="text-xs">Settings</span>
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center text-zinc-500 border-2 border-dashed border-zinc-200 rounded-2xl p-16 bg-zinc-50/30">
                    <div className="bg-white p-4 rounded-full shadow-sm w-fit mx-auto mb-4 border border-zinc-100">
                        <Building className="h-8 w-8 text-zinc-300" />
                    </div>
                    <p className="text-xl font-bold text-zinc-800 mb-2">You don’t own any businesses yet</p>
                    <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
                        Create your first business to start managing your team, menu, and sales effortlessly.
                    </p>
                    <a href="/business/new">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-100 px-8 py-6 h-auto font-bold">
                            Create a Business Now
                        </Button>
                    </a>
                </div>
            )}
        </div>
    );
};

export default OwnedPage;
