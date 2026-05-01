import React, { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, MapPin, Eye, CalendarOff } from "lucide-react";
import { format, parseISO } from "date-fns";
import { AttendanceLog } from "@/models/business/shift/Attendance";
import { ValidationModal } from "@/components/management/schedule/ValidationModal";
import AbsenceModal from "./AbsenceModal";

function minutesToLabel(minutes: number | null): string {
  if (minutes === null) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

const lifecycleBadge: Record<string, string> = {
  ONGOING: "bg-green-100 text-green-700",
  FINISHED: "bg-amber-100 text-amber-700",
  VALIDATED: "bg-blue-100 text-blue-700",
};

const lifecycleLabel: Record<string, string> = {
  ONGOING: "Active",
  FINISHED: "Pending",
  VALIDATED: "Validated",
};

const statusBadge: Record<string, string> = {
  PRESENT: "bg-green-100 text-green-700",
  LATE: "bg-amber-100 text-amber-700",
  NO_SHOW: "bg-red-100 text-red-700",
  ON_BREAK: "bg-purple-100 text-purple-700",
};

interface AttendanceTableProps {
  records: AttendanceLog[];
  isLoading?: boolean;
  businessId: string;
}

const AttendanceTable = ({ records, isLoading, businessId }: AttendanceTableProps) => {
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [absenceRecord, setAbsenceRecord] = useState<AttendanceLog | null>(null);

  const validating = validatingId ? records.find((r) => r.id === validatingId) : null;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="font-semibold text-slate-600">Employee</TableHead>
              <TableHead className="font-semibold text-slate-600">Date</TableHead>
              <TableHead className="font-semibold text-slate-600">Clock In</TableHead>
              <TableHead className="font-semibold text-slate-600">Clock Out</TableHead>
              <TableHead className="font-semibold text-slate-600">Status</TableHead>
              <TableHead className="font-semibold text-slate-600">Worked</TableHead>
              <TableHead className="font-semibold text-slate-600">OT</TableHead>
              <TableHead className="font-semibold text-slate-600">Pay Est.</TableHead>
              <TableHead className="font-semibold text-slate-600">Lifecycle</TableHead>
              <TableHead className="font-semibold text-slate-600 text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length > 0 ? (
              records.map((record) => {
                const employeeName = record.employment
                  ? `${record.employment.professionalProfile.firstName} ${record.employment.professionalProfile.lastName}`
                  : record.employmentId.slice(0, 8);
                const hourlyRate = record.employment?.hourlyRate ?? 0;
                const showPay = hourlyRate > 0;

                return (
                  <TableRow key={record.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-semibold">{employeeName}</span>
                        {record.isOutOfGeofence && (
                          <MapPin className="h-3.5 w-3.5 text-amber-500" aria-label="Clocked in outside geofence" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {format(parseISO(record.checkInTime), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium">
                      {format(parseISO(record.checkInTime), "HH:mm")}
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium">
                      {record.checkOutTime ? format(parseISO(record.checkOutTime), "HH:mm") : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${statusBadge[record.status] ?? ""} border-none font-medium px-2.5 py-0.5 rounded-full`}
                      >
                        {record.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">
                      {minutesToLabel(record.workedMinutes)}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {minutesToLabel(record.overtimeMinutes)}
                    </TableCell>
                    <TableCell className="text-slate-700 font-medium text-sm">
                      {showPay && record.totalPay !== null
                        ? `$${Number(record.totalPay).toFixed(2)}`
                        : record.lifecycleStatus === "ONGOING"
                        ? "—"
                        : hourlyRate === 0
                        ? <span className="text-xs text-slate-400">Rate not set</span>
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${lifecycleBadge[record.lifecycleStatus] ?? ""} border-none font-medium px-2.5 py-0.5 rounded-full`}
                      >
                        {lifecycleLabel[record.lifecycleStatus] ?? record.lifecycleStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex justify-end gap-1">
                        {record.lifecycleStatus === "FINISHED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-indigo-600 hover:bg-indigo-50 gap-1"
                            onClick={() => setValidatingId(record.id)}
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Validate
                          </Button>
                        )}
                        {record.status === "NO_SHOW" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-red-600 hover:bg-red-50 gap-1"
                            onClick={() => setAbsenceRecord(record)}
                          >
                            <CalendarOff className="h-3.5 w-3.5" />
                            Absence
                          </Button>
                        )}
                        {record.lifecycleStatus === "VALIDATED" && (
                          <span className="flex items-center gap-1 text-xs text-blue-500 px-2">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Validated
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="h-32 text-center text-slate-400 italic">
                  No attendance records found for the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {validating && (
        <ValidationModal
          open={!!validatingId}
          onOpenChange={(open) => !open && setValidatingId(null)}
          attendanceId={validating.id}
          initialCheckIn={validating.checkInTime}
          initialCheckOut={validating.checkOutTime ?? ""}
          onSuccess={() => setValidatingId(null)}
        />
      )}

      {absenceRecord && (
        <AbsenceModal
          open={!!absenceRecord}
          onOpenChange={(open) => !open && setAbsenceRecord(null)}
          businessId={businessId}
          prefill={{
            employmentId: absenceRecord.employmentId,
            date: format(parseISO(absenceRecord.checkInTime), "yyyy-MM-dd"),
            attendanceId: absenceRecord.id,
            shiftId: absenceRecord.shiftId ?? undefined,
            employeeName: absenceRecord.employment
              ? `${absenceRecord.employment.professionalProfile.firstName} ${absenceRecord.employment.professionalProfile.lastName}`
              : undefined,
          }}
        />
      )}
    </>
  );
};

export default AttendanceTable;
