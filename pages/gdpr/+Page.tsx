"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import WebsiteFooter from "@/components/shared/WebsiteFooter";
import LandingHeader from "@/components/landing/LandingHeader";
import { useLegalDocument } from "@/features/legal/useLegal";

const cookieCategories = [
    {
        name: "Strictly Necessary",
        badge: "Always Active",
        badgeVariant: "default" as const,
        description:
            "These cookies are essential for the platform to function. They enable core features like user authentication, session management, and security. They cannot be disabled.",
        examples: "Authentication tokens, CSRF protection, session identifiers",
    },
    {
        name: "Functional",
        badge: "Optional",
        badgeVariant: "secondary" as const,
        description:
            "These cookies remember your preferences and settings to provide a more personalised experience (e.g., language, theme, timezone). Disabling them may affect usability.",
        examples: "Language preference, UI theme, timezone setting",
    },
    {
        name: "Analytics",
        badge: "Consent Required",
        badgeVariant: "outline" as const,
        description:
            "These cookies help us understand how users interact with our platform so we can improve it. All data is anonymised and aggregated. Set only with your consent.",
        examples: "Page views, feature usage, session duration, error rates",
    },
    {
        name: "Marketing",
        badge: "Consent Required",
        badgeVariant: "outline" as const,
        description:
            "These cookies are used to deliver relevant content and measure campaign effectiveness. We do not sell your data to advertisers. Set only with your explicit consent.",
        examples: "Campaign source tracking, conversion events",
    },
];

const GDPRPage: React.FC = () => {
    const { data: document, isLoading, error } = useLegalDocument("COOKIE_POLICY");

    return (
        <div>
            <LandingHeader />
            <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-20 space-y-12">
                <section className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold">GDPR & Cookie Policy</h1>
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
                        FlairSync's full GDPR compliance statement, cookie policy, data subject rights guide, and
                        information for EU residents.
                    </p>
                </section>

                <Separator />

                {/* Cookie Categories */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold">Cookie Categories</h2>
                    <p className="text-muted-foreground">
                        We use four categories of cookies on our platform. Strictly necessary cookies are always
                        active. All other cookies require your consent, which you can manage at any time.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {cookieCategories.map(({ name, badge, badgeVariant, description, examples }) => (
                            <Card key={name} className="shadow-none border border-border">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{name}</CardTitle>
                                        <Badge variant={badgeVariant}>{badge}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="text-sm text-muted-foreground">{description}</p>
                                    <p className="text-xs text-muted-foreground">
                                        <span className="font-medium">Examples:</span> {examples}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <Separator />

                {/* GDPR Sections */}
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
                        <AlertTitle>Unable to load GDPR & Cookie Policy</AlertTitle>
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
                                <CardContent className="text-muted-foreground whitespace-pre-line">{content}</CardContent>
                            </Card>
                        ))}
                    </section>
                )}

                {/* Contact */}
                <section className="text-center space-y-2 pt-4">
                    <p className="text-muted-foreground text-sm">
                        Questions about GDPR compliance or your rights?{" "}
                        <a href="mailto:privacy@flairsync.com" className="text-primary underline">
                            privacy@flairsync.com
                        </a>
                    </p>
                </section>
            </main>
            <WebsiteFooter />
        </div>
    );
};

export default GDPRPage;
