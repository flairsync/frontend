import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export const OrganizationExplainer: React.FC = () => {
    const { t } = useTranslation("management");
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold mb-1">{t("organizations_page.explainer.title")}</h2>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            {t("organizations_page.explainer.description")}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
