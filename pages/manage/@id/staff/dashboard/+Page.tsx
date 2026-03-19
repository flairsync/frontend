
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ClipboardList, ShoppingBag, Megaphone, Loader2 } from "lucide-react"
import { AttendanceDashboard } from "@/components/management/schedule/AttendanceDashboard"
import { usePageContext } from "vike-react/usePageContext"
import { useMyEmployments } from "@/features/business/employment/useMyEmployments"
import { useTodayAttendanceDashboard } from "@/features/shifts/useAttendance"

export default function StaffDashboard() {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const { myEmployments, loadingMyEmployments } = useMyEmployments();
    const activeEmployment = myEmployments?.find(e => e.business?.id === businessId);
    const employmentId = activeEmployment?.id || "";

    const { data: dashboard, isLoading: isLoadingDashboard } = useTodayAttendanceDashboard(businessId);

    if (loadingMyEmployments || isLoadingDashboard) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    return (
        <div className="space-y-6 p-6">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Staff Dashboard</h1>
                <p className="text-muted-foreground">Welcome back! Here’s what’s happening today.</p>
            </div>

            {/* Attendance Dashboard */}
            {businessId && employmentId && (
                <AttendanceDashboard businessId={businessId as string} employmentId={employmentId} />
            )}

            {/* Quick Overview */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">My Shifts</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboard?.shifts?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Shifts today</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-xs text-muted-foreground">Pending today</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Active right now</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Announcements</CardTitle>
                        <Megaphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">Unread messages</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for deeper info */}
            <Tabs defaultValue="tasks" className="w-full">
                <TabsList>
                    <TabsTrigger value="tasks">Today’s Tasks</TabsTrigger>
                    <TabsTrigger value="orders">Active Orders</TabsTrigger>
                    <TabsTrigger value="messages">Announcements</TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="mt-4 space-y-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Today’s Tasks</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span>Prepare coffee station</span>
                                <Badge variant="outline">Pending</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Clean tables (morning)</span>
                                <Badge>Done</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Update specials board</span>
                                <Badge variant="outline">Pending</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="orders" className="mt-4 space-y-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Orders</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span>Order #1024 - Table 3</span>
                                <Badge variant="outline">In Progress</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Order #1025 - Takeaway</span>
                                <Badge>Ready</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="messages" className="mt-4 space-y-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Announcements</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="p-2 rounded-md bg-muted">
                                Reminder: Team meeting at 5 PM.
                            </div>
                            <div className="p-2 rounded-md bg-muted">
                                New seasonal menu starts tomorrow.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Quick action button */}
            <div className="flex justify-end">
                <a href={`/manage/${businessId}/staff/shifts`}>
                    <Button>View Full Schedule</Button>
                </a>
            </div>
        </div>
    )
}
