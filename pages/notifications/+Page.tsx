import React from 'react';
import { useTranslation } from 'react-i18next';
import { NotificationList } from '@/components/notifications/NotificationList';
import PublicFeedHeader from '@/components/feed/PublicFeedHeader';
import WebsiteFooter from '@/components/shared/WebsiteFooter';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const NotificationsPage = () => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <PublicFeedHeader />
            <main className="container py-8 pt-24 max-w-4xl mx-auto space-y-6 px-4 flex-1">
                <h1 className="text-3xl font-bold">{t("notifications_page.title")}</h1>
                <p className="text-muted-foreground">{t("notifications_page.subtitle")}</p>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="mb-4 flex overflow-x-auto">
                        <TabsTrigger value="all">{t("notifications_page.tabs.all")}</TabsTrigger>
                        <TabsTrigger value="ALERT">{t("notifications_page.tabs.alerts")}</TabsTrigger>
                        <TabsTrigger value="RESERVATION">{t("notifications_page.tabs.reservations")}</TabsTrigger>
                        <TabsTrigger value="ORDER">{t("notifications_page.tabs.orders")}</TabsTrigger>
                        <TabsTrigger value="PROMO">{t("notifications_page.tabs.promos")}</TabsTrigger>
                        <TabsTrigger value="SECURITY">{t("notifications_page.tabs.security")}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all">
                        <NotificationList filterType="all" />
                    </TabsContent>
                    <TabsContent value="ALERT">
                        <NotificationList filterType="ALERT" />
                    </TabsContent>
                    <TabsContent value="RESERVATION">
                        <NotificationList filterType="RESERVATION" />
                    </TabsContent>
                    <TabsContent value="ORDER">
                        <NotificationList filterType="ORDER" />
                    </TabsContent>
                    <TabsContent value="PROMO">
                        <NotificationList filterType="PROMO" />
                    </TabsContent>
                    <TabsContent value="SECURITY">
                        <NotificationList filterType="SECURITY" />
                    </TabsContent>
                </Tabs>
            </main>
            <WebsiteFooter />
        </div>
    );
};

export default NotificationsPage;
