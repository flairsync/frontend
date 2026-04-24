import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { extractErrorMessage } from "@/utils/error-utils";
import {
  fetchShiftSwapsApiCall,
  requestShiftSwapApiCall,
  updateShiftSwapStatusApiCall
} from "./service";
import { ShiftSwap } from "@/models/business/shift/ShiftSwap";

export const useShiftSwaps = (businessId: string, employmentId?: string) => {
  const queryClient = useQueryClient();

  const { data: swaps, isFetching: fetchingSwaps } = useQuery<ShiftSwap[]>({
    queryKey: ["shift_swaps", businessId, employmentId],
    queryFn: async () => {
      try {
        const resp = await fetchShiftSwapsApiCall(businessId, employmentId);
        const resData = resp.data;
        const actualData = resData?.data !== undefined ? resData.data : resData;
        return Array.isArray(actualData) ? actualData : [];
      } catch (error) {
        console.warn("Failed to fetch shift swaps:", error);
        return [];
      }
    },
    enabled: !!businessId,
  });

  const requestSwapMutation = useMutation({
    mutationFn: (data: Omit<ShiftSwap, "id" | "businessId" | "status">) =>
      requestShiftSwapApiCall({ ...data, businessId }),
    onSuccess: () => {
      toast.success("Shift swap requested successfully");
      queryClient.invalidateQueries({ queryKey: ["shift_swaps", businessId] });
      queryClient.invalidateQueries({ queryKey: ["shifts", businessId] });
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to request shift swap"));
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ swapId, status }: { swapId: string; status: string }) =>
      updateShiftSwapStatusApiCall(swapId, { status }),
    onSuccess: () => {
      toast.success("Shift swap status updated");
      queryClient.invalidateQueries({ queryKey: ["shift_swaps", businessId] });
      queryClient.invalidateQueries({ queryKey: ["shifts", businessId] });
    },
    onError: (error: any) => {
      const msg = extractErrorMessage(error, "Failed to update shift swap status");
      const respData = error.response?.data;
      toast.error(msg, {
        description: respData?.statusCode === 400 ? 'Smart Guard Validation Failed' : undefined,
        duration: 6000,
      });
    }
  });

  return {
    swaps,
    fetchingSwaps,
    requestSwap: requestSwapMutation.mutate,
    isRequesting: requestSwapMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
};
