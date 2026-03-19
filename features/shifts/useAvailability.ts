import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAvailabilityApiCall,
  updateAvailabilityApiCall,
  UpdateAvailabilityDto,
} from "./service";
import { toast } from "sonner";

export const useAvailability = (employmentId?: string) => {
  const queryClient = useQueryClient();

  const { data: availability, isLoading: isLoadingAvailability } = useQuery({
    queryKey: ["availability", employmentId],
    queryFn: () => fetchAvailabilityApiCall(employmentId!).then((res) => res.data.data),
    enabled: !!employmentId,
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: (data: UpdateAvailabilityDto) => updateAvailabilityApiCall(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability", employmentId] });
      toast.success("Availability updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update availability");
    },
  });

  return {
    availability,
    isLoadingAvailability,
    updateAvailability: updateAvailabilityMutation.mutateAsync,
    isUpdating: updateAvailabilityMutation.isPending,
  };
};
