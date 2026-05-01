export type AttendanceStatus = 'PRESENT' | 'LATE' | 'NO_SHOW' | 'ON_BREAK';
export type AttendanceLifecycleStatus = 'ONGOING' | 'FINISHED' | 'VALIDATED';

export interface BreakEntry {
  start: string;
  end: string | null;
  type: 'PAID' | 'UNPAID';
}

export interface AttendanceLog {
  id: string;
  businessId: string;
  employmentId: string;
  shiftId: string | null;

  checkInTime: string;
  checkOutTime: string | null;

  breaks: BreakEntry[];

  status: AttendanceStatus;
  lifecycleStatus: AttendanceLifecycleStatus;

  notes: string | null;

  checkInLocation: { lat: number; lng: number } | null;
  checkOutLocation: { lat: number; lng: number } | null;
  isOutOfGeofence: boolean;

  workedMinutes: number | null;
  regularMinutes: number | null;
  overtimeMinutes: number | null;
  regularPay: number | null;
  overtimePay: number | null;
  totalPay: number | null;

  isValidated: boolean;
  validatedAt: string | null;
  validatedById: string | null;

  createdAt: string;
  updatedAt: string;

  employment?: {
    id: string;
    hourlyRate: number;
    professionalProfile: { firstName: string; lastName: string };
  };
  shift?: {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
  };
  validatedBy?: {
    id: string;
    professionalProfile: { firstName: string; lastName: string };
  };
}

export interface AttendancePage {
  data: AttendanceLog[];
  total: number;
  page: number;
  limit: number;
}

export interface AttendanceSummaryEntry {
  employmentId: string;
  employeeName: string;
  hourlyRate: number;
  totalWorkedMinutes: number;
  regularMinutes: number;
  overtimeMinutes: number;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  regularPay: number;
  overtimePay: number;
  totalPay: number;
  currency: string;
  attendanceCount: number;
  attendanceIds: string[];
}

export interface BusinessAttendanceFilters {
  startDate?: string;
  endDate?: string;
  employmentId?: string;
  lifecycleStatus?: AttendanceLifecycleStatus;
  status?: AttendanceStatus;
  page?: number;
  limit?: number;
}

export interface MyAttendanceFilters {
  startDate?: string;
  endDate?: string;
  lifecycleStatus?: AttendanceLifecycleStatus;
  page?: number;
  limit?: number;
}
