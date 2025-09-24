import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

export default function StaffProfilePage() {
    const profile = {
        role: "Barista",
        location: "Coffee Shop A",
        weeklyHours: 28,
        monthlyHours: 120,
        tasksCompleted: 42,
        tasksPending: 5,
        activeOrders: 3,
    }

    return (
        <div className="space-y-6 p-6">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
                <p className="text-muted-foreground">
                    Overview of your work-related stats and assignments.
                </p>
            </div>

            {/* Role and Location */}
            <Card>
                <CardHeader>
                    <CardTitle>Role & Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span>Position:</span>
                        <span className="font-medium">{profile.role}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Assigned Location:</span>
                        <span className="font-medium">{profile.location}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Work Hours */}
            <Card>
                <CardHeader>
                    <CardTitle>Work Hours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm">
                            <span>Hours this week:</span>
                            <span className="font-medium">{profile.weeklyHours}h</span>
                        </div>
                        <Progress value={(profile.weeklyHours / 40) * 100} className="mt-1" />
                    </div>
                    <div>
                        <div className="flex justify-between text-sm">
                            <span>Hours this month:</span>
                            <span className="font-medium">{profile.monthlyHours}h</span>
                        </div>
                        <Progress value={(profile.monthlyHours / 160) * 100} className="mt-1" />
                    </div>
                </CardContent>
            </Card>

            {/* Tasks */}
            <Card>
                <CardHeader>
                    <CardTitle>Tasks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span>Tasks Completed:</span>
                        <Badge variant="default">{profile.tasksCompleted}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span>Tasks Pending:</span>
                        <Badge variant="destructive">{profile.tasksPending}</Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Active Orders */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Orders</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                    <span>Orders you’re currently handling:</span>
                    <Badge>{profile.activeOrders}</Badge>
                    <Button size="sm" variant="outline">View Orders</Button>
                </CardContent>
            </Card>

            {/* Optional Actions */}
            <div className="flex justify-end space-x-2">
                <Button variant="outline">Request Time Off</Button>
                <Button>View Full Schedule</Button>
            </div>
        </div>
    )
}
