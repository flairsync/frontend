import React from "react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Download } from "lucide-react";
import { DateRange } from "react-day-picker";

interface AttendanceFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  employeeFilter: string;
  setEmployeeFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  onExport?: () => void;
  showExportButton?: boolean;
}

const AttendanceFilters = ({
  dateRange,
  setDateRange,
  employeeFilter,
  setEmployeeFilter,
  statusFilter,
  setStatusFilter,
  onExport,
  showExportButton = true,
}: AttendanceFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-xl border-none shadow-sm">
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <DatePickerWithRange 
          date={dateRange}
          setDate={setDateRange}
          className="w-[280px]"
        />
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-slate-50 border-none h-10">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Present">Present</SelectItem>
            <SelectItem value="Late">Late</SelectItem>
            <SelectItem value="Absent">Absent</SelectItem>
            <SelectItem value="No Clock-out">Missing Clock-out</SelectItem>
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

        {(employeeFilter || statusFilter !== 'all') && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setEmployeeFilter("");
              setStatusFilter("all");
            }}
            className="text-slate-500 hover:text-slate-900"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {showExportButton && (
        <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
          <Button 
            variant="outline" 
            className="w-full md:w-auto flex items-center gap-2 border-slate-200 hover:bg-slate-50 hover:text-indigo-600 transition-all font-medium text-slate-700 h-10"
            onClick={onExport}
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      )}
    </div>
  );
};

export default AttendanceFilters;
