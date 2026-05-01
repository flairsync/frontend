import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, AlertCircle, Zap, ShieldCheck } from "lucide-react";
import { AttendanceLog } from "@/models/business/shift/Attendance";

function minutesToHours(minutes: number | null): string {
  if (!minutes) return "0h";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

interface AttendanceStatsProps {
  records: AttendanceLog[];
}

const AttendanceStats = ({ records }: AttendanceStatsProps) => {
  const ongoing = records.filter((r) => r.lifecycleStatus === "ONGOING").length;
  const pending = records.filter((r) => r.lifecycleStatus === "FINISHED").length;
  const validated = records.filter((r) => r.lifecycleStatus === "VALIDATED").length;
  const noShows = records.filter((r) => r.status === "NO_SHOW").length;
  const lates = records.filter((r) => r.status === "LATE").length;

  const totalWorkedMinutes = records.reduce((acc, r) => acc + (r.workedMinutes ?? 0), 0);
  const totalOtMinutes = records.reduce((acc, r) => acc + (r.overtimeMinutes ?? 0), 0);

  const statItems = [
    {
      title: "Active Now",
      value: ongoing,
      description: "Currently clocked in",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Worked Hours",
      value: minutesToHours(totalWorkedMinutes),
      description: "Across all records",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pending Validation",
      value: pending,
      description: "Awaiting manager review",
      icon: Zap,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Validated",
      value: validated,
      description: "Locked records",
      icon: ShieldCheck,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Absences / Late",
      value: `${noShows} / ${lates}`,
      description: "No shows · Late arrivals",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statItems.map((item) => (
        <Card key={item.title} className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              {item.title}
            </CardTitle>
            <div className={`${item.bgColor} p-2 rounded-lg`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{item.value}</div>
            <p className="text-xs text-slate-400 mt-1">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AttendanceStats;
