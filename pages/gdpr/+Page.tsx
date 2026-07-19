"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import WebsiteFooter from "@/components/shared/WebsiteFooter";
import LandingHeader from "@/components/landing/LandingHeader";

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

const gdprSections = [
    {
        title: "1. Our GDPR Commitment",
        content: `FlairSync is fully committed to compliance with the General Data Protection Regulation (EU) 2016/679 (GDPR). As a platform operating within and serving businesses in the European Economic Area (EEA), we treat data protection not as a checkbox, but as a core part of how we build and operate our service.\n\nOur GDPR compliance programme covers:\n\n• Privacy by design and by default (Art. 25): data protection is embedded into all new features from inception, and we default to the most privacy-friendly settings\n• Data minimisation (Art. 5(1)(c)): we collect only the personal data that is strictly necessary for each processing purpose\n• Purpose limitation (Art. 5(1)(b)): personal data is collected for specified, explicit, and legitimate purposes and not processed beyond those purposes\n• Storage limitation (Art. 5(1)(e)): personal data is retained only as long as necessary (see our Privacy Policy for specific retention periods)\n• Accuracy (Art. 5(1)(d)): we take reasonable steps to ensure personal data is accurate and kept up to date\n• Integrity and confidentiality (Art. 5(1)(f)): appropriate technical and organisational security measures are applied at all times`
    },
    {
        title: "2. Data Processing Agreements (DPAs)",
        content: `When you use FlairSync as a restaurant operator, you may process personal data about your own customers (e.g., reservation details, contact information) through our platform. In this relationship:\n\n• You are the Data Controller for your customers' data\n• FlairSync acts as a Data Processor on your behalf\n\nThis relationship is governed by a Data Processing Agreement (DPA), which is incorporated into our Terms of Service. Our DPA covers:\n\n• The subject-matter, duration, nature, and purpose of the processing\n• The type of personal data processed and categories of data subjects\n• Your rights and obligations as the controller\n• Our obligations as the processor, including confidentiality, security, and sub-processor management\n• Assistance with data subject requests and breach notification\n\nIf you require a standalone DPA for your compliance documentation, contact us at privacy@flairsync.com.`
    },
    {
        title: "3. Your GDPR Rights — How to Exercise Them",
        content: `Under GDPR Chapter III, you have the following enforceable rights. Here is how to use each one:\n\nRight of Access (Art. 15)\nRequest a full copy of all personal data we hold about you, including the purposes of processing, categories of data, recipients, and retention periods.\nHow: Email privacy@flairsync.com with the subject "Data Access Request".\n\nRight to Rectification (Art. 16)\nAsk us to correct inaccurate data or complete incomplete data.\nHow: Update most data directly in your account settings, or email us for data you cannot self-edit.\n\nRight to Erasure (Art. 17)\nRequest deletion of your personal data where: it is no longer necessary for the original purpose; you withdraw consent; you object and we have no overriding legitimate grounds; it was unlawfully processed; or it must be erased for legal compliance.\nHow: Email privacy@flairsync.com with the subject "Erasure Request". Note: some data must be retained for legal obligations (e.g., financial records).\n\nRight to Restrict Processing (Art. 18)\nRequest that we pause processing of your data while you contest its accuracy, object to its processing, or where we no longer need it but you need it for legal claims.\nHow: Email privacy@flairsync.com with the subject "Restriction Request".\n\nRight to Data Portability (Art. 20)\nReceive your data in a structured, commonly used, machine-readable format (JSON or CSV) to transfer to another service.\nHow: Email privacy@flairsync.com with the subject "Portability Request".\n\nRight to Object (Art. 21)\nObject to processing based on legitimate interests or for direct marketing. We will stop unless we have compelling legitimate grounds that override your interests.\nHow: Email privacy@flairsync.com with the subject "Objection to Processing".\n\nWe respond to all requests within 30 calendar days (extendable to 90 days for complex or numerous requests, with notice). All requests are free of charge.`
    },
    {
        title: "4. EU Representative",
        content: `As FlairSync is headquartered in Andorra — which maintains an equivalent level of data protection to the EU — and provides services to EU residents, we are committed to full GDPR compliance.\n\nFor any matters related to EU data protection law, EU residents may contact us directly:\n\nEmail: privacy@flairsync.com\nAddress: FlairSync, Andorra La Vella, AD500, Andorra\nPhone: +376 123 456\n\nIf you are located in the EU and wish to exercise your rights or lodge a complaint, you may contact the data protection authority in your member state, in addition to or instead of contacting us directly.`
    },
    {
        title: "5. Breach Notification",
        content: `In the event of a personal data breach, we follow the obligations set out in GDPR Articles 33 and 34:\n\n• Supervisory authority notification (Art. 33): if a breach is likely to result in a risk to individuals' rights and freedoms, we will notify the relevant supervisory authority within 72 hours of becoming aware\n• Individual notification (Art. 34): if a breach is likely to result in a high risk to your rights and freedoms, we will notify you directly without undue delay, describing the nature of the breach, the data affected, and the measures we are taking\n\nIf you believe your data has been compromised, contact security@flairsync.com immediately.`
    },
    {
        title: "6. Sub-Processors",
        content: `As a data processor for our business customers, we use the following categories of sub-processors, all bound by Data Processing Agreements:\n\n• Payment processing: Stripe (US, covered by SCCs and EU-US adequacy framework)\n• Email delivery: SendGrid / Twilio (US, covered by SCCs)\n• Cloud hosting & infrastructure: covered by relevant adequacy decisions or SCCs\n• Analytics: privacy-preserving, anonymised analytics tooling\n\nWe maintain a full, up-to-date list of sub-processors. To receive the complete list or to be notified of changes, contact privacy@flairsync.com.\n\nBefore onboarding any new sub-processor, we conduct due diligence on their data protection practices and enter into appropriate contractual safeguards.`
    },
    {
        title: "7. Legitimate Interests Assessment",
        content: `Where we rely on legitimate interests (Art. 6(1)(f)) as our legal basis, we conduct a three-part Legitimate Interests Assessment (LIA):\n\n1. Purpose test: Is there a genuine legitimate interest?\n2. Necessity test: Is processing necessary to achieve the purpose?\n3. Balancing test: Do our interests override the rights and freedoms of individuals?\n\nWe currently rely on legitimate interests for:\n\n• Platform security and fraud detection\n• Aggregated, anonymised analytics to improve our service\n• Sending existing customers relevant service updates (soft opt-in)\n\nYou have the right to object to any processing based on legitimate interests at any time (see Section 3).`
    },
    {
        title: "8. Supervisory Authorities",
        content: `You have the right to lodge a complaint with a data protection supervisory authority at any time. You may contact:\n\nAndorran Data Protection Authority (APDA)\nAgència Andorrana de Protecció de Dades\nwww.apda.ad\n\nOr the supervisory authority in your EU member state of habitual residence, place of work, or where an alleged infringement occurred.\n\nWe would sincerely appreciate the opportunity to resolve your concern before you approach a supervisory authority. Please contact privacy@flairsync.com first.`
    }
];

const GDPRPage: React.FC = () => {
    return (
        <div>
            <LandingHeader />
            <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-20 space-y-12">
                <section className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold">GDPR & Cookie Policy</h1>
                    <p className="text-muted-foreground">Last Updated: May 6, 2026</p>
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
                <section className="space-y-8">
                    {gdprSections.map(({ title, content }) => (
                        <Card key={title} className="shadow-none border border-border">
                            <CardHeader>
                                <CardTitle className="text-lg">{title}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-muted-foreground whitespace-pre-line">{content}</CardContent>
                        </Card>
                    ))}
                </section>

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
