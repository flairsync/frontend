import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  PayrollEntry,
  PayrollPreview,
  GeneratePayrollDto,
  FinalizePayrollDto,
  PayrollSummaryEntry,
} from "@/models/business/shift/PayrollEntry";
import {
  fetchPayrollPreviewApiCall,
  generatePayrollApiCall,
  finalizePayrollApiCall,
  fetchPayrollEntriesApiCall,
  getPayrollExportUrl,
} from "./service";

export const usePayrollPreview = (
  businessId: string,
  startDate: string,
  endDate: string,
  employmentId?: string,
) => {
  const { data: preview, isFetching: fetchingPreview } = useQuery<PayrollPreview | null>({
    queryKey: ["payroll_preview", businessId, startDate, endDate, employmentId],
    queryFn: async () => {
      try {
        const resp = await fetchPayrollPreviewApiCall(businessId, startDate, endDate, employmentId);
        const resData = resp.data;
        return resData?.data !== undefined ? resData.data : resData;
      } catch {
        return null;
      }
    },
    enabled: !!businessId && !!startDate && !!endDate,
  });

  return { preview, fetchingPreview };
};

export const usePayrollEntries = (
  businessId: string,
  startDate?: string,
  endDate?: string,
  status?: 'DRAFT' | 'FINALIZED',
) => {
  const { data: entries = [], isFetching: fetchingEntries } = useQuery<PayrollEntry[]>({
    queryKey: ["payroll_entries", businessId, startDate, endDate, status],
    queryFn: async () => {
      try {
        const resp = await fetchPayrollEntriesApiCall(businessId, startDate, endDate, undefined, status);
        const resData = resp.data;
        const actualData = resData?.data !== undefined ? resData.data : resData;
        return Array.isArray(actualData) ? actualData : [];
      } catch {
        return [];
      }
    },
    enabled: !!businessId,
  });

  return { entries, fetchingEntries };
};

export const usePayroll = (businessId: string) => {
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: (data: GeneratePayrollDto) => generatePayrollApiCall(data),
    onSuccess: () => {
      toast.success("Payroll generated successfully");
      queryClient.invalidateQueries({ queryKey: ["payroll_entries", businessId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to generate payroll");
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: (data: FinalizePayrollDto) => finalizePayrollApiCall(data),
    onSuccess: () => {
      toast.success("Payroll finalized");
      queryClient.invalidateQueries({ queryKey: ["payroll_entries", businessId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to finalize payroll");
    },
  });

  const exportPayroll = (startDate: string, endDate: string, format: 'pdf' | 'csv' = 'pdf') => {
    const url = getPayrollExportUrl(businessId, startDate, endDate, format);
    const a = document.createElement('a');
    a.href = url;
    a.click();
  };

  return {
    generatePayroll: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    finalizePayroll: finalizeMutation.mutate,
    isFinalizing: finalizeMutation.isPending,
    exportPayroll,
  };
};

export function minutesToHoursLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
