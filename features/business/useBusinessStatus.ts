import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BusinessStatusResponse, fetchMyBusinessStatusApiCall, updateMyBusinessStatusApiCall } from "./service";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export type BusinessStatusData = BusinessStatusResponse;

// Lightweight status read/write, gated on OPENING_HOURS permission rather than
// BUSINESS_SETTINGS — usable by staff, unlike the full my-business fetch which
// is restricted to the business owner.
export const useBusinessStatus = (businessId: string | null = null) => {
  const queryClient = useQueryClient();

  const { data: businessStatus, isLoading: fetchingBusinessStatus } = useQuery({
    queryKey: ["business_status", businessId],
    queryFn: async (): Promise<BusinessStatusData | undefined> => {
      if (!businessId) return undefined;
      return fetchMyBusinessStatusApiCall(businessId);
    },
    enabled: businessId != null,
  });

  const { mutate: updateBusinessStatus, isPending: updatingBusinessStatus } = useMutation({
    mutationKey: ["update_business_status", businessId],
    mutationFn: async (status: string) => {
      if (!businessId) return;
      return updateMyBusinessStatusApiCall(businessId, status);
    },
    onSuccess() {
      queryClient.refetchQueries({ queryKey: ["business_status", businessId], stale: true });
      queryClient.refetchQueries({ queryKey: ["my_business", businessId], stale: true });
      toast.success("Updated", { description: "Business status updated ..." });
    },
    onError() {
      toast.error("Error updating", {
        description: "An error occured while updating your business status",
      });
    },
  });

  return {
    businessStatus,
    fetchingBusinessStatus,
    updateBusinessStatus,
    updatingBusinessStatus,
  };
};
