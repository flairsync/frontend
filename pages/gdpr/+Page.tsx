"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import WebsiteFooter from "@/components/shared/WebsiteFooter";
import LandingHeader from "@/components/landing/LandingHeader";
import { useLegalDocument } from "@/features/legal/useLegal";

const COOKIE_CATEGORY_KEYS = [
    { key: "strictly_necessary", badgeVariant: "default" as const },
    { key: "functional", badgeVariant: "secondary" as const },
    { key: "analytics", badgeVariant: "outline" as const },
    { key: "marketing", badgeVariant: "outline" as const },
];

const GDPRPage: React.FC = () => {
    const { t } = useTranslation("landing");
    const { data: document, isLoading, error } = useLegalDocument("COOKIE_POLICY");

    return (
        <div>
            <LandingHeader />
            <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-20 space-y-12">
                <section className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold">{t("gdpr_page.title")}</h1>
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
                        {t("gdpr_page.intro")}
                    </p>
                </section>

                <Separator />

                {/* Cookie Categories */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold">{t("gdpr_page.cookie_categories_title")}</h2>
                    <p className="text-muted-foreground">
                        {t("gdpr_page.cookie_categories_intro")}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {COOKIE_CATEGORY_KEYS.map(({ key, badgeVariant }) => (
                            <Card key={key} className="shadow-none border border-border">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{t(`gdpr_page.categories.${key}.name`)}</CardTitle>
                                        <Badge variant={badgeVariant}>{t(`gdpr_page.categories.${key}.badge`)}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="text-sm text-muted-foreground">{t(`gdpr_page.categories.${key}.description`)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        <span className="font-medium">{t("gdpr_page.examples_label")}</span> {t(`gdpr_page.categories.${key}.examples`)}
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
                        <AlertTitle>{t("gdpr_page.load_error_title")}</AlertTitle>
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

                {/* Contact */}
                <section className="text-center space-y-2 pt-4">
                    <p className="text-muted-foreground text-sm">
                        {t("gdpr_page.contact_question")}{" "}
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
