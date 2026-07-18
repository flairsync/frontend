import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, AlertCircle, Zap, ShieldCheck } from "lucide-react";
import { AttendanceLog } from "@/models/business/shift/Attendance";
import { AbsenceRecord } from "@/models/business/shift/AbsenceRecord";

function minutesToHours(minutes: number | null): string {
  if (!minutes) return "0h";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

interface AttendanceStatsProps {
  records: AttendanceLog[];
  absences: AbsenceRecord[];
}

const AttendanceStats = ({ records, absences }: AttendanceStatsProps) => {
  const { t } = useTranslation("management");
  const ongoing = records.filter((r) => r.lifecycleStatus === "ONGOING").length;
  const pending = records.filter((r) => r.lifecycleStatus === "FINISHED").length;
  const validated = records.filter((r) => r.lifecycleStatus === "VALIDATED").length;
  // Attendance.status is never set to NO_SHOW by the backend — the real signal lives
  // on the absence records (auto-created for no-shows, also covers manual absences).
  const noShows = absences.length;
  const lates = records.filter((r) => r.status === "LATE").length;

  const totalWorkedMinutes = records.reduce((acc, r) => acc + (r.workedMinutes ?? 0), 0);
  const totalOtMinutes = records.reduce((acc, r) => acc + (r.overtimeMinutes ?? 0), 0);

  const statItems = [
    {
      title: t("attendance_stats.active_now.title"),
      value: ongoing,
      description: t("attendance_stats.active_now.description"),
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: t("attendance_stats.worked_hours.title"),
      value: minutesToHours(totalWorkedMinutes),
      description: t("attendance_stats.worked_hours.description"),
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: t("attendance_stats.pending_validation.title"),
      value: pending,
      description: t("attendance_stats.pending_validation.description"),
      icon: Zap,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: t("attendance_stats.validated.title"),
      value: validated,
      description: t("attendance_stats.validated.description"),
      icon: ShieldCheck,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: t("attendance_stats.absences_late.title"),
      value: `${noShows} / ${lates}`,
      description: t("attendance_stats.absences_late.description"),
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statItems.map((item) => (
        <Card key={item.title} className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {item.title}
            </CardTitle>
            <div className={`${item.bgColor} p-2 rounded-lg`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{item.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AttendanceStats;
