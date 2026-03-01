import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, ArrowRight, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useMyEmployments } from "@/features/business/employment/useMyEmployments";

const JoinedPage = () => {
    const {
        myEmployments,
        loadingMyEmployments: isLoading
    } = useMyEmployments();

    // Filter by type === 'INVITED' and status === 'ACTIVE'
    const joinedBusinesses = myEmployments?.filter(
        (emp) => emp.type === "INVITED" && emp.status === "ACTIVE"
    ) || [];

    return (
        <div className="p-6 w-full">
            <h1 className="text-2xl font-bold mb-2">Joined Businesses</h1>
            <p className="text-zinc-500 mb-8">
                Manage your work within businesses you have joined as a staff member.
            </p>

            {isLoading && !myEmployments?.length ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                    <Loader className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm text-zinc-500 font-medium">Loading joined businesses...</p>
                </div>
            ) : joinedBusinesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {joinedBusinesses.map((emp) => (
                        <Card
                            key={emp.id}
                            className="hover:shadow-lg transition-all border border-zinc-200 group relative overflow-hidden"
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
                                            {emp.business.name}
                                        </CardTitle>
                                        <p className="text-xs text-zinc-400 font-medium">Staff Member</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-sm text-zinc-600 line-clamp-2 min-h-[2.5rem]">
                                        {emp.business.description || "You are an active member of this business's team."}
                                    </p>

                                    <div className="pt-4 border-t border-zinc-50">
                                        <a
                                            href={`/manage/${emp.business.id}/staff/dashboard`}
                                            className="inline-flex items-center text-green-600 text-sm font-semibold hover:text-green-700 transition-colors gap-1 group/link"
                                        >
                                            Open Business Hub
                                            <ArrowRight className="h-4 w-4 group-hover/link:translate-x-0.5 transition-transform" />
                                        </a>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center text-zinc-500 border-2 border-dashed border-zinc-200 rounded-2xl p-16 bg-zinc-50/30">
                    <div className="bg-white p-4 rounded-full shadow-sm w-fit mx-auto mb-4 border border-zinc-100">
                        <Users className="h-8 w-8 text-zinc-300" />
                    </div>
                    <p className="text-xl font-bold text-zinc-800 mb-2">No joined businesses yet</p>
                    <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
                        When you are invited to join a business as a staff member, it will appear here for you to access.
                    </p>
                    <Button variant="outline" className="rounded-xl px-8" asChild>
                        <a href="/manage/owned">View My Businesses</a>
                    </Button>
                </div>
            )}
        </div>
    );
};

export default JoinedPage;
