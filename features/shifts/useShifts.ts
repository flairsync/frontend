import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { extractErrorMessage } from "@/utils/error-utils";
import {
  fetchShiftsApiCall,
  bulkScheduleTeamShiftsApiCall,
  createIndividualShiftApiCall,
  updateShiftApiCall,
  deleteShiftApiCall,
  generateWeeklyDraftApiCall,
  publishWeeklyScheduleApiCall,
  copyPreviousWeekApiCall,
  bulkStaffWeeklySetupApiCall,
  respondToShiftApiCall,
  claimShiftApiCall,
  bidOnShiftApiCall,
  fetchShiftBidsApiCall,
  fetchAllBusinessBidsApiCall,
  updateShiftBidStatusApiCall,
  fetchManagerRosterApiCall,
  getUpcomingShiftsApiCall,
  fetchAvailableShiftsApiCall,
  fetchMyBidsApiCall,
  BulkScheduleTeamDto,
  BulkStaffWeeklyDto,
  CreateIndividualShiftDto,
  UpdateShiftDto
} from "./service";
import { Shift } from "@/models/business/shift/Shift";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Helper to format for Wall Time
const formatToWallTime = (date: Date | string) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return d.toISOString();
};

const formatToDateOnly = (date: Date | string) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, "yyyy-MM-dd");
};

