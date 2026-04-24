import React, { useMemo } from "react";
import { 
  AttendanceRecord, 
  aggregateAttendanceByEmployee, 
  formatDuration 
} from "@/lib/attendanceUtils";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";
import { Card, CardContent } from "@/components/ui/card";

interface ReportsTabProps {
  records: AttendanceRecord[];
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  onExport: () => void;
}

const ReportsTab = ({ records, dateRange, setDateRange, onExport }: ReportsTabProps) => {
  const employeeStats = useMemo(() => {
    return aggregateAttendanceByEmployee(records);
  }, [records]);

  const totals = useMemo(() => {
    return employeeStats.reduce((acc, curr) => ({
      hours: acc.hours + curr.totalHours,
      shifts: acc.shifts + curr.totalShifts,
      absences: acc.absences + curr.absences,
      lates: acc.lates + curr.lates
    }), { hours: 0, shifts: 0, absences: 0, lates: 0 });
  }, [employeeStats]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 md:px-6">
      {/* Header with Filters and Export */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-50">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800">Attendance Report</h2>
          <p className="text-slate-500 text-sm">Aggregated performance data by staff member.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} className="w-[280px]" />
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2"
            onClick={onExport}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Period Hours", value: totals.hours.toFixed(1) + "h", icon: FileText, color: "text-blue-600" },
          { label: "Total Shifts", value: totals.shifts, icon: TrendingUp, color: "text-green-600" },
          { label: "Total Absences", value: totals.absences, icon: TrendingDown, color: "text-red-600" },
          { label: "Total Late Arrivals", value: totals.lates, icon: TrendingUp, color: "text-amber-600" },
        ].map((card, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1 uppercase tracking-wider font-semibold">
                <card.icon className={`h-4 w-4 ${card.color}`} />
                {card.label}
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Aggregated Table */}
      <div className="bg-white rounded-xl shadow-sm border-none overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">Employee</TableHead>
              <TableHead className="font-semibold text-slate-600 text-center">Total Shifts</TableHead>
              <TableHead className="font-semibold text-slate-600 text-center">Total Hours</TableHead>
              <TableHead className="font-semibold text-slate-600 text-center text-red-500">Absences</TableHead>
              <TableHead className="font-semibold text-slate-600 text-center text-amber-500">Lates</TableHead>
              <TableHead className="font-semibold text-slate-600 text-center">Overtime</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employeeStats.length > 0 ? (
              employeeStats.map((stat) => (
                <TableRow key={stat.employee.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-slate-900 font-semibold">{stat.employee.name}</span>
                      <span className="text-xs text-slate-400">{stat.employee.role || "Staff"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium text-slate-600">{stat.totalShifts}</TableCell>
                  <TableCell className="text-center font-bold text-slate-900">{stat.totalHours}h</TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 rounded-full ${stat.absences > 0 ? 'bg-red-50 text-red-600 font-bold' : 'text-slate-300'}`}>
                      {stat.absences}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 rounded-full ${stat.lates > 0 ? 'bg-amber-50 text-amber-600 font-bold' : 'text-slate-300'}`}>
                      {stat.lates}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-medium text-slate-600">
                    {stat.overtimeHours > 0 ? `+${stat.overtimeHours}h` : "--"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400 italic">
                  No data available for the selected range.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReportsTab;
