"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, MapPin } from "lucide-react";

// --- Constants ---
const contactInfo = [
    {
        icon: Phone,
        label: "Phone",
        value: "+376 123 456",
    },
    {
        icon: Mail,
        label: "Email",
        value: "info@flairsync.com",
    },
    {
        icon: MapPin,
        label: "Address",
        value: "Andorra La Vella, AD500, Andorra",
    },
];

const ContactPage: React.FC = () => {
    return (
        <main className="container mx-auto max-w-5xl px-6 py-20 space-y-16">
            {/* Hero Section */}
            <section className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold">Contact Us</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Have questions or feedback? Reach out to us using the form below, or find our contact information here.
                </p>
            </section>

            <Separator />

            {/* Contact Info & Form Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Contact Information */}
                <div className="space-y-6">
                    {contactInfo.map(({ icon: Icon, label, value }) => (
                        <Card key={label} className="border border-border shadow-none">
                            <CardContent className="flex items-center gap-4">
                                <Icon className="w-6 h-6 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">{label}</p>
                                    <p className="font-medium">{value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Contact Form */}
                <Card className="border border-border shadow-none">
                    <CardHeader>
                        <CardTitle>Send Us a Message</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <Input placeholder="Your Name" required />
                            <Input type="email" placeholder="Your Email" required />
                            <Textarea placeholder="Your Message" required />
                            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                                Send Message
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </section>

            {/* Optional Map Section */}
            <section className="w-full h-64 border border-border rounded-md overflow-hidden">
                {/* Replace the iframe src with your Google Maps link */}
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2871.109!2d1.521!3d42.507!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12c46a5eb1a4c5df%3A0x0!2zNDLCsDMwJzM1LjYiTiAxwrAyMSc0OS42IkU!5e0!3m2!1sen!2sad!4v1681234567890!5m2!1sen!2sad"
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </section>
        </main>
    );
};

export default ContactPage;
