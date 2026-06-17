
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslation } from "react-i18next"

export default function StaffMessagesPage() {
    const { t } = useTranslation("management");
    const announcements = [
        { id: 1, title: "Team Meeting", content: "Reminder: Team meeting at 5 PM in main hall.", read: false },
        { id: 2, title: "Seasonal Menu", content: "New seasonal menu starts tomorrow.", read: true },
    ]

    const messages = [
        { id: 1, sender: "Manager", subject: "Shift Swap Request", content: "Can you swap your shift on Sep 26?", read: false },
        { id: 2, sender: "Owner", subject: "Policy Update", content: "New cleaning protocol to follow.", read: true },
    ]

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
                    {announcements.map((announcement) => (
                        <Card key={announcement.id}>
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle>{announcement.title}</CardTitle>
                                {!announcement.read && <Badge variant="destructive">{t("staff_messages.new_badge")}</Badge>}
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{announcement.content}</p>
                                {!announcement.read && (
                                    <Button size="sm" className="mt-2">
                                        {t("staff_messages.mark_as_read")}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                {/* Messages */}
                <TabsContent value="messages" className="mt-4 space-y-4">
                    {messages.map((message) => (
                        <Card key={message.id}>
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle>{message.subject}</CardTitle>
                                <Badge variant={message.read ? "secondary" : "destructive"}>
                                    {message.read ? t("staff_messages.read_badge") : t("staff_messages.new_badge")}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">{message.sender}:</span> {message.content}
                                </p>
                                {!message.read && (
                                    <Button size="sm" className="mt-2">
                                        {t("staff_messages.mark_as_read")}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    )
}