export const useShifts = (businessId: string, startDate?: Date | string, endDate?: Date | string, employmentId?: string) => {
  const queryClient = useQueryClient();

  const startStr = startDate ? formatToDateOnly(startDate) : undefined;
  const endStr = endDate ? formatToDateOnly(endDate) : undefined;

  // For the active calendar view, we often only want shifts within a date range
  const { data: shifts, isFetching: fetchingShifts, isLoading: loadingShifts, refetch } = useQuery<Shift[]>({
    queryKey: ["shifts", businessId, startStr, endStr, employmentId],
    queryFn: async () => {
      try {
        const resp = await fetchShiftsApiCall(businessId, startStr, endStr, employmentId);
        const resData = resp.data;
        const actualData = resData?.data !== undefined ? resData.data : resData;

        if (actualData && Array.isArray(actualData)) return actualData;
        return Array.isArray(actualData) ? actualData : [];
      } catch (error) {
        console.warn("Failed to fetch shifts:", error);
        return [];
      }
    },
    enabled: !!businessId && !!startDate && !!endDate && (employmentId !== undefined ? !!employmentId : true),
  });

  const bulkScheduleTeamMutation = useMutation({
    mutationFn: (data: Omit<BulkScheduleTeamDto, "businessId">) => {
      const formattedDates = data.dates.map(d => ({ date: formatToDateOnly(d.date) }));
      return bulkScheduleTeamShiftsApiCall({ 
        ...data, 
        businessId,
        dates: formattedDates 
      });
    },
    onSuccess: () => {
      toast.success("Team shifts scheduled successfully");
      queryClient.invalidateQueries({ queryKey: ["shifts", businessId] });
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to schedule team shifts"));
    }
  });

  const bulkStaffWeeklySetupMutation = useMutation({
    mutationFn: (data: Omit<BulkStaffWeeklyDto, "businessId">) => {
      const formattedDates = data.dates.map(d => ({ date: formatToDateOnly(d.date) }));
      return bulkStaffWeeklySetupApiCall({ 
        ...data, 
        businessId,
        dates: formattedDates 
      });
    },
    onSuccess: () => {
      toast.success("Staff shifts scheduled successfully");
      queryClient.invalidateQueries({ queryKey: ["shifts", businessId] });
      queryClient.invalidateQueries({ queryKey: ["unvalidated_summary", businessId] });
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to schedule staff shifts"));
    }
  });

  const createIndividualShiftMutation = useMutation({
    mutationFn: (data: Omit<CreateIndividualShiftDto, "businessId">) =>
      createIndividualShiftApiCall({ 
        ...data, 
        businessId,
        startTime: formatToWallTime(data.startTime),
        endTime: formatToWallTime(data.endTime)
      }),
    onSuccess: () => {
      toast.success("Shift created successfully");
      queryClient.invalidateQueries({ queryKey: ["shifts", businessId] });
      queryClient.invalidateQueries({ queryKey: ["unvalidated_summary", businessId] });
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to create shift"));
    }
  });

  const updateShiftMutation = useMutation({
    mutationFn: ({ shiftId, data }: { shiftId: string; data: UpdateShiftDto }) =>
      updateShiftApiCall(shiftId, {
        ...data,
        startTime: data.startTime ? formatToWallTime(data.startTime) : undefined,
        endTime: data.endTime ? formatToWallTime(data.endTime) : undefined,
      }),
    onSuccess: () => {
      toast.success("Shift updated successfully");
      queryClient.invalidateQueries({ queryKey: ["shifts", businessId] });
      queryClient.invalidateQueries({ queryKey: ["unvalidated_summary", businessId] });
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to update shift"));
    }
  });

  const deleteShiftMutation = useMutation({
    mutationFn: (shiftId: string) => deleteShiftApiCall(shiftId),
    onSuccess: () => {
      toast.success("Shift deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["shifts", businessId] });
      queryClient.invalidateQueries({ queryKey: ["unvalidated_summary", businessId] });
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to delete shift"));
    }
  });

  const generateWeeklyDraftMutation = useMutation({
    mutationFn: (weekStartDate: string) => generateWeeklyDraftApiCall(businessId, formatToDateOnly(weekStartDate)),
    onSuccess: () => {
      toast.success("Weekly draft generated successfully");
      queryClient.invalidateQueries({ queryKey: ["shifts", businessId] });
      queryClient.invalidateQueries({ queryKey: ["unvalidated_summary", businessId] });
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to generate weekly draft"));
    }
  });

  const publishWeeklyScheduleMutation = useMutation({
    mutationFn: (data: { startDate: string; endDate: string }) => publishWeeklyScheduleApiCall({ 
      ...data, 
      businessId,
      startDate: formatToDateOnly(data.startDate),
      endDate: formatToDateOnly(data.endDate)
    }),
    onSuccess: () => {
      toast.success("Weekly schedule published successfully");
      queryClient.invalidateQueries({ queryKey: ["shifts", businessId] });
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to publish weekly schedule"));
    }
  });

  const copyPreviousWeekMutation = useMutation({
    mutationFn: (data: { sourceWeekStart: string; targetWeekStart: string; employmentId?: string }) => copyPreviousWeekApiCall({ 
      ...data, 
      businessId,
      sourceWeekStart: formatToDateOnly(data.sourceWeekStart),
      targetWeekStart: formatToDateOnly(data.targetWeekStart)
    }),
    onSuccess: () => {
      toast.success("Shifts copied successfully");
      queryClient.invalidateQueries({ queryKey: ["shifts", businessId] });
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to copy shifts"));
    }
  });
  
  const respondToShiftMutation = useMutation({
    mutationFn: ({ shiftId, response }: { shiftId: string; response: 'ACCEPTED' | 'REJECTED' }) => 
      respondToShiftApiCall(shiftId, response),
    onSuccess: () => {
      toast.success("Response recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["shifts", businessId] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-shifts"] });
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to record response"));
    }
  });
  
  const claimShiftMutation = useMutation({
    mutationFn: (shiftId: string) => 
      claimShiftApiCall(shiftId),
    onSuccess: () => {
      toast.success("Shift claimed successfully");
      queryClient.invalidateQueries({ queryKey: ["shifts", businessId] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-shifts"] });
      queryClient.invalidateQueries({ queryKey: ["available-shifts", businessId] });
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to claim shift"));
    }
  });

  const bidOnShiftMutation = useMutation({
    mutationFn: (shiftId: string) => 
      bidOnShiftApiCall(shiftId),
    onSuccess: () => {
      toast.success("Bid submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["shifts", businessId] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-shifts"] });
      queryClient.invalidateQueries({ queryKey: ["available-shifts", businessId] });
      queryClient.invalidateQueries({ queryKey: ["my-bids"] });
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to submit bid"));
    }
  });

  const updateShiftBidStatusMutation = useMutation({
    mutationFn: ({ bidId, status }: { bidId: string; status: 'APPROVED' | 'REJECTED' }) => 
      updateShiftBidStatusApiCall(bidId, status),
    onSuccess: (_, variables) => {
      toast.success(`Bid ${variables.status.toLowerCase()} successfully`);
      queryClient.invalidateQueries({ queryKey: ["shifts", businessId] });
      queryClient.invalidateQueries({ queryKey: ["manager-roster"] });
      queryClient.invalidateQueries({ queryKey: ["shift-bids"] });
      queryClient.invalidateQueries({ queryKey: ["business-bids", businessId] });
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to update bid status"));
    }
  });

  return {
    shifts,
    fetchingShifts,
    loadingShifts,
    refetchShifts: refetch,
    bulkScheduleTeam: bulkScheduleTeamMutation.mutate,
    isBulkScheduling: bulkScheduleTeamMutation.isPending,
    createIndividualShift: createIndividualShiftMutation.mutate,
    isCreatingIndividualShift: createIndividualShiftMutation.isPending,
    updateShift: updateShiftMutation.mutate,
    isUpdatingShift: updateShiftMutation.isPending,
    deleteShift: deleteShiftMutation.mutate,
    isDeletingShift: deleteShiftMutation.isPending,
    generateWeeklyDraft: generateWeeklyDraftMutation.mutate,
    isGeneratingDraft: generateWeeklyDraftMutation.isPending,
    publishWeeklySchedule: publishWeeklyScheduleMutation.mutate,
    isPublishing: publishWeeklyScheduleMutation.isPending,
    copyPreviousWeek: copyPreviousWeekMutation.mutate,
    isCopyingWeek: copyPreviousWeekMutation.isPending,
    bulkStaffWeeklySetup: bulkStaffWeeklySetupMutation.mutate,
    isBulkStaffScheduling: bulkStaffWeeklySetupMutation.isPending,
    respondToShift: respondToShiftMutation.mutate,
    isResponding: respondToShiftMutation.isPending,
    claimShift: claimShiftMutation.mutate,
    isClaiming: claimShiftMutation.isPending,
    bidOnShift: bidOnShiftMutation.mutate,
    isBidding: bidOnShiftMutation.isPending,
    approveShiftBid: (bidId: string, options?: any) => updateShiftBidStatusMutation.mutate({ bidId, status: 'APPROVED' }, options),
    rejectShiftBid: (bidId: string, options?: any) => updateShiftBidStatusMutation.mutate({ bidId, status: 'REJECTED' }, options),
    updateBidStatus: updateShiftBidStatusMutation.mutate,
    isUpdatingBidStatus: updateShiftBidStatusMutation.isPending,
    isApprovingBid: updateShiftBidStatusMutation.isPending && updateShiftBidStatusMutation.variables?.status === 'APPROVED'
  };
};

