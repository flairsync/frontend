import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StaffTasksPage() {
    const tasks = [
        { id: 1, title: "Prepare coffee station", status: "pending" },
        { id: 2, title: "Clean tables (morning)", status: "done" },
        { id: 3, title: "Update specials board", status: "pending" },
        { id: 4, title: "Restock napkins and cutlery", status: "pending" },
    ]

    return (
        <div className="space-y-6 p-6">
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
                    <p className="text-muted-foreground">Check off your daily responsibilities.</p>
                </div>
                <Button>Add Task</Button>
            </div>

            {/* Tabs for organization */}
            <Tabs defaultValue="today" className="w-full">
                <TabsList>
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                {/* Today’s Tasks */}
                <TabsContent value="today" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Today’s Tasks</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {tasks
                                .filter((task) => task.status === "pending")
                                .map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center justify-between border-b pb-2 last:border-0"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Checkbox />
                                            <span>{task.title}</span>
                                        </div>
                                        <Badge variant="outline">Pending</Badge>
                                    </div>
                                ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Upcoming Tasks */}
                <TabsContent value="upcoming" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Tasks</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span>Clean tables (evening)</span>
                                <Badge variant="secondary">Tomorrow</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Deep clean espresso machine</span>
                                <Badge variant="secondary">Friday</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Completed Tasks */}
                <TabsContent value="completed" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Completed Tasks</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {tasks
                                .filter((task) => task.status === "done")
                                .map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center justify-between border-b pb-2 last:border-0"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Checkbox checked disabled />
                                            <span className="line-through text-muted-foreground">{task.title}</span>
                                        </div>
                                        <Badge>Done</Badge>
                                    </div>
                                ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
