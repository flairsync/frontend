import React from 'react';
import { NotificationList } from '@/components/notifications/NotificationList';
import PublicFeedHeader from '@/components/feed/PublicFeedHeader';
import WebsiteFooter from '@/components/shared/WebsiteFooter';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const NotificationsPage = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <PublicFeedHeader />
            <main className="container py-8 pt-24 max-w-4xl mx-auto space-y-6 px-4 flex-1">
                <h1 className="text-3xl font-bold">Notifications Hub</h1>
                <p className="text-muted-foreground">Stay updated with the latest alerts, bookings, and system security messages.</p>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="mb-4 flex overflow-x-auto">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="ALERT">Alerts</TabsTrigger>
                        <TabsTrigger value="RESERVATION">Reservations</TabsTrigger>
                        <TabsTrigger value="ORDER">Orders</TabsTrigger>
                        <TabsTrigger value="PROMO">Promos</TabsTrigger>
                        <TabsTrigger value="SECURITY">Security</TabsTrigger>
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
