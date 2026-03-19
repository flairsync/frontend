export enum ShiftStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
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
  isVirtual?: boolean;
  staffResponse?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  estimatedCost?: number;
  currency?: string;
  requiredRoleId?: string;
}
