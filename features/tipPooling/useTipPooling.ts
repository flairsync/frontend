import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  TipDistributionEntry,
  TipPoolPreview,
  GenerateTipDistributionDto,
  FinalizeTipDistributionDto,
  TipPoolStatus,
} from "@/models/business/tipPooling/TipDistribution";
import {
  fetchTipPoolPreviewApiCall,
  generateTipDistributionApiCall,
  finalizeTipDistributionApiCall,
  fetchTipDistributionsApiCall,
} from "./service";

export const useTipPoolPreview = (
  businessId: string,
  startDate: string,
  endDate: string,
) => {
  const { data: preview, isFetching: fetchingPreview } = useQuery<TipPoolPreview | null>({
    queryKey: ["tip_pool_preview", businessId, startDate, endDate],
    queryFn: async () => {
      try {
        return await fetchTipPoolPreviewApiCall(businessId, startDate, endDate);
      } catch {
        return null;
      }
    },
    enabled: !!businessId && !!startDate && !!endDate,
  });

  return { preview, fetchingPreview };
};

export const useTipDistributions = (
  businessId: string,
  startDate?: string,
  endDate?: string,
  status?: TipPoolStatus,
) => {
  const { data: entries = [], isFetching: fetchingEntries } = useQuery<TipDistributionEntry[]>({
    queryKey: ["tip_distribution_entries", businessId, startDate, endDate, status],
    queryFn: async () => {
      try {
        const data = await fetchTipDistributionsApiCall(businessId, startDate, endDate, status);
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
    enabled: !!businessId,
  });

  return { entries, fetchingEntries };
};

export const useTipPooling = (businessId: string) => {
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: (data: GenerateTipDistributionDto) => generateTipDistributionApiCall(data),
    onSuccess: () => {
      toast.success("Tip distribution generated successfully");
      queryClient.invalidateQueries({ queryKey: ["tip_distribution_entries", businessId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to generate tip distribution");
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: (data: FinalizeTipDistributionDto) => finalizeTipDistributionApiCall(data),
    onSuccess: () => {
      toast.success("Tip distribution finalized");
      queryClient.invalidateQueries({ queryKey: ["tip_distribution_entries", businessId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to finalize tip distribution");
    },
  });

  return {
    generateTipDistribution: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    finalizeTipDistribution: finalizeMutation.mutate,
    isFinalizing: finalizeMutation.isPending,
  };
};
