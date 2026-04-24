import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, MessageSquare, MoreHorizontal } from "lucide-react";
import { format, parseISO } from "date-fns";
import { 
  AttendanceRecord, 
  computeAttendanceStatus, 
  computeWorkedHours, 
  computeDifference 
} from "@/lib/attendanceUtils";

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onEdit: (record: AttendanceRecord) => void;
  onAddNote: (record: AttendanceRecord) => void;
}

const statusConfig = {
  Present: { color: "bg-green-100 text-green-700 hover:bg-green-100", label: "Present" },
  Late: { color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100", label: "Late" },
  Absent: { color: "bg-red-100 text-red-700 hover:bg-red-100", label: "Absent" },
  "No Clock-out": { color: "bg-orange-100 text-orange-700 hover:bg-orange-100", label: "Missing Out" },
};

const AttendanceTable = ({ records, onEdit, onAddNote }: AttendanceTableProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border-none overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent border-slate-100">
            <TableHead className="font-semibold text-slate-600">Employee</TableHead>
            <TableHead className="font-semibold text-slate-600">Planned Shift</TableHead>
            <TableHead className="font-semibold text-slate-600">Actual Time</TableHead>
            <TableHead className="font-semibold text-slate-600 text-center">Hours</TableHead>
            <TableHead className="font-semibold text-slate-600">Status</TableHead>
            <TableHead className="font-semibold text-slate-600">Difference</TableHead>
            <TableHead className="font-semibold text-slate-600 text-right pr-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length > 0 ? (
            records.map((record) => {
              const status = computeAttendanceStatus(record);
              const workedHours = computeWorkedHours(record.clock_in, record.clock_out);
              const difference = computeDifference(record);
              const { color, label } = statusConfig[status];

              return (
                <TableRow key={record.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-slate-900 font-semibold">{record.employee.name}</span>
                      <span className="text-xs text-slate-400 font-normal">{record.employee.role || "Staff"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">
                    {format(parseISO(record.planned_start), "HH:mm")} - {format(parseISO(record.planned_end), "HH:mm")}
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">
                    {record.clock_in ? (
                      <span className="flex items-center gap-1.5">
                        {format(parseISO(record.clock_in), "HH:mm")}
                        <span className="text-slate-300">-</span>
                        {record.clock_out ? format(parseISO(record.clock_out), "HH:mm") : "--:--"}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">No activity</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center font-bold text-slate-700">
                    {workedHours > 0 ? `${workedHours.toFixed(1)}h` : "--"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`${color} border-none font-medium px-2.5 py-0.5 rounded-full`}>
                      {label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {status === "Present" && <span className="text-green-600 font-medium">{difference}</span>}
                    {status === "Late" && <span className="text-amber-600 font-medium">{difference}</span>}
                    {status === "Absent" && <span className="text-red-500 font-medium">Not attended</span>}
                    {status === "No Clock-out" && <span className="text-orange-500 font-medium">Still working?</span>}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        onClick={() => onEdit(record)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        onClick={() => onAddNote(record)}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {record.note && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full border border-white" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400"
                        disabled
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-slate-400 italic">
                No shifts found for the selected filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendanceTable;
