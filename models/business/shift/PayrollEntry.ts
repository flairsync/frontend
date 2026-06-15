export type PayrollStatus = 'DRAFT' | 'FINALIZED';
export type PayPeriodType = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export const PAY_PERIOD_TYPE_LABELS: Record<PayPeriodType, string> = {
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Biweekly',
  MONTHLY: 'Monthly',
};

export interface PayrollEntry {
  id: string;
  businessId: string;
  employmentId: string;
  periodStart: string; // 'YYYY-MM-DD'
  periodEnd: string; // 'YYYY-MM-DD'
  regularMinutes: number;
  overtimeMinutes: number;
  totalWorkedMinutes: number;
  hourlyRateSnapshot: number;
  overtimeMultiplierSnapshot: number;
  regularPay: number;
  overtimePay: number;
  totalPay: number;
  currency: string;
  attendanceCount: number;
  attendanceIds: string[];
  status: PayrollStatus;
  createdAt: string;
  updatedAt: string;

  // relation (when loaded)
  employment?: {
    id: string;
    professionalProfile: { firstName: string; lastName: string };
  };
}

export interface PayrollSummaryEntry {
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

export interface PayrollPreview {
  businessId: string;
  periodStart: string;
  periodEnd: string;
  payPeriodType: PayPeriodType;
  currency: string;
  entries: PayrollSummaryEntry[];
  totals: {
    totalWorkedHours: number;
    totalOvertimeHours: number;
    totalRegularPay: number;
    totalOvertimePay: number;
    totalPay: number;
  };
}

export interface GeneratePayrollDto {
  businessId: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
  employmentId?: string;
}

export interface FinalizePayrollDto {
  businessId: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
}
