export type AbsenceType =
  | 'SICK_LEAVE'
  | 'UNAUTHORIZED'
  | 'PERSONAL_EMERGENCY'
  | 'APPROVED_LEAVE';

export const ABSENCE_TYPE_LABELS: Record<AbsenceType, string> = {
  SICK_LEAVE: 'Sick Leave',
  UNAUTHORIZED: 'Unauthorized',
  PERSONAL_EMERGENCY: 'Personal Emergency',
  APPROVED_LEAVE: 'Approved Leave',
};

export const ABSENCE_TYPE_BADGE_COLORS: Record<AbsenceType, string> = {
  SICK_LEAVE: 'bg-yellow-100 text-yellow-800',
  UNAUTHORIZED: 'bg-red-100 text-red-800',
  PERSONAL_EMERGENCY: 'bg-orange-100 text-orange-800',
  APPROVED_LEAVE: 'bg-green-100 text-green-800',
};

export interface AbsenceRecord {
  id: string;
  businessId: string;
  employmentId: string;
  attendanceId: string | null;
  shiftId: string | null;
  date: string; // 'YYYY-MM-DD'
  type: AbsenceType;
  notes: string | null;
  documentUrl: string | null;
  timeOffRequestId: string | null;
  recordedById: string | null;
  createdAt: string;
  updatedAt: string;

  // relations (when loaded)
  employment?: {
    id: string;
    professionalProfile: { firstName: string; lastName: string };
  };
  shift?: { id: string; startTime: string; endTime: string };
}

export interface CreateAbsenceRecordDto {
  businessId: string;
  employmentId: string;
  date: string; // 'YYYY-MM-DD'
  type: AbsenceType;
  attendanceId?: string;
  shiftId?: string;
  timeOffRequestId?: string;
  recordedById?: string;
  notes?: string;
  documentUrl?: string;
}

export interface UpdateAbsenceRecordDto {
  type?: AbsenceType;
  notes?: string;
  documentUrl?: string;
}
