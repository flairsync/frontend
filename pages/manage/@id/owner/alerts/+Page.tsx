import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertsList } from "@/components/management/AlertsList";
import { AlertCategory } from "@/features/alerts/types";

type TabValue = AlertCategory | "all";

const AlertsPage = () => {
    const { t } = useTranslation("management");
    const { routeParams, urlParsed } = usePageContext();
    const businessId = routeParams.id;

    const categoryFromUrl = urlParsed.search.category as TabValue | undefined;
    const [activeTab, setActiveTab] = useState<TabValue>(categoryFromUrl ?? "all");

    return (
        <div className="max-w-4xl mx-auto space-y-6 w-full">
            <div>
                <h1 className="text-2xl font-bold">{t("alerts_page.title")}</h1>
                <p className="text-muted-foreground">
                    {t("alerts_page.subtitle")}
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
                <TabsList className="mb-4 flex justify-start overflow-x-auto">
                    <TabsTrigger value="all">{t("alerts_page.tabs.all")}</TabsTrigger>
                    <TabsTrigger value="floor_plan">{t("alerts_page.tabs.floor_plan")}</TabsTrigger>
                    <TabsTrigger value="menu">{t("alerts_page.tabs.menu")}</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                    <AlertsList businessId={businessId} filterCategory="all" />
                </TabsContent>
                <TabsContent value="floor_plan">
                    <AlertsList businessId={businessId} filterCategory="floor_plan" />
                </TabsContent>
                <TabsContent value="menu">
                    <AlertsList businessId={businessId} filterCategory="menu" />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AlertsPage;
