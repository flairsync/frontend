export enum ShiftStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  VALIDATED = 'VALIDATED',
  CANCELLED = 'CANCELLED',
  SICK = 'SICK',
  NO_SHOW = 'NO_SHOW',
  OPEN = 'OPEN',
}

export interface Shift {
  id: string;
  businessId: string;
  employmentId: string | null; // Null if it's an OPEN shift
  startTime: string; // ISO DateTime
  endTime: string; // ISO DateTime
  status: ShiftStatus;
  notes: string;
  isPublished: boolean;
  staffResponse?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  estimatedCost?: number;
  unpaidBreakMinutes?: number;
  currency?: string;
  requiredRoleId?: string;
  attendanceId?: string;
}
