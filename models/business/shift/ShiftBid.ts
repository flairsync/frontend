import { Shift } from "./Shift";

export enum ShiftBidStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface ShiftBid {
  id: string;
  status: ShiftBidStatus;
  createdAt: string;
  shiftId: string;
  employmentId: string;
  shift?: Shift;
  businessId?: string;
  employment?: {
    id: string;
    professionalProfile: {
      firstName: string;
      lastName: string;
      displayName?: string;
    };
  };
}
