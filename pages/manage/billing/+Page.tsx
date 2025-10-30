import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, CreditCard, Receipt, Download } from "lucide-react";

const BillingPage = () => {
    const subscription = {
        plan: "Pro",
        renewalDate: "2025-11-10",
        price: "€19.99 / month",
        status: "Active",
    };

    const paymentMethod = {
        brand: "Visa",
        last4: "4242",
        exp: "08/26",
    };

    const invoices = [
        {
            id: "INV-1023",
            date: "Oct 10, 2025",
            amount: "€19.99",
            status: "Paid",
        },
        {
            id: "INV-1012",
            date: "Sep 10, 2025",
            amount: "€19.99",
            status: "Paid",
        },
        {
            id: "INV-1001",
            date: "Aug 10, 2025",
            amount: "€19.99",
            status: "Paid",
        },
    ];

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

            {/* Payment Method */}
            <Card className="mb-8 border border-zinc-200 shadow-sm">
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        Payment Method
                    </CardTitle>
                    <Button variant="outline" className="rounded-xl">
                        Update
                    </Button>
                </CardHeader>
                <CardContent className="text-sm grid sm:grid-cols-3 gap-4">
                    <div>
                        <p className="text-zinc-500">Card Brand</p>
                        <p className="font-semibold">{paymentMethod.brand}</p>
                    </div>
                    <div>
                        <p className="text-zinc-500">Last 4 Digits</p>
                        <p className="font-semibold">•••• {paymentMethod.last4}</p>
                    </div>
                    <div>
                        <p className="text-zinc-500">Expiry</p>
                        <p className="font-semibold">{paymentMethod.exp}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Invoices */}
            <Card className="border border-zinc-200 shadow-sm">
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-zinc-700" />
                        Invoices
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {invoices.length > 0 ? (
                        <div className="divide-y divide-zinc-100">
                            {invoices.map((invoice) => (
                                <div
                                    key={invoice.id}
                                    className="flex justify-between items-center py-3 text-sm"
                                >
                                    <div>
                                        <p className="font-medium">{invoice.id}</p>
                                        <p className="text-zinc-500">{invoice.date}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-semibold">{invoice.amount}</p>
                                        <p
                                            className={`${invoice.status === "Paid"
                                                    ? "text-green-600"
                                                    : "text-red-500"
                                                } font-medium`}
                                        >
                                            {invoice.status}
                                        </p>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                                        >
                                            <Download className="h-4 w-4" />
                                            <span>Download</span>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-500 text-sm">No invoices found.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default BillingPage;
