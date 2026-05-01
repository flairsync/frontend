import React from "react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { AttendanceLifecycleStatus, AttendanceStatus } from "@/models/business/shift/Attendance";

interface AttendanceFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  employeeFilter: string;
  setEmployeeFilter: (val: string) => void;
  lifecycleFilter: AttendanceLifecycleStatus | "all";
  setLifecycleFilter: (val: AttendanceLifecycleStatus | "all") => void;
  statusFilter: AttendanceStatus | "all";
  setStatusFilter: (val: AttendanceStatus | "all") => void;
}

const AttendanceFilters = ({
  dateRange,
  setDateRange,
  employeeFilter,
  setEmployeeFilter,
  lifecycleFilter,
  setLifecycleFilter,
  statusFilter,
  setStatusFilter,
}: AttendanceFiltersProps) => {
  const isDirty = employeeFilter || lifecycleFilter !== "all" || statusFilter !== "all";

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-white p-4 rounded-xl border-none shadow-sm flex-wrap">
      <DatePickerWithRange date={dateRange} setDate={setDateRange} className="w-[280px]" />

      <Select value={lifecycleFilter} onValueChange={(v) => setLifecycleFilter(v as any)}>
        <SelectTrigger className="w-[180px] bg-slate-50 border-none h-10">
          <SelectValue placeholder="All Lifecycles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Lifecycles</SelectItem>
          <SelectItem value="ONGOING">Active</SelectItem>
          <SelectItem value="FINISHED">Pending Validation</SelectItem>
          <SelectItem value="VALIDATED">Validated</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
        <SelectTrigger className="w-[160px] bg-slate-50 border-none h-10">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="PRESENT">Present</SelectItem>
          <SelectItem value="LATE">Late</SelectItem>
          <SelectItem value="NO_SHOW">No Show</SelectItem>
          <SelectItem value="ON_BREAK">On Break</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search employee..."
          className="pl-9 bg-slate-50 border-none h-10"
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
        />
      </div>

      {isDirty && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setEmployeeFilter("");
            setLifecycleFilter("all");
            setStatusFilter("all");
          }}
          className="text-slate-500 hover:text-slate-900"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
};

export default AttendanceFilters;
