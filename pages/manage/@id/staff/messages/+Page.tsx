import { useMemo, useState } from "react"
import dayjs from "dayjs"
import { usePageContext } from "vike-react/usePageContext"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslation } from "react-i18next"
import { useAnnouncementsInbox } from "@/features/business/announcements/useAnnouncementsInbox"
import { AnnouncementInboxItem } from "@/models/business/Announcement"

export default function StaffMessagesPage() {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;
    const [page, setPage] = useState(1);

    const { items, currentPage, totalPages, loadingInbox, markAsRead, markingAsRead } =
        useAnnouncementsInbox(businessId, page);

    const announcements = useMemo(
        () => items.filter((item) => item.kind === "ANNOUNCEMENT"),
        [items],
    );
    const messages = useMemo(
        () => items.filter((item) => item.kind === "MESSAGE"),
        [items],
    );

    const renderItem = (item: AnnouncementInboxItem) => (
        <Card key={item.id}>
            <CardHeader className="flex items-center justify-between">
                <div>
                    <CardTitle>{item.title}</CardTitle>
                    {item.authorName && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {item.authorName} · {dayjs(item.createdAt).format("MMM D, YYYY h:mm A")}
                        </p>
                    )}
                    {item.expiresAt && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {t("staff_messages_compose.history_expires")}: {dayjs(item.expiresAt).format("MMM D, h:mm A")}
                        </p>
                    )}
                </div>
                <Badge variant={item.isRead ? "secondary" : "destructive"}>
                    {item.isRead ? t("staff_messages.read_badge") : t("staff_messages.new_badge")}
                </Badge>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{item.content}</p>
                {!item.isRead && (
                    <Button size="sm" className="mt-2" disabled={markingAsRead} onClick={() => markAsRead(item.id)}>
                        {t("staff_messages.mark_as_read")}
                    </Button>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6 p-6">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{t("staff_messages.title")}</h1>
                <p className="text-muted-foreground">{t("staff_messages.subtitle")}</p>
            </div>

            <Tabs defaultValue="announcements" className="w-full">
                <TabsList>
                    <TabsTrigger value="announcements">{t("staff_messages.announcements_tab")}</TabsTrigger>
                    <TabsTrigger value="messages">{t("staff_messages.messages_tab")}</TabsTrigger>
                </TabsList>

                {/* Announcements */}
                <TabsContent value="announcements" className="mt-4 space-y-4">
                    {!loadingInbox && announcements.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">{t("staff_messages.no_announcements")}</p>
                    )}
                    {announcements.map(renderItem)}
                </TabsContent>

                {/* Messages */}
                <TabsContent value="messages" className="mt-4 space-y-4">
                    {!loadingInbox && messages.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">{t("staff_messages.no_messages")}</p>
                    )}
                    {messages.map(renderItem)}
                </TabsContent>
            </Tabs>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1 || loadingInbox}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        {t("staff_messages.previous_page")}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {t("staff_messages.page_indicator", { current: currentPage, total: totalPages })}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages || loadingInbox}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                        {t("staff_messages.next_page")}
                    </Button>
                </div>
            )}
        </div>
    )
}
