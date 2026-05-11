import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, CreditCard, Receipt, Download } from "lucide-react";
import { useSubscriptions } from "@/features/subscriptions/useSubscriptions";
import { Subscription, SubscriptionStatus } from "@/models/Subscription";
import { BillingInvoicesTable } from "@/components/management/billing/BillingInvoicesTable";
import { useProfile } from "@/features/profile/useProfile";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const BillingPage = () => {

    const {
        userProfile
    } = useProfile();

    const {
        currentUserSubscription,
        userSubscriptionsList,
        fetchingUserSubscriptions,
        fetchPortalUrl,
        fetchingPortalUrl,
    } = useSubscriptions();

    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

    useEffect(() => {
        if (userSubscriptionsList) {
            setSubscriptions(userSubscriptionsList);
        }
    }, [userSubscriptionsList]);

    return (
        <div className="p-6 w-full">
            <div className="flex items-center gap-3 mb-6">
                <Crown className="h-7 w-7 text-yellow-500" />
                <h1 className="text-2xl font-bold">Billing & Subscription</h1>
            </div>
            <p className="text-muted-foreground mb-8">
                Manage your subscription, payment methods, and view past invoices.
            </p>

            {/* Subscription Overview */}
            <Card className="mb-8 border border-border shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row justify-between items-center bg-muted/50 border-b border-border">
                    <CardTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-primary" />
                        Current Plan
                    </CardTitle>
                    {currentUserSubscription?.isDefault ? (
                        <a href="/manage/plans">
                            <Button variant="outline" className="rounded-xl">
                                Explore Plans
                            </Button>
                        </a>
                    ) : (
                        <Button
                            variant="outline"
                            className="rounded-xl"
                            disabled={fetchingPortalUrl}
                            onClick={async () => {
                                try {
                                    const url = await fetchPortalUrl();
                                    if (url) {
                                        window.location.href = url;
                                    } else {
                                        toast.error("Failed to generate management portal URL.");
                                    }
                                } catch (e) {
                                    toast.error("An error occurred connecting to the billing portal.");
                                }
                            }}
                        >
                            {fetchingPortalUrl ? "Loading..." : "Manage Subscription"}
                        </Button>
                    )}
                </CardHeader>

                <CardContent className="pt-6">
                    {(currentUserSubscription || userProfile?.currentSubscription) ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                            <div className="space-y-1">
                                <p className="text-muted-foreground font-medium tracking-tight">Plan Name</p>
                                <p className="font-bold text-lg text-foreground">
                                    {(currentUserSubscription?.pack?.name || userProfile?.currentSubscription?.pack?.name) || "Free"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground font-medium tracking-tight">
                                    {currentUserSubscription?.status === SubscriptionStatus.CANCELED ? "Access ends on" : "Next Renewal"}
                                </p>
                                <p className="font-bold text-lg text-foreground">
                                    {currentUserSubscription?.isDefault ? "Never" : (
                                        currentUserSubscription?.status === SubscriptionStatus.CANCELED
                                            ? currentUserSubscription?.getEndDate() || "N/A"
                                            : (currentUserSubscription?.getRenewalDate() || userProfile?.currentSubscription?.getRenewalDate() || "N/A")
                                    )}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground font-medium tracking-tight">Status</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={cn(
                                        "h-2 w-2 rounded-full",
                                        (currentUserSubscription?.status === SubscriptionStatus.ACTIVE || userProfile?.currentSubscription?.status === SubscriptionStatus.ACTIVE)
                                            ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                                            : (currentUserSubscription?.status === SubscriptionStatus.ON_TRIAL || userProfile?.currentSubscription?.status === SubscriptionStatus.ON_TRIAL)
                                                ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                                                : currentUserSubscription?.status === SubscriptionStatus.CANCELED
                                                    ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]"
                                                    : currentUserSubscription?.status === SubscriptionStatus.PAST_DUE
                                                        ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                                                        : "bg-red-500"
                                    )} />
                                    <p className="font-bold text-foreground">
                                        {(currentUserSubscription?.status === SubscriptionStatus.CANCELED
                                            ? "Canceling"
                                            : currentUserSubscription?.status === SubscriptionStatus.PAST_DUE
                                                ? "Payment Failed / Past Due"
                                                : (currentUserSubscription?.status === SubscriptionStatus.ON_TRIAL || userProfile?.currentSubscription?.status === SubscriptionStatus.ON_TRIAL)
                                                    ? "Free Trial"
                                                    : currentUserSubscription?.status || userProfile?.currentSubscription?.status || "active").toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-6 text-center">
                            <div className="bg-muted p-4 rounded-full mb-4">
                                <Crown className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-bold text-foreground text-lg">Free Plan</h3>
                            <p className="text-muted-foreground text-sm mb-6">Enjoy basic features forever, or upgrade for more power.</p>
                            <a href="/manage/plans">
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">See Pro Plans</Button>
                            </a>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Subscriptions */}
            <BillingInvoicesTable
                subscriptions={subscriptions}
            />
        </div>
    );
};

export default BillingPage;
