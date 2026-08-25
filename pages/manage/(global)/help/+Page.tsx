import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Mail, MessageSquare, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveTolgeeArrays } from "@/utils/i18n-arrays";

const HelpPage = () => {
    const { t } = useTranslation("management");
    const { faqs } = resolveTolgeeArrays<{ faqs: { question: string; answer: string }[] }>(
        t("help_page", { returnObjects: true })
    );

    return (
        <div className="p-6 w-full">
            <div className="flex items-center gap-3 mb-4">
                <HelpCircle className="h-7 w-7 text-blue-600" />
                <h1 className="text-2xl font-bold">{t("help_page.title")}</h1>
            </div>
            <p className="text-zinc-500 mb-8">
                {t("help_page.subtitle")}
            </p>

            {/* FAQ Section */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">{t("help_page.faq_title")}</h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <Card
                            key={index}
                            className="hover:shadow-md transition-all border border-zinc-200"
                        >
                            <CardHeader>
                                <CardTitle className="text-base">{faq.question}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-zinc-600">{faq.answer}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Contact Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-zinc-200">
                    <CardHeader className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <CardTitle>{t("help_page.contact_support.title")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-zinc-600 mb-4">
                            {t("help_page.contact_support.description")}
                        </p>
                        <a
                            href="mailto:support@yourapp.com"
                            className="text-blue-600 hover:underline text-sm"
                        >
                            support@yourapp.com
                        </a>
                        <div className="mt-4">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                                {t("help_page.contact_support.send_message")}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-zinc-200">
                    <CardHeader className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <CardTitle>{t("help_page.docs.title")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-zinc-600 mb-4">
                            {t("help_page.docs.description")}
                        </p>
                        <div className="flex flex-col gap-2">
                            <a href="/learn#1-1" className="text-blue-600 hover:underline text-sm">
                                {t("help_page.docs.getting_started")}
                            </a>
                            <a href="/learn#16-1" className="text-blue-600 hover:underline text-sm">
                                {t("help_page.docs.billing_subscriptions")}
                            </a>
                            <a href="/learn#3-1" className="text-blue-600 hover:underline text-sm">
                                {t("help_page.docs.inviting_team")}
                            </a>
                            <a href="/learn#14-3" className="text-blue-600 hover:underline text-sm">
                                {t("help_page.docs.connecting_printer")}
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HelpPage;
