import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Mail, MessageSquare, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const faqs = [
    {
        question: "How do I join a business?",
        answer:
            "You can join a business only if an owner or admin sends you an invite link. Once accepted, it will appear under your 'Joined' tab.",
    },
    {
        question: "How can I create a new business?",
        answer:
            "Go to the 'My Businesses' page and click on 'Create Business'. You’ll be able to set up your business name, description, and invite members.",
    },
    {
        question: "Where can I manage my subscription?",
        answer:
            "All your billing details and subscription information can be found under the 'Billing' section in your dashboard.",
    },
    {
        question: "How do I contact support?",
        answer:
            "If you need help, reach out through the support form below or email us directly.",
    },
];

const HelpPage = () => {
    return (
        <div className="p-6 w-full">
            <div className="flex items-center gap-3 mb-4">
                <HelpCircle className="h-7 w-7 text-blue-600" />
                <h1 className="text-2xl font-bold">Help & Support</h1>
            </div>
            <p className="text-zinc-500 mb-8">
                Find answers to common questions, or get in touch with our support team.
            </p>

            {/* FAQ Section */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
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
                        <CardTitle>Contact Support</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-zinc-600 mb-4">
                            Need more help? Send us a message and we’ll get back to you soon.
                        </p>
                        <a
                            href="mailto:support@yourapp.com"
                            className="text-blue-600 hover:underline text-sm"
                        >
                            support@yourapp.com
                        </a>
                        <div className="mt-4">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                                Send a Message
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-zinc-200">
                    <CardHeader className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <CardTitle>Documentation & Tutorials</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-zinc-600 mb-4">
                            Explore our guides to learn how to get the most out of the platform.
                        </p>
                        <div className="flex flex-col gap-2">
                            <a href="/docs/getting-started" className="text-blue-600 hover:underline text-sm">
                                Getting Started Guide
                            </a>
                            <a href="/docs/billing" className="text-blue-600 hover:underline text-sm">
                                Billing & Subscriptions
                            </a>
                            <a href="/docs/invites" className="text-blue-600 hover:underline text-sm">
                                Inviting Team Members
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HelpPage;
