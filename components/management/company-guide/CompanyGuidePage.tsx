import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Store,
    LayoutGrid,
    Users,
    Network,
    Lightbulb,
    ArrowRight,
} from "lucide-react";

const CompanyGuidePage: React.FC = () => {
    const { t } = useTranslation("management");

    const decisionItems = t("company_guide.decision.items", { returnObjects: true }) as {
        if: string;
        then: string;
    }[];

    return (
        <div className="p-6 w-full max-w-4xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold">{t("company_guide.title")}</h1>
                <p className="text-muted-foreground mt-1 max-w-2xl">{t("company_guide.subtitle")}</p>
            </div>

            <Separator />

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <Store className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{t("company_guide.sections.single_business.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {t("company_guide.sections.single_business.body")}
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <LayoutGrid className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{t("company_guide.sections.multi_business.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {t("company_guide.sections.multi_business.body")}
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <Users className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{t("company_guide.sections.staff_roles.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {t("company_guide.sections.staff_roles.body")}
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <Network className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{t("company_guide.sections.org_region.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {t("company_guide.sections.org_region.body")}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {t("company_guide.sections.org_region.body_consent")}
                    </p>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 px-4 py-3.5 flex gap-3">
                        <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-1">
                                {t("company_guide.sections.org_region.example_label")}
                            </p>
                            <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                                {t("company_guide.sections.org_region.example")}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">{t("company_guide.decision.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="divide-y divide-border border rounded-lg overflow-hidden">
                        {decisionItems?.map((item, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3.5">
                                <span className="text-sm font-medium text-foreground sm:w-[42%] shrink-0">
                                    {item.if}
                                </span>
                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 hidden sm:block" />
                                <span className="text-sm text-muted-foreground">{item.then}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CompanyGuidePage;
