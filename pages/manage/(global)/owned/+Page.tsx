import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Settings, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Business } from "@/models/Business";
import { useMyBusinesses } from "@/features/business/useMyBusinesses";
import { useSubscriptions } from "@/features/subscriptions/useSubscriptions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUsage } from "@/features/subscriptions/useUsage";
import { useSubscriptionStore } from "@/features/subscriptions/SubscriptionStore";
import { cn } from "@/lib/utils";

const ownedBusinesses: Business[] = [
];
const OwnedPage = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const {
        myBusinesses,
        loadingMyBussinesses: isLoading,
    } = useMyBusinesses(page, limit);
    const { usage } = useUsage();
    const { currentUserSubscription } = useSubscriptions();
    const { openUpgradeModal } = useSubscriptionStore();

    const canCreateBusiness = usage?.canCreateBusiness ?? (currentUserSubscription ? true : false);
    const isLimitReached = !canCreateBusiness;

    return (
        <div className="p-6 w-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">My Businesses</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage the businesses you own and monitor their performance.
                    </p>
                </div>
                <div className="flex flex-col items-end">
                    <Button
                        className={cn(
                            "rounded-xl px-4 transition h-11",
                            canCreateBusiness
                                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                                : "bg-muted text-muted-foreground cursor-not-allowed border-border"
                        )}
                        onClick={(e) => {
                            if (canCreateBusiness) {
                                window.location.href = "/manage/owned/new";
                            } else {
                                openUpgradeModal("You've reached your business limit. Upgrade to add more locations.");
                            }
                        }}
                    >
                        + Create Business
                        {!canCreateBusiness && <span className="text-[10px] font-bold text-primary uppercase ml-2">Upgrade</span>}
                    </Button>
                </div>
            </div>

            {
                isLoading && !myBusinesses?.length ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 border border-dashed border-border rounded-xl bg-muted/50">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground font-medium">Loading your businesses...</p>
                    </div>
                ) : myBusinesses && myBusinesses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myBusinesses.map((biz) => (
                            <Card
                                key={biz.id}
                                className="hover:shadow-lg transition-all border border-border group overflow-hidden"
                            >
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-border shadow-sm">
                                            <AvatarImage src={biz.logo} alt={biz.name} />
                                            <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                                                {biz.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                            {biz.name}
                                        </CardTitle>
                                    </div>
                                    <span className="text-xs text-muted-foreground font-medium">
                                        {new Date(biz.createdAt).toLocaleDateString()}
                                    </span>
                                </CardHeader>

                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium text-foreground/80">Owner</span>
                                            </p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Building className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium text-foreground/80">{biz.type?.name || "Other"}</span>
                                            </p>
                                        </div>

                                        <div className="pt-4 flex items-center justify-between border-t border-border">
                                            <a
                                                href={`/manage/${biz.id}/owner/dashboard`}
                                                className="inline-flex items-center text-primary text-sm font-semibold hover:text-primary/80 transition-colors gap-1 group/link"
                                            >
                                                View Dashboard
                                                <span className="group-hover/link:translate-x-0.5 transition-transform">→</span>
                                            </a>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2 text-muted-foreground hover:text-primary hover:bg-primary/10"
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
                    <div className="text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl p-16 bg-muted/30">
                        <div className="bg-card p-4 rounded-full shadow-sm w-fit mx-auto mb-4 border border-border">
                            <Building className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-xl font-bold text-foreground mb-2">You don’t own any businesses yet</p>
                        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                            Create your first business to start managing your team, menu, and sales effortlessly.
                        </p>
                        <Button
                            className={cn(
                                "rounded-xl shadow-md px-8 py-6 h-auto font-bold transition",
                                canCreateBusiness
                                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                                    : "bg-muted text-muted-foreground cursor-not-allowed border-border"
                            )}
                            onClick={() => {
                                if (canCreateBusiness) {
                                    window.location.href = "/manage/owned/new";
                                } else {
                                    openUpgradeModal("You've reached your business limit. Upgrade to add more locations.");
                                }
                            }}
                        >
                            {canCreateBusiness ? "Create a Business Now" : "Unlock More Businesses"}
                        </Button>
                    </div>
                )
            }
        </div >
    );
};

export default OwnedPage;
