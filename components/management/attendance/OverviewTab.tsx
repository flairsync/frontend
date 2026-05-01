import React from "react";
import AttendanceStats from "./AttendanceStats";
import AttendanceFilters from "./AttendanceFilters";
import AttendanceTable from "./AttendanceTable";
import { DateRange } from "react-day-picker";
import { AttendanceLog, AttendanceLifecycleStatus, AttendanceStatus } from "@/models/business/shift/Attendance";

interface OverviewTabProps {
  businessId: string;
  records: AttendanceLog[];
  total: number;
  isLoading: boolean;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  employeeFilter: string;
  setEmployeeFilter: (val: string) => void;
  lifecycleFilter: AttendanceLifecycleStatus | "all";
  setLifecycleFilter: (val: AttendanceLifecycleStatus | "all") => void;
  statusFilter: AttendanceStatus | "all";
  setStatusFilter: (val: AttendanceStatus | "all") => void;
}

const OverviewTab = ({
  businessId,
  records,
  total,
  isLoading,
  dateRange,
  setDateRange,
  employeeFilter,
  setEmployeeFilter,
  lifecycleFilter,
  setLifecycleFilter,
  statusFilter,
  setStatusFilter,
}: OverviewTabProps) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-6">
      <AttendanceStats records={records} />

      <AttendanceFilters
        dateRange={dateRange}
        setDateRange={setDateRange}
        employeeFilter={employeeFilter}
        setEmployeeFilter={setEmployeeFilter}
        lifecycleFilter={lifecycleFilter}
        setLifecycleFilter={setLifecycleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Attendance Logs</h2>
          <span className="text-sm text-slate-400 font-medium bg-slate-100 px-3 py-1 rounded-full">
            {records.length} of {total} records
          </span>
        </div>
        <AttendanceTable
          records={records}
          isLoading={isLoading}
          businessId={businessId}
        />
      </div>
    </div>
  );
};

export default OverviewTab;
