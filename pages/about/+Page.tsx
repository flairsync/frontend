"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Users, Activity, Rocket, Shield } from "lucide-react";

// --- Constants for About Sections ---
const aboutSections = [
    {
        title: "Our Mission",
        icon: Rocket,
        description:
            "FlairSync is a cutting-edge SaaS platform designed to simplify restaurant and café management. " +
            "Our mission is to help business owners manage reservations, menus, orders, and customer feedback seamlessly " +
            "while providing a smooth experience for both staff and customers.",
    },
    {
        title: "Our Vision",
        icon: Activity,
        description:
            "We envision a world where small and medium-sized hospitality businesses thrive through technology. " +
            "Our platform focuses on real-time updates, analytics, and customer satisfaction tools to ensure efficiency " +
            "and growth.",
    },
    {
        title: "Security & Trust",
        icon: Shield,
        description:
            "Data privacy and secure operations are at the core of FlairSync. " +
            "We provide encrypted storage, role-based access control, and compliance with modern data protection standards.",
    },
];

// --- Team Members ---
const teamMembers = [
    {
        name: "Semah Chriha",
        role: "Founder & CTO",
        img: "https://i.pravatar.cc/150?img=1",
    },
    {
        name: "Sarah Smith",
        role: "Co-Founder & Product Lead",
        img: "https://i.pravatar.cc/150?img=2",
    },
    {
        name: "John Doe",
        role: "Lead Developer",
        img: "https://i.pravatar.cc/150?img=3",
    },
];

const AboutUsPage: React.FC = () => {
    return (
        <main className="container mx-auto max-w-7xl px-6 py-16 space-y-16">
            {/* Hero / Intro */}
            <section className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold">About Us</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    FlairSync is a SaaS platform tailored for restaurants and cafés, providing an all-in-one solution for menus, reservations, customer management, and analytics.
                </p>
            </section>

            <Separator />

            {/* About Sections */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {aboutSections.map(({ title, description, icon: Icon }) => (
                    <Card key={title} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex items-center gap-3">
                            <Icon className="w-6 h-6 text-primary" />
                            <CardTitle>{title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{description}</CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </section>

            <Separator />

            {/* Team Section */}
            <section className="space-y-8 text-center">
                <h2 className="text-3xl font-extrabold">Meet Our Team</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    Our passionate team is dedicated to building tools that empower hospitality businesses.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {teamMembers.map(({ name, role, img }) => (
                        <Card key={name} className="hover:shadow-lg transition-shadow">
                            <img src={img} alt={name} className="w-full h-48 object-cover rounded-t-lg" />
                            <CardContent className="text-center space-y-1">
                                <h3 className="font-semibold">{name}</h3>
                                <p className="text-muted-foreground text-sm">{role}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <Separator />

            {/* CTA Section */}
            <section className="text-center space-y-4">
                <h2 className="text-3xl font-extrabold">Join FlairSync Today</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    Streamline your restaurant operations, increase efficiency, and provide the best experience to your customers.
                </p>
            </section>
        </main>
    );
};

export default AboutUsPage;
