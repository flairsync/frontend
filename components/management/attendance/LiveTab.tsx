import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, differenceInSeconds } from "date-fns";
import { User, Coffee } from "lucide-react";
import { AttendanceLog } from "@/models/business/shift/Attendance";

function getElapsed(fromIso: string): string {
  const diff = differenceInSeconds(new Date(), parseISO(fromIso));
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return `${h}h ${m}m ${s}s`;
}

interface LiveTabProps {
  records: AttendanceLog[];
  isLoading?: boolean;
}

const LiveTab = ({ records, isLoading }: LiveTabProps) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const liveRecords = useMemo(
    () =>
      records
        .filter((r) => r.lifecycleStatus === "ONGOING")
        .sort((a, b) => parseISO(a.checkInTime).getTime() - parseISO(b.checkInTime).getTime()),
    [records]
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Who's Working Now</h2>
          <p className="text-slate-500 text-sm">Real-time status of clocked-in employees.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          LIVE · {liveRecords.length} active
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">Employee</TableHead>
              <TableHead className="font-semibold text-slate-600">Clock In</TableHead>
              <TableHead className="font-semibold text-slate-600">Duration</TableHead>
              <TableHead className="font-semibold text-slate-600">Status</TableHead>
              <TableHead className="font-semibold text-slate-600">Break</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell>
                </TableRow>
              ))
            ) : liveRecords.length > 0 ? (
              liveRecords.map((record) => {
                const onBreak = record.status === "ON_BREAK";
                const activeBreak = onBreak
                  ? record.breaks.find((b) => b.end === null)
                  : null;
                const employeeName = record.employment
                  ? `${record.employment.professionalProfile.firstName} ${record.employment.professionalProfile.lastName}`
                  : record.employmentId.slice(0, 8);

                return (
                  <TableRow key={record.id} className="hover:bg-slate-50/50 h-16">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-full">
                          <User className="h-4 w-4 text-slate-500" />
                        </div>
                        <span className="font-semibold text-slate-900">{employeeName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium">
                      {format(parseISO(record.checkInTime), "HH:mm")}
                    </TableCell>
                    <TableCell className="font-bold text-slate-700 tabular-nums">
                      {getElapsed(record.checkInTime)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          onBreak
                            ? "bg-purple-100 text-purple-700 border-none"
                            : "bg-green-100 text-green-700 border-none"
                        }
                      >
                        {onBreak ? "On Break" : "Working"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {activeBreak ? (
                        <span className="flex items-center gap-1">
                          <Coffee className="h-3.5 w-3.5 text-purple-400" />
                          {activeBreak.type === "PAID" ? "Paid" : "Unpaid"} · {getElapsed(activeBreak.start)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <User className="h-8 w-8 text-slate-200" />
                    <p className="italic">No employees currently clocked in.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LiveTab;
