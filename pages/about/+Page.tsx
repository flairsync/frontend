"use client";

import React from "react";
import { Rocket, Activity, Shield, Users, TrendingUp, Globe, Star, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import LandingHeader from "@/components/landing/LandingHeader";
import WebsiteFooter from "@/components/shared/WebsiteFooter";

const stats = [
    { value: "Early", label: "Access Launch" },
    { value: "2026", label: "Founded" },
    { value: "1", label: "Country & Growing" },
    { value: "99.9%", label: "Platform Uptime" },
];

const values = [
    {
        icon: Rocket,
        title: "Our Mission",
        description:
            "FlairSync exists to give every restaurant and café owner—big or small—the same powerful technology that enterprise chains use. We simplify reservations, menus, orders, and customer feedback into a single seamless platform.",
    },
    {
        icon: Activity,
        title: "Our Vision",
        description:
            "A world where hospitality businesses thrive through technology. We build for real-time insights, smart analytics, and customer satisfaction tools that drive sustainable growth.",
    },
    {
        icon: Shield,
        title: "Security & Trust",
        description:
            "Data privacy is non-negotiable. FlairSync uses encrypted storage, role-based access control, and is fully compliant with modern data-protection standards so your business is always protected.",
    },
];

const principles = [
    "Built for speed — every feature ships fast and works reliably",
    "Customer-first design at every touchpoint",
    "Transparent pricing with no hidden fees",
    "Dedicated support that actually responds",
    "Continuous improvement driven by real feedback",
];

const team = [
    {
        name: "Semah Chriha",
        role: "Founder & CTO",
        bio: "Full-stack engineer and entrepreneur passionate about building tools that empower the hospitality industry.",
        initial: "S",
    },
    {
        name: "Sarah Chamekh",
        role: "Co-Founder & AI Engineer",
        bio: "Driven by a vision to make restaurant management more human, Sarah shapes the product strategy and business direction at FlairSync.",
        initial: "S",
    },
];

const AboutUsPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <LandingHeader />

            <main className="flex-1 pt-20">
                {/* Hero */}
                <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-28 px-6 text-center">
                    <div className="absolute inset-0 pointer-events-none" aria-hidden>
                        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
                    </div>
                    <div className="relative max-w-3xl mx-auto space-y-6">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
                            <Star className="w-3.5 h-3.5" />
                            Now in Early Access
                        </span>
                        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
                            The platform built for{" "}
                            <span className="text-primary">modern hospitality</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            FlairSync is an all-in-one management platform for restaurants and cafés — handling reservations, menus, staff, analytics, and customer engagement from a single dashboard.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3 pt-2">
                            <a href="/signup">
                                <Button className="rounded-full px-8 py-2.5 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                                    Get Started Free
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </a>
                            <a href="/support">
                                <Button variant="outline" className="rounded-full px-8 py-2.5">
                                    Talk to Us
                                </Button>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="border-y border-border bg-card/50">
                    <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map(({ value, label }) => (
                            <div key={label} className="space-y-1">
                                <p className="text-4xl font-extrabold text-primary">{value}</p>
                                <p className="text-sm text-muted-foreground font-medium">{label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="max-w-6xl mx-auto px-6 py-24 space-y-28">
                    {/* Mission / Vision / Security */}
                    <section className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-extrabold">What drives us</h2>
                            <p className="text-muted-foreground max-w-xl mx-auto">
                                Three pillars that shape every decision we make.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                            {values.map(({ icon: Icon, title, description }) => (
                                <div
                                    key={title}
                                    className="group rounded-2xl border border-border bg-card p-8 space-y-4 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <Icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold">{title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <Separator />

                    {/* Our Story */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-widest">
                                <TrendingUp className="w-4 h-4" />
                                Our Story
                            </div>
                            <h2 className="text-4xl font-extrabold leading-tight">
                                Built from a real problem, not a whiteboard
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                FlairSync was born after seeing how many restaurant owners struggled with fragmented tools — one app for reservations, another for menus, spreadsheets for staff. We set out to unify all of that into one platform that actually makes sense to use.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                Today we power hundreds of restaurants across 12+ countries, and we're just getting started. Every feature we ship comes directly from conversations with the operators who use it every day.
                            </p>
                        </div>
                        <div className="space-y-3">
                            {principles.map((p) => (
                                <div key={p} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/60">
                                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                    <span className="text-sm font-medium">{p}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <Separator />

                    {/* Team */}
                    <section className="space-y-10 text-center">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-widest">
                                <Users className="w-4 h-4" />
                                The Team
                            </div>
                            <h2 className="text-3xl font-extrabold">People behind FlairSync</h2>
                            <p className="text-muted-foreground max-w-xl mx-auto">
                                A small but focused team on a mission to reshape how restaurants operate.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto w-full">
                            {team.map(({ name, role, bio, initial }) => (
                                <div
                                    key={name}
                                    className="max-w-xs w-full rounded-2xl border border-border bg-card p-8 space-y-4 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                                        <span className="text-3xl font-extrabold text-primary">{initial}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{name}</h3>
                                        <p className="text-primary text-sm font-semibold mt-0.5">{role}</p>
                                    </div>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{bio}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <Separator />

                    {/* CTA */}
                    <section className="relative rounded-3xl overflow-hidden bg-primary px-10 py-20 text-center text-primary-foreground space-y-6">
                        <div className="absolute inset-0 pointer-events-none" aria-hidden>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
                        </div>
                        <div className="relative space-y-4 max-w-2xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-sm font-medium">
                                <Globe className="w-3.5 h-3.5" />
                                Be among the first restaurants on FlairSync
                            </div>
                            <h2 className="text-4xl font-extrabold">Ready to transform your restaurant?</h2>
                            <p className="text-primary-foreground/80 max-w-lg mx-auto">
                                Start for free. No credit card required. Set up your business in under 5 minutes.
                            </p>
                            <div className="flex flex-wrap justify-center gap-3 pt-2">
                                <a href="/signup">
                                    <Button variant="secondary" className="rounded-full px-8 py-2.5 font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                                        Start for Free
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </a>
                                <a href="/support">
                                    <Button variant="outline" className="rounded-full px-8 py-2.5 border-white/60 text-white hover:bg-white/15 hover:text-white bg-transparent">
                                        Contact Sales
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <WebsiteFooter />
        </div>
    );
};

export default AboutUsPage;
