export enum TimeOffStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface TimeOffRequest {
  id: string;
  businessId: string;
  employmentId: string;
  startDate: string; // ISO DateTime or YYYY-MM-DD
  endDate: string; // ISO DateTime or YYYY-MM-DD
  status: TimeOffStatus;
  reason: string;
  reviewerId?: string;
  documentUrl?: string;
}
