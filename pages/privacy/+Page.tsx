"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import WebsiteFooter from "@/components/shared/WebsiteFooter";

const privacyTextSections = [
    {
        title: "Introduction",
        content: `We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information in accordance with the General Data Protection Regulation (GDPR) and the ePrivacy Directive.`
    },
    {
        title: "Data Collection",
        content: `We collect personal data when you create an account, subscribe to our newsletter, or contact us. The types of data include Identity Data (name, username), Contact Data (email, phone), Technical Data (IP address, browser), and Usage Data (how you use our services).`
    },
    {
        title: "Purpose of Data Processing",
        content: `We process your personal data to provide and manage our services, communicate with you, improve our platform, and comply with legal obligations.`
    },
    {
        title: "Legal Basis",
        content: `Under GDPR, we process personal data based on consent, contractual necessity, legal obligation, and legitimate interests.`
    },
    {
        title: "Your Rights",
        content: `You have the right to access, rectify, erase, restrict, port, and object to the processing of your personal data under GDPR. Contact us to exercise these rights.`
    },
    {
        title: "Cookies and Tracking",
        content: `We use cookies and similar technologies to enhance your experience. You can manage your preferences via your browser settings.`
    },
    {
        title: "Data Security & Transfers",
        content: `We implement technical and organizational measures to protect your data. Transfers outside the EEA are secured with appropriate safeguards.`
    },
    {
        title: "Changes to this Policy",
        content: `We may update this Privacy Policy periodically. Updates will be posted on this page with a revised "Last Updated" date.`
    },
    {
        title: "Contact Us",
        content: `For any questions about this Privacy Policy, contact us at info@flairsync.com or call +376 123 456.`
    }
];

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div>
            <main className="container mx-auto max-w-5xl px-6 py-20 space-y-12">
                {/* Hero Section */}
                <section className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold">Privacy Policy</h1>
                    <p className="text-muted-foreground">Last Updated: [Insert Date]</p>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        This Privacy Policy explains how FlairSync collects, uses, and protects your personal data in compliance with the GDPR and ePrivacy Directive.
                    </p>
                </section>

                <Separator />

                {/* Text Sections */}
                <section className="space-y-8">
                    {privacyTextSections.map(({ title, content }) => (
                        <Card key={title} className="shadow-none border border-border">
                            <CardHeader>
                                <CardTitle className="text-lg">{title}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-muted-foreground">{content}</CardContent>
                        </Card>
                    ))}
                </section>
            </main>
            <WebsiteFooter />
        </div>
    );
};

export default PrivacyPolicyPage;
