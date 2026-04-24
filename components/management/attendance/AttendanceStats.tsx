import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, AlertCircle, Calendar, Zap } from "lucide-react";

interface StatsProps {
  stats: {
    totalShifts: number;
    totalWorkedHours: number;
    absences: number;
    lates: number;
    overtimeHours: number;
  };
}

const AttendanceStats = ({ stats }: StatsProps) => {
  const statItems = [
    {
      title: "Total Shifts",
      value: stats.totalShifts,
      description: "Scheduled shifts",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Worked Hours",
      value: `${stats.totalWorkedHours}h`,
      description: "Actual work time",
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Absences",
      value: stats.absences,
      description: "Missed shifts",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Late Arrivals",
      value: stats.lates,
      description: "Late clock-ins",
      icon: Zap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Overtime",
      value: `${stats.overtimeHours}h`,
      description: "Extra hours worked",
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statItems.map((item, index) => (
        <Card key={index} className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
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
