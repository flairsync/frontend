"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import WebsiteFooter from "@/components/shared/WebsiteFooter";
import LandingHeader from "@/components/landing/LandingHeader";
import { useLegalDocument } from "@/features/legal/useLegal";

const TermsPage: React.FC = () => {
    const { data: document, isLoading, error } = useLegalDocument("TERMS_OF_SERVICE");

    return (
        <div>
            <LandingHeader />
            <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-20 space-y-12">
                {/* Hero Section */}
                <section className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold">Terms and Conditions</h1>
                    {document && (
                        <p className="text-muted-foreground">
                            Last Updated: {new Date(document.publishedAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    )}
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        These Terms and Conditions govern your use of FlairSync. By using our services, you agree to comply with them.
                    </p>
                </section>

                <Separator />

                {/* Terms Sections */}
                {isLoading && (
                    <section className="space-y-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full rounded-xl" />
                        ))}
                    </section>
                )}

                {error && (
                    <Alert variant="destructive" className="max-w-2xl mx-auto">
                        <AlertCircle className="h-5 w-5" />
                        <AlertTitle>Unable to load Terms and Conditions</AlertTitle>
                        <AlertDescription>Please try refreshing the page in a moment.</AlertDescription>
                    </Alert>
                )}

                {document && (
                    <section className="space-y-8">
                        {document.sections.map(({ title, content }) => (
                            <Card key={title} className="shadow-none border border-border">
                                <CardHeader>
                                    <CardTitle className="text-lg">{title}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-muted-foreground">{content}</CardContent>
                            </Card>
                        ))}
                    </section>
                )}
            </main>
            <WebsiteFooter />
        </div>
    );
};

export default TermsPage;
