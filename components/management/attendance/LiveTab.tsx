import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
import { Button } from "@/components/ui/button";
import { format, parseISO, differenceInSeconds } from "date-fns";
import { User, Coffee, QrCode } from "lucide-react";
import { AttendanceLog } from "@/models/business/shift/Attendance";
import { useMyBusiness } from "@/features/business/useMyBusiness";
import ClockInQrDialog from "./ClockInQrDialog";

function getElapsed(fromIso: string): string {
  const diff = differenceInSeconds(new Date(), parseISO(fromIso));
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return `${h}h ${m}m ${s}s`;
}

interface LiveTabProps {
  businessId: string;
  records: AttendanceLog[];
  isLoading?: boolean;
}

const LiveTab = ({ businessId, records, isLoading }: LiveTabProps) => {
  const { t } = useTranslation("management");
  const [tick, setTick] = useState(0);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const { myBusinessFullDetails } = useMyBusiness(businessId);

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
          <h2 className="text-xl font-bold text-foreground">{t("attendance_live.heading")}</h2>
          <p className="text-muted-foreground text-sm">{t("attendance_live.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          {myBusinessFullDetails?.requireQrForAttendance && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => setQrDialogOpen(true)}
            >
              <QrCode className="w-3.5 h-3.5" />
              {t("attendance_live.qr_button")}
            </Button>
          )}
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted px-3 py-1.5 rounded-lg border border-border">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {t("attendance_live.live_active_count", { count: liveRecords.length })}
          </div>
        </div>
      </div>

      <ClockInQrDialog open={qrDialogOpen} onOpenChange={setQrDialogOpen} businessId={businessId} />

      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold text-muted-foreground">{t("attendance_live.col_employee")}</TableHead>
              <TableHead className="font-semibold text-muted-foreground">{t("attendance_live.col_clock_in")}</TableHead>
              <TableHead className="font-semibold text-muted-foreground">{t("attendance_live.col_duration")}</TableHead>
              <TableHead className="font-semibold text-muted-foreground">{t("attendance_live.col_status")}</TableHead>
              <TableHead className="font-semibold text-muted-foreground">{t("attendance_live.col_break")}</TableHead>
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
                  <TableRow key={record.id} className="hover:bg-muted/50 h-16">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-muted p-2 rounded-full">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-semibold text-foreground">{employeeName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium">
                      {format(parseISO(record.checkInTime), "HH:mm")}
                    </TableCell>
                    <TableCell className="font-bold text-foreground tabular-nums">
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
                        {onBreak ? t("attendance_live.status_on_break") : t("attendance_live.status_working")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {activeBreak ? (
                        <span className="flex items-center gap-1">
                          <Coffee className="h-3.5 w-3.5 text-purple-400" />
                          {activeBreak.type === "PAID" ? t("attendance_live.break_paid") : t("attendance_live.break_unpaid")} · {getElapsed(activeBreak.start)}
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
                <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <User className="h-8 w-8 text-muted-foreground/30" />
                    <p className="italic">{t("attendance_live.no_one_clocked_in")}</p>
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
