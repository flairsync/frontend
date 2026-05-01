import React from "react";
import { DateRange } from "react-day-picker";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";
import { useAttendanceSummary } from "@/features/shifts/useAttendance";
import { getCurrencySymbol } from "@/utils/currency";

function fmtHours(h: number) {
  return `${h.toFixed(1)}h`;
}

interface ReportsTabProps {
  businessId: string;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
}

const ReportsTab = ({ businessId, dateRange, setDateRange }: ReportsTabProps) => {
  const startDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
  const endDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;

  const { data: summary = [], isLoading } = useAttendanceSummary(businessId, startDate, endDate);

  const totals = summary.reduce(
    (acc, entry) => ({
      totalHours: acc.totalHours + entry.totalHours,
      regularHours: acc.regularHours + entry.regularHours,
      overtimeHours: acc.overtimeHours + entry.overtimeHours,
      totalPay: acc.totalPay + entry.totalPay,
    }),
    { totalHours: 0, regularHours: 0, overtimeHours: 0, totalPay: 0 }
  );

  const currency = summary[0]?.currency ?? "USD";

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Labor Summary</h2>
          <p className="text-slate-500 text-sm">OT + pay breakdown — validated records only.</p>
        </div>
        <DatePickerWithRange date={dateRange} setDate={setDateRange} className="w-[280px]" />
      </div>

      {!startDate || !endDate ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
          <Info className="h-4 w-4 text-amber-500 shrink-0" />
          Select a date range to load the labor summary.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Hours", value: fmtHours(totals.totalHours), color: "text-blue-600" },
              { label: "Regular Hours", value: fmtHours(totals.regularHours), color: "text-green-600" },
              { label: "Overtime Hours", value: fmtHours(totals.overtimeHours), color: "text-amber-600" },
              { label: "Total Pay", value: `${getCurrencySymbol(currency)}${totals.totalPay.toFixed(2)}`, color: "text-indigo-600" },
            ].map((card) => (
              <Card key={card.label} className="border-none shadow-sm">
                <CardContent className="pt-5">
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">{card.label}</p>
                  <p className={`text-2xl font-extrabold ${card.color}`}>{card.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {summary.length > 0 && summary.some((e) => e.attendanceCount < (e.attendanceIds?.length ?? 0)) && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
              <Info className="h-4 w-4 shrink-0" />
              Some records are still pending validation and are not included in this summary.
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600">Employee</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-center">Records</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-center">Total Hours</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-center">Regular</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-center text-amber-600">Overtime</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-right pr-6">Total Pay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : summary.length > 0 ? (
                  summary.map((entry) => (
                    <TableRow key={entry.employmentId} className="hover:bg-slate-50/50">
                      <TableCell className="font-semibold text-slate-900">{entry.employeeName}</TableCell>
                      <TableCell className="text-center text-slate-500">{entry.attendanceCount}</TableCell>
                      <TableCell className="text-center font-bold text-slate-900">{fmtHours(entry.totalHours)}</TableCell>
                      <TableCell className="text-center text-slate-600">{fmtHours(entry.regularHours)}</TableCell>
                      <TableCell className="text-center">
                        <span className={entry.overtimeHours > 0 ? "text-amber-600 font-bold" : "text-slate-300"}>
                          {entry.overtimeHours > 0 ? `+${fmtHours(entry.overtimeHours)}` : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6 font-bold text-indigo-700">
                        {entry.hourlyRate === 0
                          ? <span className="text-xs font-normal text-slate-400">Rate not set</span>
                          : `${getCurrencySymbol(entry.currency)}${entry.totalPay.toFixed(2)}`}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-400 italic">
                      No validated records for this period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsTab;
