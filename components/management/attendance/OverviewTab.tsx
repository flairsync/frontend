import React from "react";
import AttendanceStats from "./AttendanceStats";
import AttendanceFilters from "./AttendanceFilters";
import AttendanceTable from "./AttendanceTable";
import { AttendanceRecord, AttendanceStatus } from "@/lib/attendanceUtils";
import { DateRange } from "react-day-picker";

interface OverviewTabProps {
  records: AttendanceRecord[];
  stats: any;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  employeeFilter: string;
  setEmployeeFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  onEdit: (record: AttendanceRecord) => void;
  onAddNote: (record: AttendanceRecord) => void;
}

const OverviewTab = ({
  records,
  stats,
  dateRange,
  setDateRange,
  employeeFilter,
  setEmployeeFilter,
  statusFilter,
  setStatusFilter,
  onEdit,
  onAddNote,
}: OverviewTabProps) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-6">
      <AttendanceStats stats={stats} />
      
      <AttendanceFilters 
        dateRange={dateRange}
        setDateRange={setDateRange}
        employeeFilter={employeeFilter}
        setEmployeeFilter={setEmployeeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        showExportButton={false}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Shift Logs</h2>
          <span className="text-sm text-slate-400 font-medium bg-slate-100 px-3 py-1 rounded-full">
            {records.length} records found
          </span>
        </div>
        <AttendanceTable 
          records={records}
          onEdit={onEdit}
          onAddNote={onAddNote}
        />
      </div>
    </div>
  );
};

export default OverviewTab;
