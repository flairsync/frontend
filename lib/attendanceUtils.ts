import { differenceInMinutes, format, isAfter, parseISO } from "date-fns";

export type AttendanceStatus = "Present" | "Late" | "Absent" | "No Clock-out";

export interface AttendanceRecord {
  id: string;
  employee: {
    id: string;
    name: string;
    role?: string;
  };
  planned_start: string; // ISO string
  planned_end: string;   // ISO string
  clock_in: string | null;
  clock_out: string | null;
  note?: string;
}

export const computeAttendanceStatus = (
  record: AttendanceRecord,
  gracePeriodMinutes: number = 10
): AttendanceStatus => {
  const { planned_start, clock_in, clock_out } = record;
  const now = new Date();
  const plannedStart = parseISO(planned_start);

  if (!clock_in) {
    if (isAfter(now, plannedStart)) {
      return "Absent";
    }
    // If it's in the future and no clock in, we might still call it "Absent" or just "-"
    // But requirement says: "No clock_in AND shift is in the past"
    return "Absent"; 
  }

  if (clock_in && !clock_out) {
    return "No Clock-out";
  }

  const clockIn = parseISO(clock_in);
  const diff = differenceInMinutes(clockIn, plannedStart);

  if (diff > gracePeriodMinutes) {
    return "Late";
  }

  return "Present";
};

export const computeWorkedHours = (clock_in: string | null, clock_out: string | null): number => {
  if (!clock_in || !clock_out) return 0;
  const start = parseISO(clock_in);
  const end = parseISO(clock_out);
  const diffInMinutes = differenceInMinutes(end, start);
  return Math.max(0, diffInMinutes / 60);
};

export const computeDifference = (record: AttendanceRecord) => {
  const { planned_start, planned_end, clock_in, clock_out } = record;
  if (!clock_in) return null;

  const plannedStart = parseISO(planned_start);
  const plannedEnd = parseISO(planned_end);
  const clockIn = parseISO(clock_in);
  
  const results = [];

  // Late Arrival
  const arrivalDiff = differenceInMinutes(clockIn, plannedStart);
  if (arrivalDiff > 0) {
    results.push(`Late by ${arrivalDiff} min`);
  }

  if (clock_out) {
    const clockOut = parseISO(clock_out);
    
    // Early Leave
    const leaveDiff = differenceInMinutes(plannedEnd, clockOut);
    if (leaveDiff > 0) {
      results.push(`Left early by ${leaveDiff} min`);
    }

    // Overtime
    const overtimeDiff = differenceInMinutes(clockOut, plannedEnd);
    if (overtimeDiff > 0) {
      results.push(`+${overtimeDiff} min overtime`);
    }
  }

  return results.length > 0 ? results.join(", ") : "On time";
};

export const computeStats = (records: AttendanceRecord[], gracePeriod: number) => {
  let totalShifts = records.length;
  let totalWorkedHours = 0;
  let absences = 0;
  let lates = 0;
  let totalOvertimeMinutes = 0;

  records.forEach((record) => {
    const status = computeAttendanceStatus(record, gracePeriod);
    if (status === "Absent") absences++;
    if (status === "Late") lates++;

    if (record.clock_in && record.clock_out) {
      totalWorkedHours += computeWorkedHours(record.clock_in, record.clock_out);
      
      const plannedEnd = parseISO(record.planned_end);
      const clockOut = parseISO(record.clock_out);
      const overtime = differenceInMinutes(clockOut, plannedEnd);
      if (overtime > 0) {
        totalOvertimeMinutes += overtime;
      }
    }
  });

  return {
    totalShifts,
    totalWorkedHours: parseFloat(totalWorkedHours.toFixed(2)),
    absences,
    lates,
    overtimeHours: parseFloat((totalOvertimeMinutes / 60).toFixed(2)),
  };
};

export const formatDuration = (hours: number): string => {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m}m`;
};

export const getLiveStatus = (record: AttendanceRecord): { label: string, color: string } => {
  if (!record.clock_in || record.clock_out) return { label: "Off", color: "text-slate-400" };
  
  const now = new Date();
  const plannedEnd = parseISO(record.planned_end);
  
  if (isAfter(now, plannedEnd)) {
    const overtime = differenceInMinutes(now, plannedEnd);
    if (overtime > 30) {
      return { label: "Overdue", color: "text-red-500" };
    }
    return { label: "Missing Out", color: "text-orange-500" };
  }
  
  return { label: "Working", color: "text-green-500" };
};

export const aggregateAttendanceByEmployee = (records: AttendanceRecord[], gracePeriod: number = 10) => {
  const groups: Record<string, {
    employee: { id: string; name: string; role?: string };
    totalShifts: number;
    totalHours: number;
    absences: number;
    lates: number;
    overtimeHours: number;
  }> = {};

  records.forEach(record => {
    const empId = record.employee.id;
    if (!groups[empId]) {
      groups[empId] = {
        employee: record.employee,
        totalShifts: 0,
        totalHours: 0,
        absences: 0,
        lates: 0,
        overtimeHours: 0
      };
    }

    const group = groups[empId];
    group.totalShifts++;
    
    const status = computeAttendanceStatus(record, gracePeriod);
    if (status === "Absent") group.absences++;
    if (status === "Late") group.lates++;
    
    if (record.clock_in && record.clock_out) {
      group.totalHours += computeWorkedHours(record.clock_in, record.clock_out);
      
      const plannedEnd = parseISO(record.planned_end);
      const clockOut = parseISO(record.clock_out);
      const overtime = differenceInMinutes(clockOut, plannedEnd);
      if (overtime > 0) {
        group.overtimeHours += overtime / 60;
      }
    }
  });

  return Object.values(groups).map(g => ({
    ...g,
    totalHours: parseFloat(g.totalHours.toFixed(2)),
    overtimeHours: parseFloat(g.overtimeHours.toFixed(2))
  }));
};
