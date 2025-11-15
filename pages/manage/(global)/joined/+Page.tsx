import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const joinedBusinesses = [
    {
        id: 1,
        name: "Lumos Tech",
        role: "Developer",
        members: 12,
        joinedAt: "March 2024",
    },
    {
        id: 2,
        name: "Nova Labs",
        role: "Designer",
        members: 8,
        joinedAt: "January 2025",
    },
];

const JoinedPage = () => {
    return (
        <div className="p-6 w-full">
            <h1 className="text-2xl font-bold mb-4">Joined Businesses</h1>
            <p className="text-zinc-500 mb-6">
                These are the businesses or organizations you’ve joined as a team member.
            </p>

            {joinedBusinesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {joinedBusinesses.map((biz) => (
                        <Card
                            key={biz.id}
                            className="hover:shadow-md transition-all border border-zinc-200"
                        >
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-6 w-6 text-zinc-600" />
                                    <CardTitle>{biz.name}</CardTitle>
                                </div>
                                <span className="text-sm text-zinc-500">{biz.joinedAt}</span>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-zinc-600">
                                            Role: <span className="font-medium">{biz.role}</span>
                                        </p>
                                        <p className="text-sm text-zinc-600">
                                            Members: {biz.members}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Leave
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center text-zinc-500 border border-dashed border-zinc-300 rounded-lg p-10">
                    <p className="text-lg font-medium mb-2">You haven’t joined any businesses yet.</p>
                    <p className="text-sm">
                        When someone invites you to their business, it will appear here.
                    </p>
                </div>
            )}
        </div>
    );
};

export default JoinedPage;
