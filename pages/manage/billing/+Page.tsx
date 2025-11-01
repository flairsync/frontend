import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, CreditCard, Receipt, Download } from "lucide-react";
import { useSubscriptions } from "@/features/subscriptions/useSubscriptions";
import { Subscription, SubscriptionStatus } from "@/models/Subscription";
import { BillingInvoicesTable } from "@/components/management/billing/BillingInvoicesTable";

const BillingPage = () => {

    const {
        userSubscriptionsList,
        fetchingUserSubscriptions
    } = useSubscriptions();

    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);


    useEffect(() => {
        if (userSubscriptionsList) {
            setSubscriptions(userSubscriptionsList);
        }
    }, [userSubscriptionsList]);
    const subscription = {
        plan: "Pro",
        renewalDate: "2025-11-10",
        price: "€19.99 / month",
        status: "Active",
    };


    return (
        <div className="p-6 w-full">
            <div className="flex items-center gap-3 mb-6">
                <Crown className="h-7 w-7 text-yellow-500" />
                <h1 className="text-2xl font-bold">Billing & Subscription</h1>
            </div>
            <p className="text-zinc-500 mb-8">
                Manage your subscription, payment methods, and view past invoices.
            </p>

            {/* Subscription Overview */}
            <Card className="mb-8 border border-zinc-200 shadow-sm">
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-500" />
                        Current Plan
                    </CardTitle>
                    <Button variant="outline" className="rounded-xl">
                        Manage Plan
                    </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-zinc-500">Plan</p>
                        <p className="font-semibold">{subscription.plan}</p>
                    </div>
                    <div>
                        <p className="text-zinc-500">Renewal Date</p>
                        <p className="font-semibold">{subscription.renewalDate}</p>
                    </div>
                    <div>
                        <p className="text-zinc-500">Status</p>
                        <p
                            className={`font-semibold ${subscription.status === "Active" ? "text-green-600" : "text-red-500"
                                }`}
                        >
                            {subscription.status}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Invoices */}
            <BillingInvoicesTable
                subscriptions={subscriptions}
            />
        </div>
    );
};

export default BillingPage;
