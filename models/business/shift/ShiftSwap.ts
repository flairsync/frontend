import { Shift } from "./Shift";
import { BusinessEmployee } from "../BusinessEmployee";

export enum ShiftSwapStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED',
}

export interface ShiftSwap {
  id: string;
  businessId: string;
  shiftId: string;
  fromEmploymentId: string;
  toEmploymentId: string;
  status: ShiftSwapStatus;
  
  // Relations (optional as they might not always be joined)
  shift?: Shift;
  fromEmployment?: BusinessEmployee;
  toEmployment?: BusinessEmployee;
}