export const useShiftBids = (shiftId?: string) => {
  return useQuery({
    queryKey: ["shift-bids", shiftId],
    queryFn: async () => {
      if (!shiftId) return [];
      const resp = await fetchShiftBidsApiCall(shiftId);
      const resData = resp.data;
      const actualData = resData?.data !== undefined ? resData.data : resData;
      return Array.isArray(actualData) ? actualData : [];
    },
    enabled: !!shiftId,
  });
};

export const useManagerRoster = (businessId: string, startDate?: Date | string, endDate?: Date | string) => {
  const startStr = startDate ? formatToDateOnly(startDate) : undefined;
  const endStr = endDate ? formatToDateOnly(endDate) : undefined;

  const { data: roster, isFetching: fetchingRoster, isLoading: loadingRoster, refetch } = useQuery<any[]>({
    queryKey: ["manager-roster", businessId, startStr, endStr],
    queryFn: async () => {
      try {
        const resp = await fetchManagerRosterApiCall(businessId, startStr || '', endStr || '');
        return resp.data?.data || [];
      } catch (error) {
        console.warn("Failed to fetch manager roster:", error);
        return [];
      }
    },
    enabled: !!businessId && !!startDate && !!endDate,
  });

  return {
    roster,
    fetchingRoster,
    loadingRoster,
    refetchRoster: refetch
  };
};

export const useUpcomingShifts = (params: {
  businessId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery<PaginatedResponse<Shift>>({
    queryKey: ["upcoming-shifts", params],
    queryFn: async () => {
      try {
        const resp = await getUpcomingShiftsApiCall(params);
        const resData = resp.data;
        // Handle both { data: [...] } and { data: { data: [...] } }
        const actualData = resData?.data !== undefined ? resData.data : resData;
        return actualData;
      } catch (error) {
        console.warn("Failed to fetch upcoming shifts:", error);
        throw error; // Let React Query handle the error state
      }
    },
    enabled: !!params.businessId,
  });
};

export const useAvailableShifts = (businessId: string) => {
  return useQuery<Shift[]>({
    queryKey: ["available-shifts", businessId],
    queryFn: async () => {
      const resp = await fetchAvailableShiftsApiCall(businessId);
      return resp.data?.data || [];
    },
    enabled: !!businessId,
  });
};

export const useMyBids = () => {
  return useQuery<any[]>({
    queryKey: ["my-bids"],
    queryFn: async () => {
      const resp = await fetchMyBidsApiCall();
      return resp.data?.data || [];
    },
  });
};

export const useAllBusinessBids = (businessId: string) => {
  return useQuery<any[]>({
    queryKey: ["business-bids", businessId],
    queryFn: async () => {
      const resp = await fetchAllBusinessBidsApiCall(businessId);
      const resData = resp.data;
      const actualData = resData?.data !== undefined ? resData.data : resData;
      return Array.isArray(actualData) ? actualData : [];
    },
    enabled: !!businessId,
  });
};
