import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Bike, CreditCard, Calculator, Megaphone, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type CountryCode = "AD" | "ES" | "FR";

const COUNTRY_FLAG: Record<CountryCode, string> = {
    AD: "🇦🇩",
    ES: "🇪🇸",
    FR: "🇫🇷",
};

interface IntegrationItem {
    key: string;
    icon: LucideIcon;
    countries: CountryCode[];
}

interface IntegrationCategory {
    key: string;
    icon: LucideIcon;
    items: IntegrationItem[];
}

// Every entry below is a real service confirmed to operate in at least one of
// FlairSync's active markets (Andorra, Spain, France). Availability varies by
// country, so each item is tagged with the countries it actually covers.
const CATEGORIES: IntegrationCategory[] = [
    {
        key: "delivery",
        icon: Bike,
        items: [
            { key: "uber_eats", icon: Bike, countries: ["ES", "FR"] },
            { key: "glovo", icon: Bike, countries: ["ES", "AD"] },
            { key: "just_eat", icon: Bike, countries: ["ES", "FR"] },
            { key: "deliveroo", icon: Bike, countries: ["FR"] },
        ],
    },
    {
        key: "payments",
        icon: CreditCard,
        items: [
            { key: "stripe", icon: CreditCard, countries: ["ES", "FR"] },
            { key: "sumup", icon: CreditCard, countries: ["ES", "FR", "AD"] },
        ],
    },
    {
        key: "accounting",
        icon: Calculator,
        items: [
            { key: "sage", icon: Calculator, countries: ["ES", "FR", "AD"] },
            { key: "holded", icon: Calculator, countries: ["ES"] },
            { key: "pennylane", icon: Calculator, countries: ["FR"] },
        ],
    },
    {
        key: "marketing",
        icon: Megaphone,
        items: [
            { key: "google_business", icon: Megaphone, countries: ["ES", "FR", "AD"] },
            { key: "thefork", icon: Megaphone, countries: ["ES", "FR"] },
            { key: "mailchimp", icon: Megaphone, countries: ["ES", "FR", "AD"] },
        ],
    },
];

const IntegrationsPage: React.FC = () => {
    const { t } = useTranslation("management");

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">{t("integrations.title")}</h1>
                        <Badge variant="secondary" className="gap-1">
                            <Sparkles className="h-3 w-3" />
                            {t("integrations.badge")}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground max-w-2xl">{t("integrations.subtitle")}</p>
                </div>
            </div>

            <Separator />

            <div className="space-y-8">
                {CATEGORIES.map((category) => (
                    <div key={category.key} className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            <category.icon className="h-4 w-4" />
                            {t(`integrations.categories.${category.key}`)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {category.items.map((item) => (
                                <Card key={item.key} className="shadow-sm opacity-90">
                                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                                <item.icon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <CardTitle className="text-base">
                                                {t(`integrations.items.${item.key}.name`)}
                                            </CardTitle>
                                        </div>
                                        <Badge variant="outline" className="shrink-0 text-xs">
                                            {t("integrations.badge")}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <CardDescription>
                                            {t(`integrations.items.${item.key}.description`)}
                                        </CardDescription>
                                        <div className="flex items-center gap-1.5">
                                            {item.countries.map((country) => (
                                                <Badge
                                                    key={country}
                                                    variant="secondary"
                                                    className="gap-1 text-xs font-normal"
                                                >
                                                    <span aria-hidden="true">{COUNTRY_FLAG[country]}</span>
                                                    {t(`integrations.countries.${country}`)}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-sm text-muted-foreground">{t("integrations.footer_note")}</p>
        </div>
    );
};

export default IntegrationsPage;
