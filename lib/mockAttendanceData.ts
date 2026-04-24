import { AttendanceRecord } from "./attendanceUtils";
import { addDays, setHours, setMinutes, formatISO, subDays } from "date-fns";

const now = new Date();
const today = setMinutes(setHours(now, 0), 0);

export const mockAttendanceData: AttendanceRecord[] = [
  {
    id: "1",
    employee: { id: "emp1", name: "John Doe", role: "Manager" },
    planned_start: formatISO(setHours(today, 9)),
    planned_end: formatISO(setHours(today, 17)),
    clock_in: formatISO(setMinutes(setHours(today, 8), 58)),
    clock_out: formatISO(setMinutes(setHours(today, 17), 5)),
    note: "Arrived early for setup",
  },
  {
    id: "2",
    employee: { id: "emp2", name: "Jane Smith", role: "Chef" },
    planned_start: formatISO(setHours(today, 10)),
    planned_end: formatISO(setHours(today, 18)),
    clock_in: formatISO(setMinutes(setHours(today, 10), 15)),
    clock_out: formatISO(setMinutes(setHours(today, 18), 0)),
    note: "Traffic jam on the bridge",
  },
  {
    id: "3",
    employee: { id: "emp3", name: "Alice Brown", role: "Server" },
    planned_start: formatISO(setHours(today, 11)),
    planned_end: formatISO(setHours(today, 16)),
    clock_in: formatISO(setMinutes(setHours(today, 11), 5)),
    clock_out: null, // No clock-out yet
  },
  {
    id: "4",
    employee: { id: "emp4", name: "Bob Wilson", role: "Bartender" },
    planned_start: formatISO(setHours(subDays(today, 1), 16)),
    planned_end: formatISO(setHours(subDays(today, 1), 22)),
    clock_in: null, // Absent
    clock_out: null,
    note: "Called sick",
  },
  {
    id: "5",
    employee: { id: "emp1", name: "John Doe", role: "Manager" },
    planned_start: formatISO(setHours(subDays(today, 1), 9)),
    planned_end: formatISO(setHours(subDays(today, 1), 17)),
    clock_in: formatISO(setHours(subDays(today, 1), 9)),
    clock_out: formatISO(setHours(subDays(today, 1), 17)),
  },
  {
    id: "6",
    employee: { id: "emp2", name: "Jane Smith", role: "Chef" },
    planned_start: formatISO(setHours(subDays(today, 1), 10)),
    planned_end: formatISO(setHours(subDays(today, 1), 18)),
    clock_in: formatISO(setMinutes(setHours(subDays(today, 1), 10), 25)), // Late
    clock_out: formatISO(setMinutes(setHours(subDays(today, 1), 18), 30)), // Overtime
  },
];
