import flairapi from "@/lib/flairapi";
import { unwrap } from "../shared/api-response";
import { GeneratePayrollDto, FinalizePayrollDto } from "@/models/business/shift/PayrollEntry";

const baseUrl = `${'https://api.flairsync.com/api/v1'}/payroll`;

export const fetchPayrollPreviewApiCall = async (
  businessId: string,
  startDate: string,
  endDate: string,
  employmentId?: string,
) => {
  const params = new URLSearchParams({ businessId, startDate, endDate });
  if (employmentId) params.append('employmentId', employmentId);
  return unwrap(await flairapi.get(`${baseUrl}/preview?${params.toString()}`));
};

export const generatePayrollApiCall = (data: GeneratePayrollDto) => {
  return flairapi.post(`${baseUrl}/generate`, data);
};

export const finalizePayrollApiCall = (data: FinalizePayrollDto) => {
  return flairapi.patch(`${baseUrl}/finalize`, data);
};

export const fetchPayrollEntriesApiCall = async (
  businessId: string,
  startDate?: string,
  endDate?: string,
  employmentId?: string,
  status?: 'DRAFT' | 'FINALIZED',
) => {
  const params = new URLSearchParams({ businessId });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (employmentId) params.append('employmentId', employmentId);
  if (status) params.append('status', status);
  return unwrap(await flairapi.get(`${baseUrl}?${params.toString()}`));
};

export const getPayrollExportUrl = (
  businessId: string,
  startDate: string,
  endDate: string,
  format: 'pdf' | 'csv' = 'pdf',
) => {
  const params = new URLSearchParams({ businessId, startDate, endDate, format });
  return `${baseUrl}/export?${params.toString()}`;
};
