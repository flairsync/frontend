"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import WebsiteFooter from "@/components/shared/WebsiteFooter";

// --- Constants for Terms Sections (FINALIZED FOR RESTAURANT SaaS) ---
const termsSections = [
    {
        title: "Introduction",
        content: `Welcome to FlairSync! These Terms and Conditions govern your use of our services. By accessing or using our platform, you agree to comply with these terms. Please read them carefully.`
    },
    {
        title: "Eligibility",
        content: `You must be at least 18 years old and have legal capacity to enter into a contract to use our services. By using FlairSync, you confirm that you meet these requirements.`
    },
    {
        title: "Accounts",
        content: `To use certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account.`
    },
    // --- UPDATED FOR DATA/PAYMENT COMPLIANCE ---
    {
        title: "Use of Services",
        content: `You agree to use our services in compliance with all applicable laws and regulations, including those related to data protection, privacy, and payment processing (e.g., PCI compliance). You may not misuse the platform, interfere with others’ use, or attempt to gain unauthorized access. You are solely responsible for securing customer data, financial data, and payment information processed through your use of the service.`
    },

    // --- NEW CRITICAL SECTION FOR RESTAURANT OPERATIONS ---
    {
        title: "User Operational Responsibilities",
        content: `You acknowledge and agree that FlairSync is solely a technical tool and you are fully responsible for the operation of your restaurant business. This includes, but is not limited to: compliance with all local, state, and federal laws regarding food safety, health permits, labor, and tax regulations; the quality and accuracy of all orders, inventory, and prices entered into the system; and the accurate calculation and reporting of all sales and taxes. FlairSync is not responsible for any liability arising from your failure to comply with these laws or for any error in operational data (e.g., pricing, inventory counts) that results in financial loss or regulatory penalty.`
    },

    {
        title: "Payment & Subscriptions",
        content: `If you subscribe to paid features, you agree to provide accurate payment information and to pay all fees in a timely manner. Refunds are provided according to our refund policy.`
    },
    {
        title: "Intellectual Property",
        content: `All content, designs, logos, and trademarks on FlairSync are the property of FlairSync or its licensors. You may not copy, distribute, or create derivative works without permission.`
    },

    // --- NEW CRITICAL SECTION FOR UPTIME/DATA ---
    {
        title: "Service Uptime and Data",
        content: `While we strive for 99.9% uptime, we do not guarantee continuous or uninterrupted availability of the service. You acknowledge that FlairSync may experience planned or unscheduled downtime. You are responsible for regularly backing up and reconciling your critical business data, including sales, inventory, and customer lists, independent of the service. We reserve the right to delete your account data 60 days after termination or suspension of your account.`
    },

    // --- STRONGEST LIMITATION OF LIABILITY CLAUSE ---
    {
        title: "Disclaimer of Warranties",
        content: `Our services are provided on an "as-is" and "as-available" basis. We expressly disclaim all warranties of any kind, whether express or implied, including, but not limited to, the implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We make no warranty that the service will meet your requirements, be uninterrupted, timely, secure, or error-free, nor do we make any warranty as to the results that may be obtained from the use of the service. We are not responsible for any financial loss, loss of data, or damages resulting from service interruption, scheduled or unscheduled downtime, or bugs/errors in the software.`
    },

    // --- LIMITATION OF LIABILITY (Updated) ---
    {
        title: "Limitation of Liability",
        content: `To the maximum extent permitted by applicable law, in no event shall FlairSync or its suppliers be liable for any indirect, incidental, special, exemplary, or consequential damages, including, but not limited to, damages for loss of profits, loss of data, financial loss, service interruption, computer failure or malfunction, or any other commercial damages or losses, arising out of the use or inability to use the service. Our total liability to you for any claim arising out of or relating to these Terms or the services, for any reason whatsoever, will be limited to the amount you have paid to us for the services in the three (3) months preceding the event giving rise to the claim, or $50 (USD), whichever is less.`
    },

    // --- INDEMNIFICATION CLAUSE ---
    {
        title: "Indemnification",
        content: `You agree to indemnify, defend, and hold harmless FlairSync and its affiliates, officers, agents, and employees from and against any and all claims, liabilities, damages, losses, and expenses (including reasonable attorney's fees) arising out of or in any way connected with your access to or use of the services, your violation of these Terms, or your infringement of any third-party right.`
    },

    {
        title: "Termination",
        content: `We may suspend or terminate your account if you violate these Terms or for any legitimate reason. You may also terminate your account at any time by contacting support.`
    },

    // --- GOVERNING LAW AND JURISDICTION ---
    {
        title: "Governing Law and Dispute Resolution",
        content: `These Terms are governed by the laws of Andorra, without regard to its conflict of law principles. You and FlairSync agree to submit to the exclusive jurisdiction of the courts located in Andorra la Vella, Andorra to resolve any dispute or claim arising from these Terms or the services. You agree that any cause of action arising out of or related to the services must commence within one (1) year after the cause of action accrues. Otherwise, such cause of action is permanently barred.`
    },

    {
        title: "Changes to Terms",
        content: `We may update these Terms from time to time. Any changes will be posted with an updated "Last Updated" date. Continued use of the platform constitutes acceptance of the revised terms.`
    },
    {
        title: "Contact Information",
        content: `For any questions regarding these Terms, please contact us at info@FlairSync.com or call +376 123 456.`
    }
];

const TermsPage: React.FC = () => {
    return (
        <div>
            <main className="container mx-auto max-w-5xl px-6 py-20 space-y-12">
                {/* Hero Section */}
                <section className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold">Terms and Conditions</h1>
                    <p className="text-muted-foreground">Last Updated: [Insert Date]</p>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        These Terms and Conditions govern your use of FlairSync. By using our services, you agree to comply with them.
                    </p>
                </section>

                <Separator />

                {/* Terms Sections */}
                <section className="space-y-8">
                    {termsSections.map(({ title, content }) => (
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

export default TermsPage;