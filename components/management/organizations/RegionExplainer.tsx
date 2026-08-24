import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { MapPinned } from "lucide-react";

export const RegionExplainer: React.FC = () => {
    const { t } = useTranslation("management");
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPinned className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold mb-1">{t("regions_page.explainer.title")}</h2>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            {t("regions_page.explainer.description")}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
