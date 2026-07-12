import flairapi from "@/lib/flairapi";
import { unwrap } from "../shared/api-response";
import { GenerateTipDistributionDto, FinalizeTipDistributionDto, TipPoolStatus } from "@/models/business/tipPooling/TipDistribution";

const baseUrl = `${'https://api.flairsync.com/api/v1'}/tip-pooling`;

export const fetchTipPoolPreviewApiCall = async (
  businessId: string,
  startDate: string,
  endDate: string,
) => {
  const params = new URLSearchParams({ businessId, startDate, endDate });
  return unwrap(await flairapi.get(`${baseUrl}/preview?${params.toString()}`));
};

export const generateTipDistributionApiCall = (data: GenerateTipDistributionDto) => {
  return flairapi.post(`${baseUrl}/generate`, data);
};

export const finalizeTipDistributionApiCall = (data: FinalizeTipDistributionDto) => {
  return flairapi.patch(`${baseUrl}/finalize`, data);
};

export const fetchTipDistributionsApiCall = async (
  businessId: string,
  startDate?: string,
  endDate?: string,
  status?: TipPoolStatus,
) => {
  const params = new URLSearchParams({ businessId });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (status) params.append('status', status);
  return unwrap(await flairapi.get(`${baseUrl}?${params.toString()}`));
};
