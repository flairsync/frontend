import React, { useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertsList } from "@/components/management/AlertsList";
import { AlertCategory } from "@/features/alerts/types";

type TabValue = AlertCategory | "all";

const AlertsPage = () => {
    const { routeParams, urlParsed } = usePageContext();
    const businessId = routeParams.id;

    const categoryFromUrl = urlParsed.search.category as TabValue | undefined;
    const [activeTab, setActiveTab] = useState<TabValue>(categoryFromUrl ?? "all");

    return (
        <div className="max-w-4xl mx-auto space-y-6 w-full">
            <div>
                <h1 className="text-2xl font-bold">Alerts & Warnings</h1>
                <p className="text-muted-foreground">
                    Configuration issues that may be blocking orders or other business flows.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
                <TabsList className="mb-4 flex overflow-x-auto">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="floor_plan">Floor Plan</TabsTrigger>
                    <TabsTrigger value="menu">Menu</TabsTrigger>
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
