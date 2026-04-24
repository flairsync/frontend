import React, { useState, useMemo, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "@/components/management/attendance/OverviewTab";
import LiveTab from "@/components/management/attendance/LiveTab";
import ReportsTab from "@/components/management/attendance/ReportsTab";
import EditAttendanceModal from "@/components/management/attendance/EditAttendanceModal";
import AttendanceNotesModal from "@/components/management/attendance/AttendanceNotesModal";
import { mockAttendanceData } from "@/lib/mockAttendanceData";
import {
  AttendanceRecord,
  computeStats,
  computeAttendanceStatus
} from "@/lib/attendanceUtils";
import { toast } from "sonner";
import { Users, Activity, BarChart2 } from "lucide-react";

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>(mockAttendanceData);
  const [activeTab, setActiveTab] = useState("overview");
  const [isInitialized, setIsInitialized] = useState(false);

  // Shared Filters State
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfWeek(new Date(), { weekStartsOn: 1 }),
    to: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [noteRecord, setNoteRecord] = useState<AttendanceRecord | null>(null);

  const gracePeriod = 10;

  // Initialize active tab from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab) setActiveTab(tab);
      setIsInitialized(true);
    }
  }, []);

  // Update URL when tab changes
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", activeTab);
      window.history.replaceState({}, "", url.toString());
    }
  }, [activeTab, isInitialized]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      // Date filter
      if (dateRange?.from && dateRange?.to) {
        const plannedDate = parseISO(record.planned_start);
        if (!isWithinInterval(plannedDate, { start: dateRange.from, end: dateRange.to })) {
          return false;
        }
      }

      // Employee filter
      if (employeeFilter && !record.employee.name.toLowerCase().includes(employeeFilter.toLowerCase())) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        const status = computeAttendanceStatus(record, gracePeriod);
        if (status !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [records, dateRange, employeeFilter, statusFilter]);

  const stats = useMemo(() => computeStats(filteredRecords, gracePeriod), [filteredRecords]);

  const handleUpdateAttendance = (id: string, clockIn: string | null, clockOut: string | null) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, clock_in: clockIn, clock_out: clockOut } : r));
    toast.success("Attendance updated successfully");
  };

  const handleUpdateNote = (id: string, note: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, note } : r));
    toast.success("Note saved successfully");
  };

  const handleExport = () => {
    console.log("Exporting Attendance Report for:", { dateRange, stats });
    toast.info("Export system invoked. PDF formatting will happen on backend.");
  };

  return (
    <main className="min-h-screen ">
      <div className="max-w-6xl mx-auto space-y-6 ">
        {/* Header */}
        <div className="flex items-center justify-between ">
          <h1 className="text-3xl font-bold text-slate-900">Attendance</h1>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full flex overflow-x-auto whitespace-nowrap bg-muted/50 p-1 overflow-hidden">
            <TabsTrigger
              value="overview"
              className="flex-1 px-4 py-2 flex items-center justify-center gap-2"
            >
              <Users className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="live"
              className="flex-1 px-4 py-2 flex items-center justify-center gap-2"
            >
              <div className="relative">
                <Activity className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              Live View
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="flex-1 px-4 py-2 flex items-center justify-center gap-2"
            >
              <BarChart2 className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab
              records={filteredRecords}
              stats={stats}
              dateRange={dateRange}
              setDateRange={setDateRange}
              employeeFilter={employeeFilter}
              setEmployeeFilter={setEmployeeFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onEdit={setEditingRecord}
              onAddNote={setNoteRecord}
            />
          </TabsContent>

          <TabsContent value="live">
            <LiveTab records={records} />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab
              records={filteredRecords}
              dateRange={dateRange}
              setDateRange={setDateRange}
              onExport={handleExport}
            />
          </TabsContent>
        </Tabs>
      </div>

      <EditAttendanceModal
        record={editingRecord}
        open={Boolean(editingRecord)}
        onOpenChange={(open) => !open && setEditingRecord(null)}
        onSave={handleUpdateAttendance}
      />

      <AttendanceNotesModal
        record={noteRecord}
        open={Boolean(noteRecord)}
        onOpenChange={(open) => !open && setNoteRecord(null)}
        onSave={handleUpdateNote}
      />
    </main>
  );
}
