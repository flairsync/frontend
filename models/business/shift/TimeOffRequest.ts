export enum TimeOffStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export type LeaveType =
  | 'VACATION'
  | 'SICK_LEAVE'
  | 'PERSONAL'
  | 'EMERGENCY'
  | 'UNPAID_LEAVE';

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  VACATION: 'Vacation',
  SICK_LEAVE: 'Sick Leave',
  PERSONAL: 'Personal Day',
  EMERGENCY: 'Emergency',
  UNPAID_LEAVE: 'Unpaid Leave',
};

export interface TimeOffRequest {
  id: string;
  businessId: string;
  employmentId: string;
  startDate: string; // ISO DateTime or YYYY-MM-DD
  endDate: string; // ISO DateTime or YYYY-MM-DD
  leaveType: LeaveType;
  status: TimeOffStatus;
  reason: string | null;
  reviewerId: string | null;
  documentUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
