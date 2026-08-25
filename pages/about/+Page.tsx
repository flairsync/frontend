"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Rocket, Activity, Shield, Users, TrendingUp, Globe, Star, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import LandingHeader from "@/components/landing/LandingHeader";
import WebsiteFooter from "@/components/shared/WebsiteFooter";
import { resolveTolgeeArrays } from "@/utils/i18n-arrays";

// Icons live here (not translation data) — paired by index with `about_page.values[]`.
const VALUE_ICONS = [Rocket, Activity, Shield];

interface AboutPageContent {
    stats: { value: string; label: string }[];
    values: { title: string; description: string }[];
    principles: string[];
    team: { name: string; role: string; bio: string; initial: string }[];
}

const AboutUsPage: React.FC = () => {
    const { t } = useTranslation("landing");
    const { stats, values, principles, team } = resolveTolgeeArrays<AboutPageContent>(
        t("about_page", { returnObjects: true })
    );

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
                            {t("about_page.badge_early_access")}
                        </span>
                        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
                            {t("about_page.hero_title_prefix")}{" "}
                            <span className="text-primary">{t("about_page.hero_title_highlight")}</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            {t("about_page.hero_subtitle")}
                        </p>
                        <div className="flex flex-wrap justify-center gap-3 pt-2">
                            <a href="/signup">
                                <Button className="rounded-full px-8 py-2.5 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                                    {t("about_page.get_started_free")}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </a>
                            <a href="/support">
                                <Button variant="outline" className="rounded-full px-8 py-2.5">
                                    {t("about_page.talk_to_us")}
                                </Button>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="border-y border-border bg-card/50">
                    <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map(({ value, label }, i) => (
                            <div key={i} className="space-y-1">
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
                            <h2 className="text-3xl font-extrabold">{t("about_page.what_drives_us_title")}</h2>
                            <p className="text-muted-foreground max-w-xl mx-auto">
                                {t("about_page.what_drives_us_subtitle")}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                            {values.map(({ title, description }, i) => {
                                const Icon = VALUE_ICONS[i];
                                return (
                                    <div
                                        key={i}
                                        className="group rounded-2xl border border-border bg-card p-8 space-y-4 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <Icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold">{title}</h3>
                                        <p className="text-muted-foreground leading-relaxed">{description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <Separator />

                    {/* Our Story */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-widest">
                                <TrendingUp className="w-4 h-4" />
                                {t("about_page.our_story_label")}
                            </div>
                            <h2 className="text-4xl font-extrabold leading-tight">
                                {t("about_page.our_story_title")}
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {t("about_page.our_story_paragraph1")}
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                {t("about_page.our_story_paragraph2")}
                            </p>
                        </div>
                        <div className="space-y-3">
                            {principles.map((p, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/60">
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
                                {t("about_page.team_label")}
                            </div>
                            <h2 className="text-3xl font-extrabold">{t("about_page.team_title")}</h2>
                            <p className="text-muted-foreground max-w-xl mx-auto">
                                {t("about_page.team_subtitle")}
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
                                {t("about_page.cta_badge")}
                            </div>
                            <h2 className="text-4xl font-extrabold">{t("about_page.cta_title")}</h2>
                            <p className="text-primary-foreground/80 max-w-lg mx-auto">
                                {t("about_page.cta_subtitle")}
                            </p>
                            <div className="flex flex-wrap justify-center gap-3 pt-2">
                                <a href="/signup">
                                    <Button variant="secondary" className="rounded-full px-8 py-2.5 font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                                        {t("about_page.start_for_free")}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </a>
                                <a href="/support">
                                    <Button variant="outline" className="rounded-full px-8 py-2.5 border-white/60 text-white hover:bg-white/15 hover:text-white bg-transparent">
                                        {t("about_page.contact_sales")}
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
