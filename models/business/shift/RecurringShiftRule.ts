export interface RecurringShiftRule {
  id: string;
  businessId: string;
  employmentId: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday...
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  startDate: string; // "YYYY-MM-DD"
  endDate: string | null; // "YYYY-MM-DD" or null
  isActive: boolean;
  interval: number;
  exceptionDates: string[]; // "YYYY-MM-DD" dates to skip for this recurrence
}
