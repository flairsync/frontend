import React, { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const OwnerBillingPage: React.FC = () => {
    // Dummy data
    const currentPlan = {
        name: "Pro Plan",
        price: "$49/month",
        features: ["Unlimited staff", "Advanced analytics", "Priority support"],
    };

    const availablePlans = [
        {
            name: "Basic Plan",
            price: "$19/month",
            features: ["Up to 5 staff", "Basic analytics"],
        },
        {
            name: "Pro Plan",
            price: "$49/month",
            features: ["Unlimited staff", "Advanced analytics", "Priority support"],
        },
        {
            name: "Enterprise Plan",
            price: "$99/month",
            features: [
                "Unlimited staff",
                "Advanced analytics",
                "Priority support",
                "Custom integrations",
            ],
        },
    ];

    const invoices = [
        { id: "INV-001", date: "2025-09-01", amount: "$49", status: "Paid" },
        { id: "INV-002", date: "2025-08-01", amount: "$49", status: "Paid" },
        { id: "INV-003", date: "2025-07-01", amount: "$49", status: "Paid" },
    ];

    const [selectedPlan, setSelectedPlan] = useState(currentPlan.name);

    const handlePlanChange = (planName: string) => {
        setSelectedPlan(planName);
        alert(`Switched to ${planName}`);
    };

    const handlePaymentMethod = () => {
        alert("Update payment method clicked");
    };

    return (
        <div className="min-h-screen  p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
                    Billing & Subscription
                </h1>

                <Separator />

                {/* Current Plan */}
                <Card>
                    <CardHeader>
                        <CardTitle>Current Plan</CardTitle>
                        <CardDescription>{currentPlan.price}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <ul className="list-disc list-inside">
                            {currentPlan.features.map((f, i) => (
                                <li key={i}>{f}</li>
                            ))}
                        </ul>
                        <Button className="mt-2" onClick={handlePaymentMethod}>
                            Update Payment Method
                        </Button>
                    </CardContent>
                </Card>

                {/* Available Plans */}
                <Card>
                    <CardHeader>
                        <CardTitle>Available Plans</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {availablePlans.map((plan) => (
                            <Card
                                key={plan.name}
                                className={`p-4 cursor-pointer hover:shadow-lg transition ${selectedPlan === plan.name ? "border-2 border-primary" : ""
                                    }`}
                                onClick={() => handlePlanChange(plan.name)}
                            >
                                <CardHeader>
                                    <CardTitle>{plan.name}</CardTitle>
                                    <CardDescription>{plan.price}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc list-inside text-sm">
                                        {plan.features.map((f, i) => (
                                            <li key={i}>{f}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>

                {/* Invoices */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border-b p-2">Invoice ID</th>
                                        <th className="border-b p-2">Date</th>
                                        <th className="border-b p-2">Amount</th>
                                        <th className="border-b p-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                            <td className="p-2">{inv.id}</td>
                                            <td className="p-2">{inv.date}</td>
                                            <td className="p-2">{inv.amount}</td>
                                            <td className="p-2">{inv.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OwnerBillingPage;
