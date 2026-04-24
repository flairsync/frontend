import React, { useState, useEffect, useMemo } from "react";
import { 
  AttendanceRecord, 
  getLiveStatus, 
  formatDuration, 
  computeWorkedHours 
} from "@/lib/attendanceUtils";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, differenceInMinutes } from "date-fns";
import { Clock, User } from "lucide-react";

interface LiveTabProps {
  records: AttendanceRecord[];
}

const LiveTab = ({ records }: LiveTabProps) => {
  const [now, setNow] = useState(new Date());

  // Update "now" every 60 seconds to refresh durations
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const liveRecords = useMemo(() => {
    return records
      .filter((r) => r.clock_in && !r.clock_out)
      .sort((a, b) => {
        // Sort by longest duration (earliest clock-in first)
        return parseISO(a.clock_in!).getTime() - parseISO(b.clock_in!).getTime();
      });
  }, [records]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Who's Working Now</h2>
          <p className="text-slate-500 text-sm">Real-time status of clocked-in employees.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          LIVE · Last sync {format(now, "HH:mm")}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border-none overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">Employee</TableHead>
              <TableHead className="font-semibold text-slate-600">Clock-in Time</TableHead>
              <TableHead className="font-semibold text-slate-600">Current Duration</TableHead>
              <TableHead className="font-semibold text-slate-600">Planned End</TableHead>
              <TableHead className="font-semibold text-slate-600 text-right pr-6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {liveRecords.length > 0 ? (
              liveRecords.map((record) => {
                const liveStatus = getLiveStatus(record);
                const clockIn = parseISO(record.clock_in!);
                const durationMinutes = differenceInMinutes(now, clockIn);
                
                return (
                  <TableRow key={record.id} className="hover:bg-slate-50/50 transition-colors border-slate-50 h-16">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-full">
                          <User className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-900 font-semibold">{record.employee.name}</span>
                          <span className="text-xs text-slate-400">{record.employee.role || "Staff"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {format(clockIn, "HH:mm")}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-slate-700">
                      {formatDuration(durationMinutes / 60)}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {format(parseISO(record.planned_end), "HH:mm")}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge variant="outline" className={`${liveStatus.color} border-current font-bold uppercase tracking-tighter text-[10px] px-2 py-0.5`}>
                        {liveStatus.label}
                      </Badge>
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
