
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StaffMessagesPage() {
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
                <h1 className="text-2xl font-bold tracking-tight">Messages & Announcements</h1>
                <p className="text-muted-foreground">Stay updated with the latest news and messages.</p>
            </div>

            <Tabs defaultValue="announcements" className="w-full">
                <TabsList>
                    <TabsTrigger value="announcements">Announcements</TabsTrigger>
                    <TabsTrigger value="messages">Messages</TabsTrigger>
                </TabsList>

                {/* Announcements */}
                <TabsContent value="announcements" className="mt-4 space-y-4">
                    {announcements.map((announcement) => (
                        <Card key={announcement.id}>
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle>{announcement.title}</CardTitle>
                                {!announcement.read && <Badge variant="destructive">New</Badge>}
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{announcement.content}</p>
                                {!announcement.read && (
                                    <Button size="sm" className="mt-2">
                                        Mark as Read
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
                                    {message.read ? "Read" : "New"}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">{message.sender}:</span> {message.content}
                                </p>
                                {!message.read && (
                                    <Button size="sm" className="mt-2">
                                        Mark as Read
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
