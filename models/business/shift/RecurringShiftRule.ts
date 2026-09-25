export interface RecurringShiftRule {
  id: string;
  businessId: string;
  /**
   * Who the rule schedules. Both may be set at once, and the two behave differently:
   * employmentIds is a fixed list, while teamId is re-read from the team's membership on
   * every generation pass — so someone joining the team later gets scheduled automatically.
   */
  employmentIds: string[];
  teamId: string | null;
  daysOfWeek: number[]; // 0=Sunday, 1=Monday...
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  startDate: string; // "YYYY-MM-DD"
  endDate: string | null; // "YYYY-MM-DD" or null
  isActive: boolean;
  interval: number;
  exceptionDates: string[]; // "YYYY-MM-DD" dates to skip for this recurrence
}
