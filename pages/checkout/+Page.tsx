"use client";

import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import WebsiteLogo from "@/components/shared/WebsiteLogo";
import { loadPaddle } from "@/lib/paddle";

// Paddle's "default payment link": the page Paddle itself sends customers to
// when it opens a checkout outside our app — an unpaid-invoice email, a
// request to update an expired card, a transaction created through the API.
// Paddle appends ?_ptxn=txn_xxx and Paddle.js opens the overlay for it as soon
// as Initialize() runs, so this page only loads Paddle and waits.
//
// It stays public on purpose: someone clicking a payment link from their inbox
// may not be logged in, and bouncing them to login would lose the payment.

const CheckoutPage: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [hasTransaction, setHasTransaction] = useState(true);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setHasTransaction(params.has("_ptxn"));

        loadPaddle().catch((e: Error) => setError(e.message));
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4">
            <WebsiteLogo />

            <Card className="w-full max-w-md">
                <CardContent className="py-10">
                    {error ? (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Checkout unavailable</AlertTitle>
                            <AlertDescription>
                                We couldn't open the payment window. Please refresh the page, or
                                contact support@flairsync.com if it keeps happening.
                            </AlertDescription>
                        </Alert>
                    ) : hasTransaction ? (
                        <div className="flex flex-col items-center gap-4 text-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                Opening your secure payment window…
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                There's nothing to pay for on this page. Open it from a payment link,
                                or pick a plan from your account.
                            </p>
                            <Button asChild variant="outline">
                                <a href="/manage/plans">Go to plans</a>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default CheckoutPage;
