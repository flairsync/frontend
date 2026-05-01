import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  fetchTimeOffRequestsApiCall,
  submitTimeOffRequestApiCall,
  updateTimeOffStatusApiCall
} from "./service";
import { TimeOffRequest, LeaveType } from "@/models/business/shift/TimeOffRequest";

const formatToDateOnly = (date: Date | string) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, "yyyy-MM-dd");
};

export const useTimeOff = (businessId: string, employmentId?: string) => {
  const queryClient = useQueryClient();

  const { data: requests, isFetching: fetchingRequests } = useQuery<TimeOffRequest[]>({
    queryKey: ["time_off_requests", businessId, employmentId],
    queryFn: async () => {
      try {
        const resp = await fetchTimeOffRequestsApiCall(businessId, employmentId);
        const resData = resp.data;
        const actualData = resData?.data !== undefined ? resData.data : resData;
        return Array.isArray(actualData) ? actualData : [];
      } catch (error) {
        console.warn("Failed to fetch time off requests:", error);
        return [];
      }
    },
    enabled: !!businessId,
  });

  const submitRequestMutation = useMutation({
    mutationFn: (data: Omit<TimeOffRequest, "id" | "businessId" | "status" | "createdAt" | "updatedAt"> & { leaveType: LeaveType }) => {
      const formatToWallTime = (date: Date | string) => {
        const d = typeof date === 'string' ? parseISO(date) : date;
        return format(d, "yyyy-MM-dd HH:mm:ss");
      };

      return submitTimeOffRequestApiCall({
        ...data,
        businessId,
        startDate: formatToWallTime(data.startDate),
        endDate: formatToWallTime(data.endDate),
        leaveType: data.leaveType,
        reason: data.reason ?? '',
        documentUrl: data.documentUrl ?? undefined,
      });
    },
    onSuccess: () => {
      toast.success("Time off request submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["time_off_requests", businessId] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to submit time off request";
      toast.error(msg);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ requestId, status, reviewerId }: { requestId: string; status: string; reviewerId: string }) =>
      updateTimeOffStatusApiCall(requestId, { status, reviewerId }),
    onSuccess: () => {
      toast.success("Time off request updated successfully");
      queryClient.invalidateQueries({ queryKey: ["time_off_requests", businessId] });
      queryClient.invalidateQueries({ queryKey: ["shifts", businessId] }); // Conflicts might change
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to update time off request";
      toast.error(msg);
    }
  });

  return {
    requests,
    fetchingRequests,
    submitRequest: submitRequestMutation.mutate,
    isSubmitting: submitRequestMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
};
