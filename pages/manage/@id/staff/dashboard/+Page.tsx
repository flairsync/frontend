
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ClipboardList, ShoppingBag, Bell, Loader2 } from "lucide-react"
import { AttendanceDashboard } from "@/components/management/schedule/AttendanceDashboard"
import { usePageContext } from "vike-react/usePageContext"
import { useMyEmployments } from "@/features/business/employment/useMyEmployments"
import { useTodayAttendanceDashboard } from "@/features/shifts/useAttendance"
import { useBusinessTasks } from "@/features/tasks/useTasks"
import { useOrders } from "@/features/orders/useOrders"
import { useNotifications } from "@/features/notifications/useNotifications"
import { usePermissions } from "@/features/auth/usePermissions"
import { getTaskStatusLabel, TASK_STATUS_COLORS } from "@/models/Task"
import { useTranslation } from "react-i18next"

export default function StaffDashboard() {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const { myEmployments, loadingMyEmployments } = useMyEmployments();
    const activeEmployment = myEmployments?.find(e => e.business?.id === businessId);
    const employmentId = activeEmployment?.id || "";

    const { hasPermission } = usePermissions(businessId);
    const canViewOrders = hasPermission("ORDERS", "read");

    const { data: dashboard, isLoading: isLoadingDashboard } = useTodayAttendanceDashboard(businessId);
    const { tasks, loadingTasks } = useBusinessTasks(businessId);
    const { orders, fetchingOrders } = useOrders(businessId, "ongoing", undefined, undefined, undefined, undefined, canViewOrders);
    const { notifications, unreadCount, loadingNotifications } = useNotifications();

    const pendingTasks = tasks.filter(t => t.status !== "COMPLETED");

    if (loadingMyEmployments || isLoadingDashboard) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{t("staff_dashboard.title")}</h1>
                <p className="text-muted-foreground">{t("staff_dashboard.subtitle")}</p>
            </div>

            {businessId && employmentId && (
                <AttendanceDashboard businessId={businessId as string} employmentId={employmentId} />
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{t("staff_dashboard.my_shifts_card")}</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboard?.shifts?.length ?? 0}</div>
                        <p className="text-xs text-muted-foreground">{t("staff_dashboard.shifts_today")}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{t("staff_dashboard.tasks_card")}</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loadingTasks ? (
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        ) : (
                            <div className="text-2xl font-bold">{pendingTasks.length}</div>
                        )}
                        <p className="text-xs text-muted-foreground">{t("staff_dashboard.pending_today")}</p>
                    </CardContent>
                </Card>

                {canViewOrders && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{t("staff_dashboard.orders_card")}</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {fetchingOrders ? (
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            ) : (
                                <div className="text-2xl font-bold">{orders?.length ?? 0}</div>
                            )}
                            <p className="text-xs text-muted-foreground">{t("staff_dashboard.active_right_now")}</p>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{t("staff_dashboard.notifications_card")}</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loadingNotifications ? (
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        ) : (
                            <div className="text-2xl font-bold">{unreadCount}</div>
                        )}
                        <p className="text-xs text-muted-foreground">{t("staff_dashboard.unread_messages")}</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="tasks" className="w-full">
                <TabsList>
                    <TabsTrigger value="tasks">{t("staff_dashboard.tabs.tasks")}</TabsTrigger>
                    {canViewOrders && <TabsTrigger value="orders">{t("staff_dashboard.tabs.orders")}</TabsTrigger>}
                    <TabsTrigger value="notifications">{t("staff_dashboard.tabs.notifications")}</TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="mt-4 space-y-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("staff_dashboard.tabs.tasks")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {loadingTasks ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : pendingTasks.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">{t("staff_dashboard.no_pending_tasks")}</p>
                            ) : (
                                pendingTasks.map(task => (
                                    <div key={task.id} className="flex items-center justify-between">
                                        <span className="text-sm">{task.title}</span>
                                        <Badge className={TASK_STATUS_COLORS[task.status]}>
                                            {getTaskStatusLabel(task.status, t)}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {canViewOrders && (
                    <TabsContent value="orders" className="mt-4 space-y-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("staff_dashboard.tabs.orders")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {fetchingOrders ? (
                                    <div className="flex justify-center py-4">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : !orders || orders.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">{t("staff_dashboard.no_active_orders")}</p>
                                ) : (
                                    orders.map(order => (
                                        <div key={order.id} className="flex items-center justify-between">
                                            <span className="text-sm">
                                                {order.table
                                                    ? t("staff_dashboard.table_label", { name: order.table.name ?? order.table.number })
                                                    : order.type === "takeaway" ? t("staff_dashboard.takeaway") : t("staff_dashboard.delivery")}
                                                {" "}
                                                <span className="text-muted-foreground text-xs">#{order.id.slice(-6)}</span>
                                            </span>
                                            <Badge variant="outline" className="capitalize">{order.status}</Badge>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                <TabsContent value="notifications" className="mt-4 space-y-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("staff_dashboard.tabs.notifications")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {loadingNotifications ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">{t("staff_dashboard.no_notifications")}</p>
                            ) : (
                                notifications.slice(0, 10).map((n: any) => (
                                    <div key={n.id} className="p-2 rounded-md bg-muted text-sm">
                                        <p className="font-medium">{n.notification?.title}</p>
                                        {n.notification?.message && (
                                            <p className="text-muted-foreground">{n.notification.message}</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex justify-end">
                <a href={`/manage/${businessId}/staff/shifts`}>
                    <Button>{t("staff_dashboard.view_full_schedule")}</Button>
                </a>
            </div>
        </div>
    )
}
