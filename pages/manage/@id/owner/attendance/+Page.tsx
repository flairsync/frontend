import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import OverviewTab from "@/components/management/attendance/OverviewTab";
import LiveTab from "@/components/management/attendance/LiveTab";
import ReportsTab from "@/components/management/attendance/ReportsTab";
import AbsenceManagementTab from "@/components/management/attendance/AbsenceManagementTab";
import { usePageContext } from "vike-react/usePageContext";
import { useAttendance } from "@/features/shifts/useAttendance";
import { BusinessAttendanceFilters, AttendanceLifecycleStatus, AttendanceStatus } from "@/models/business/shift/Attendance";
import { Users, Activity, BarChart2, CalendarOff } from "lucide-react";

export default function AttendancePage() {
  const { routeParams } = usePageContext();
  const businessId = routeParams.id as string;

  const [activeTab, setActiveTab] = useState("overview");
  const [isInitialized, setIsInitialized] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfWeek(new Date(), { weekStartsOn: 1 }),
    to: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState<AttendanceLifecycleStatus | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | "all">("all");

  const filters: BusinessAttendanceFilters = {
    startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    lifecycleStatus: lifecycleFilter !== "all" ? lifecycleFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    limit: 200,
  };

  const { logs, isLoadingLogs, logsPage } = useAttendance(businessId, filters);

  const filteredLogs = employeeFilter
    ? logs.filter((r) => {
        const name = r.employment
          ? `${r.employment.professionalProfile.firstName} ${r.employment.professionalProfile.lastName}`
          : "";
        return name.toLowerCase().includes(employeeFilter.toLowerCase());
      })
    : logs;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab) setActiveTab(tab);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", activeTab);
      window.history.replaceState({}, "", url.toString());
    }
  }, [activeTab, isInitialized]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full flex overflow-x-auto whitespace-nowrap bg-muted/50 p-1">
            <TabsTrigger value="overview" className="flex-1 px-4 py-2 flex items-center justify-center gap-2">
              <Users className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="live" className="flex-1 px-4 py-2 flex items-center justify-center gap-2">
              <div className="relative">
                <Activity className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              Live View
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex-1 px-4 py-2 flex items-center justify-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="absences" className="flex-1 px-4 py-2 flex items-center justify-center gap-2">
              <CalendarOff className="h-4 w-4" />
              Absences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab
              businessId={businessId}
              records={filteredLogs}
              total={logsPage?.total ?? filteredLogs.length}
              isLoading={isLoadingLogs}
              dateRange={dateRange}
              setDateRange={setDateRange}
              employeeFilter={employeeFilter}
              setEmployeeFilter={setEmployeeFilter}
              lifecycleFilter={lifecycleFilter}
              setLifecycleFilter={setLifecycleFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
          </TabsContent>

          <TabsContent value="live">
            <LiveTab records={filteredLogs} isLoading={isLoadingLogs} />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab
              businessId={businessId}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          </TabsContent>

          <TabsContent value="absences">
            <AbsenceManagementTab businessId={businessId} />
          </TabsContent>
        </Tabs>
    </div>
  );
}
