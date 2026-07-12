export type TipPoolStrategy = 'EQUAL_SPLIT' | 'HOURS_WEIGHTED';
export type TipPoolStatus = 'DRAFT' | 'FINALIZED';

export const TIP_POOL_STRATEGY_LABELS: Record<TipPoolStrategy, string> = {
  EQUAL_SPLIT: 'Equal Split',
  HOURS_WEIGHTED: 'Hours Worked',
};

export interface TipDistributionEntry {
  id: string;
  businessId: string;
  employmentId: string;
  periodStart: string; // 'YYYY-MM-DD'
  periodEnd: string; // 'YYYY-MM-DD'
  strategy: TipPoolStrategy;
  hoursWorked: number;
  totalPoolAmount: number;
  shareAmount: number;
  currency: string;
  status: TipPoolStatus;
  createdAt: string;
  updatedAt: string;

  // relation (when loaded)
  employment?: {
    id: string;
    professionalProfile: { firstName: string; lastName: string };
  };
}

export interface TipPoolPreviewEntry {
  employmentId: string;
  employeeName: string;
  hoursWorked: number;
  shareAmount: number;
}

export interface TipPoolPreview {
  businessId: string;
  periodStart: string;
  periodEnd: string;
  strategy: TipPoolStrategy;
  currency: string;
  totalPoolAmount: number;
  totalHours: number;
  entries: TipPoolPreviewEntry[];
}

export interface GenerateTipDistributionDto {
  businessId: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
}

export interface FinalizeTipDistributionDto {
  businessId: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
}
