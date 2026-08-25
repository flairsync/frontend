"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import WebsiteFooter from "@/components/shared/WebsiteFooter";
import LandingHeader from "@/components/landing/LandingHeader";
import { useLegalDocument } from "@/features/legal/useLegal";

const PrivacyPolicyPage: React.FC = () => {
    const { t } = useTranslation("landing");
    const { data: document, isLoading, error } = useLegalDocument("PRIVACY_POLICY");

    return (
        <div>
            <LandingHeader />
            <main className="container mx-auto max-w-5xl px-6 pt-32 pb-20 space-y-12">
                <section className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold">{t("privacy_page.title")}</h1>
                    {document && (
                        <p className="text-muted-foreground">
                            {t("gdpr_page.last_updated", {
                                date: new Date(document.publishedAt).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                }),
                            })}
                        </p>
                    )}
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t("privacy_page.intro")}
                    </p>
                </section>

                <Separator />

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
                        <AlertTitle>{t("privacy_page.load_error_title")}</AlertTitle>
                        <AlertDescription>{t("gdpr_page.load_error_description")}</AlertDescription>
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
            </main>
            <WebsiteFooter />
        </div>
    );
};

export default PrivacyPolicyPage;
