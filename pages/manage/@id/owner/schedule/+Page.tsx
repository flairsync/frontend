import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Clock, Edit3, Users, CalendarDays, AlertCircle } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import ManagerScheduleSummary from "@/components/management/schedule/ManagerScheduleSummary";
import ManagerScheduleClockinTab from "@/components/management/schedule/ManagerScheduleClockinTab";
import ManagerScheduleShiftsTab from "@/components/management/schedule/ManagerScheduleShiftsTab";
import ManagerScheduleStaffSchedulingTab from "@/components/management/schedule/ManagerScheduleStaffSchedulingTab";
import ManagerScheduleCalendarTab from "@/components/management/schedule/ManagerScheduleCalendarTab";

export default function OwnerManageSchedulesPage() {
    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-slate-900">Schedule Management</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button>
                            <PlusCircle className="w-4 h-4 mr-2" /> Add Shift
                        </Button>
                        <Button>
                            <PlusCircle className="w-4 h-4 mr-2" /> Schedule staff
                        </Button>

                    </div>
                </div>

                {/* Summary cards */}
                <ManagerScheduleSummary />

                {/* Filters */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex gap-2">
                        <Select>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by staff" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Staff</SelectItem>
                                <SelectItem value="1">Jane Doe</SelectItem>
                                <SelectItem value="2">John Smith</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input type="date" className="w-[180px]" />
                    </div>
                    <Button variant="outline">Export Data</Button>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="clockins" className="space-y-6">
                    <TabsList className="w-full grid grid-cols-2 md:grid-cols-4">
                        <TabsTrigger value="clockins" className="hover:cursor-pointer hover:scale-105 transition-all ease-in-out duration-300">Clock-ins / Clock-outs</TabsTrigger>
                        <TabsTrigger value="shifts" className="hover:cursor-pointer hover:scale-105 transition-all ease-in-out duration-300">Shifts</TabsTrigger>
                        <TabsTrigger value="manage" className="hover:cursor-pointer hover:scale-105 transition-all ease-in-out duration-300">Staff Scheduling</TabsTrigger>
                        <TabsTrigger value="calendar" className="hover:cursor-pointer hover:scale-105 transition-all ease-in-out duration-300">Calendar</TabsTrigger>
                    </TabsList>

                    {/* Clock-ins / Clock-outs */}
                    <TabsContent value="clockins">
                        <ManagerScheduleClockinTab />

                    </TabsContent>

                    {/* Shifts overview */}
                    <TabsContent value="shifts">
                        <ManagerScheduleShiftsTab />
                    </TabsContent>

                    {/* Manage Staff Scheduling */}
                    <TabsContent value="manage">
                        <ManagerScheduleStaffSchedulingTab />
                    </TabsContent>
                    <TabsContent value="calendar">
                        <ManagerScheduleCalendarTab />
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}
