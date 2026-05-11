"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import WebsiteFooter from "@/components/shared/WebsiteFooter";
import LandingHeader from "@/components/landing/LandingHeader";

const privacyTextSections = [
    {
        title: "1. Introduction & Data Controller",
        content: `FlairSync ("we", "us", or "our") is the data controller responsible for your personal data. We are committed to protecting your privacy and processing your personal data transparently, in compliance with the General Data Protection Regulation (EU) 2016/679 (GDPR), the ePrivacy Directive, and all applicable EU data protection laws.\n\nData Controller:\nFlairSync\nAndorra La Vella, AD500, Andorra\nEmail: privacy@flairsync.com\nPhone: +376 123 456\n\nFor all data protection enquiries or to exercise your rights, please contact us at privacy@flairsync.com.`
    },
    {
        title: "2. What Personal Data We Collect",
        content: `We collect and process the following categories of personal data:\n\n• Identity Data: name, username, profile picture\n• Contact Data: email address, phone number, billing address\n• Account Data: password (hashed), account preferences, role\n• Transaction & Financial Data: billing history, subscription tier (payment card details are processed by our payment provider and never stored by us)\n• Technical Data: IP address, browser type and version, device identifiers, operating system, time zone\n• Usage Data: pages visited, features used, click interactions, session duration, error logs\n• Communications Data: messages sent through our support system or in-app messaging\n• Marketing Preferences: your opt-in/opt-out choices for marketing communications\n\nWe do not collect any special category data (e.g., health, racial or ethnic origin, political opinions, religious beliefs) unless explicitly required and consented to.`
    },
    {
        title: "3. How We Collect Your Data",
        content: `We collect your data through:\n\n• Direct interactions: when you register an account, subscribe to a plan, fill in forms, or contact us\n• Automated technologies: cookies, web beacons, and similar tracking technologies when you use our platform\n• Third parties: payment processors (e.g., Stripe), authentication providers, and analytics services\n\nWe will always inform you at the point of collection what data is required and why.`
    },
    {
        title: "4. Legal Basis for Processing",
        content: `Under GDPR Article 6, we process your personal data on the following legal grounds:\n\n• Contractual necessity (Art. 6(1)(b)): to provide and manage our services, process payments, and fulfil our obligations under your subscription agreement\n• Legal obligation (Art. 6(1)(c)): to comply with applicable laws, including tax, financial reporting, and anti-fraud requirements\n• Legitimate interests (Art. 6(1)(f)): to improve our platform, prevent fraud, ensure network security, and send service-related communications — always balanced against your rights and interests\n• Consent (Art. 6(1)(a)): for optional marketing communications, non-essential cookies, and analytics tracking. You may withdraw consent at any time without affecting the lawfulness of prior processing.\n\nWhere we rely on legitimate interests, you may object to that processing at any time (see Section 8).`
    },
    {
        title: "5. Purpose of Data Processing",
        content: `We process your personal data for the following purposes:\n\n• Service delivery: creating and managing your account, processing reservations, orders, and payments\n• Communications: sending transactional emails (receipts, alerts, password resets), service updates, and — where consented — marketing newsletters\n• Security & fraud prevention: monitoring for suspicious activity, enforcing our Terms of Service, and protecting users\n• Analytics & improvement: understanding how users interact with our platform to improve features and fix bugs\n• Legal compliance: fulfilling our obligations under applicable laws and regulations\n• Dispute resolution: retaining records necessary to resolve disputes or enforce agreements\n\nWe will not use your data for purposes that are incompatible with those listed above without notifying you.`
    },
    {
        title: "6. Data Retention",
        content: `We retain your personal data only as long as necessary for the purposes described in this policy:\n\n• Active account data: retained for the duration of your account plus 30 days after deletion\n• Billing & transaction records: retained for 7 years to comply with financial and tax regulations\n• Communication logs: retained for 3 years for dispute resolution purposes\n• Analytics data: aggregated and anonymised after 24 months\n• Marketing consent records: retained for 3 years after you withdraw consent or your account is deleted\n• Server logs (IP addresses, technical data): automatically deleted after 90 days\n\nWhen retention periods expire, data is securely deleted or anonymised. You may request early deletion of your data subject to legal retention obligations (see Section 8).`
    },
    {
        title: "7. Sharing Your Data",
        content: `We do not sell your personal data. We share it only in the following circumstances:\n\n• Service providers (data processors): we use trusted third-party processors (e.g., Stripe for payments, SendGrid for email, cloud hosting providers) who are contractually bound by Data Processing Agreements (DPAs) and may only process data on our instructions\n• Legal requirements: we may disclose your data to public authorities where required by law, court order, or to protect the rights and safety of users\n• Business transfers: in the event of a merger, acquisition, or sale of assets, your data may be transferred — we will notify you beforehand and your rights under this policy will continue to apply\n• With your consent: we will share your data with other parties only with your explicit consent\n\nA full list of our sub-processors is available on request at privacy@flairsync.com.`
    },
    {
        title: "8. International Data Transfers",
        content: `FlairSync is headquartered in Andorra, which maintains an adequate level of data protection comparable to the EU. Some of our service providers are located outside the European Economic Area (EEA).\n\nWhere we transfer personal data outside the EEA, we ensure appropriate safeguards are in place, including:\n\n• Standard Contractual Clauses (SCCs) approved by the European Commission\n• Adequacy decisions by the European Commission\n• Binding Corporate Rules (BCRs) where applicable\n\nYou may request details of the safeguards applied to any specific transfer by contacting privacy@flairsync.com.`
    },
    {
        title: "9. Your GDPR Rights",
        content: `Under the GDPR, you have the following rights regarding your personal data:\n\n• Right of access (Art. 15): request a copy of the personal data we hold about you and information on how it is processed\n• Right to rectification (Art. 16): request correction of inaccurate or incomplete data\n• Right to erasure / "right to be forgotten" (Art. 17): request deletion of your data where there is no legitimate ground for continued processing\n• Right to restrict processing (Art. 18): request that we limit how we use your data in certain circumstances\n• Right to data portability (Art. 20): receive your data in a structured, machine-readable format and transfer it to another controller\n• Right to object (Art. 21): object to processing based on legitimate interests or for direct marketing purposes\n• Rights related to automated decision-making (Art. 22): we do not make solely automated decisions that produce significant legal effects on you; if this changes, we will notify you and provide a human review option\n• Right to withdraw consent: where processing is based on consent, you may withdraw it at any time without affecting prior processing\n\nTo exercise any of these rights, contact us at privacy@flairsync.com. We will respond within 30 days (extendable by a further two months for complex requests). Requests are free of charge unless manifestly unfounded or excessive.`
    },
    {
        title: "10. Cookies and Tracking Technologies",
        content: `We use cookies and similar technologies on our platform. These fall into four categories:\n\n• Strictly necessary cookies: required for the platform to function (authentication, session management). No consent needed.\n• Functional cookies: remember your preferences (language, theme). Enabled by default; you may disable them in your browser.\n• Analytics cookies: help us understand usage patterns. Only set with your consent.\n• Marketing cookies: used to show relevant content or advertisements. Only set with your explicit consent.\n\nYou can manage cookie preferences at any time via the Cookie Settings panel (accessible from the footer) or through your browser settings. For full details, see our dedicated Cookie Policy at /gdpr.`
    },
    {
        title: "11. Data Security",
        content: `We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction, including:\n\n• Encryption of data in transit (TLS 1.2+) and at rest (AES-256)\n• Password hashing using bcrypt\n• Role-based access controls limiting internal access to personal data\n• Regular security assessments and penetration testing\n• Incident response procedures aligned with GDPR Article 33 breach notification requirements (72-hour notification to supervisory authority; notification to affected users without undue delay where risk is high)\n\nDespite these measures, no system is completely secure. If you suspect a security incident, please contact security@flairsync.com immediately.`
    },
    {
        title: "12. Children's Privacy",
        content: `Our services are not directed to individuals under the age of 18. We do not knowingly collect personal data from minors. If we become aware that a minor has provided us with personal data without parental consent, we will delete it promptly. If you believe we have inadvertently collected data from a minor, please contact privacy@flairsync.com.`
    },
    {
        title: "13. Supervisory Authority",
        content: `You have the right to lodge a complaint with a data protection supervisory authority if you believe we have processed your personal data in violation of applicable law.\n\nYou may contact the supervisory authority in your EU member state, or, given our Andorran base, the Andorran Data Protection Authority (APDA):\n\nAgència Andorrana de Protecció de Dades (APDA)\nwww.apda.ad\n\nWe would, however, appreciate the opportunity to address your concerns before you approach a supervisory authority — please contact us first at privacy@flairsync.com.`
    },
    {
        title: "14. Changes to this Policy",
        content: `We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of material changes via email or a prominent notice on our platform at least 30 days before they take effect. The "Last Updated" date at the top of this page indicates when the policy was last revised.\n\nContinued use of our services after the effective date of changes constitutes acceptance of the updated policy. If you do not agree, you may delete your account at any time.`
    },
    {
        title: "15. Contact Us",
        content: `For any questions, requests, or concerns regarding this Privacy Policy or our data practices, please contact:\n\nFlairSync Data Protection\nEmail: privacy@flairsync.com\nPhone: +376 123 456\nAddress: Andorra La Vella, AD500, Andorra\n\nWe aim to respond to all enquiries within 5 business days.`
    }
];

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div>
            <LandingHeader />
            <main className="container mx-auto max-w-5xl px-6 pt-32 pb-20 space-y-12">
                <section className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold">Privacy Policy</h1>
                    <p className="text-muted-foreground">Last Updated: May 6, 2026</p>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        This Privacy Policy explains how FlairSync collects, uses, and protects your personal data
                        in full compliance with the GDPR (EU) 2016/679, the ePrivacy Directive, and applicable EU data protection law.
                    </p>
                </section>

                <Separator />

                <section className="space-y-8">
                    {privacyTextSections.map(({ title, content }) => (
                        <Card key={title} className="shadow-none border border-border">
                            <CardHeader>
                                <CardTitle className="text-lg">{title}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-muted-foreground whitespace-pre-line">{content}</CardContent>
                        </Card>
                    ))}
                </section>
            </main>
            <WebsiteFooter />
        </div>
    );
};

export default PrivacyPolicyPage;
