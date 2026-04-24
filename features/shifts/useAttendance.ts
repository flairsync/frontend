import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  checkInApiCall,
  checkOutApiCall,
  startBreakApiCall,
  endBreakApiCall,
  fetchAttendanceLogsApiCall,
  fetchMyAttendanceApiCall,
  fetchTodayAttendanceDashboardApiCall,
  validateAttendanceApiCall,
  CheckInDto,
  CheckOutDto,
  ValidateAttendanceDto, // Assuming this DTO exists in service.ts
} from "./service";
import { toast } from "sonner";
import { extractErrorMessage } from "@/utils/error-utils";

export const useAttendance = (businessId?: string) => {
  const queryClient = useQueryClient();

  const { data: logs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ["attendance-logs", businessId],
    queryFn: () => fetchAttendanceLogsApiCall(businessId!).then((res) => res.data),
    enabled: !!businessId,
  });

  const checkInMutation = useMutation({
    mutationFn: (data: CheckInDto) => checkInApiCall(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-logs", businessId] });
      queryClient.invalidateQueries({ queryKey: ["my-attendance", businessId] });
      queryClient.invalidateQueries({ queryKey: ["attendance-today", businessId] });
      toast.success("Checked in successfully");
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to check in"));
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (data: CheckOutDto) => checkOutApiCall(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-logs", businessId] });
      queryClient.invalidateQueries({ queryKey: ["my-attendance", businessId] });
      queryClient.invalidateQueries({ queryKey: ["attendance-today", businessId] });
      toast.success("Checked out successfully");
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to check out"));
    },
  });

  const startBreakMutation = useMutation({
    mutationFn: (data: CheckOutDto) => startBreakApiCall(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-logs", businessId] });
      queryClient.invalidateQueries({ queryKey: ["my-attendance", businessId] });
      queryClient.invalidateQueries({ queryKey: ["attendance-today", businessId] });
      toast.success("Break started");
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to start break"));
    },
  });

  const endBreakMutation = useMutation({
    mutationFn: (data: CheckOutDto) => endBreakApiCall(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-logs", businessId] });
      queryClient.invalidateQueries({ queryKey: ["my-attendance", businessId] });
      queryClient.invalidateQueries({ queryKey: ["attendance-today", businessId] });
      toast.success("Break ended");
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to end break"));
    },
  });

  const validateAttendanceMutation = useMutation({
    mutationFn: (args: { attendanceId: string; data: ValidateAttendanceDto }) =>
      validateAttendanceApiCall(args.attendanceId, args.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-logs", businessId] });
      queryClient.invalidateQueries({ queryKey: ["my-attendance", businessId] });
      queryClient.invalidateQueries({ queryKey: ["attendance-today", businessId] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-shifts"] }); // Also clear shifts
      queryClient.invalidateQueries({ queryKey: ["manager-roster"] });
      toast.success("Attendance validated successfully");
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to validate attendance"));
    },
  });

  return {
    logs,
    isLoadingLogs,
    checkIn: checkInMutation.mutateAsync,
    checkOut: checkOutMutation.mutateAsync,
    startBreak: startBreakMutation.mutateAsync,
    endBreak: endBreakMutation.mutateAsync,
    validateAttendance: validateAttendanceMutation.mutateAsync,
    isCheckingIn: checkInMutation.isPending,
    isCheckingOut: checkOutMutation.isPending,
    isStartingBreak: startBreakMutation.isPending,
    isEndingBreak: endBreakMutation.isPending,
    isValidatingAttendance: validateAttendanceMutation.isPending,
  };
};

export const useMyAttendance = (businessId?: string) => {
  return useQuery({
    queryKey: ["my-attendance", businessId],
    queryFn: () => fetchMyAttendanceApiCall(businessId!).then((res) => res.data),
    enabled: !!businessId,
  });
};

export const useTodayAttendanceDashboard = (businessId?: string) => {
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  return useQuery({
    queryKey: ["attendance-today", businessId, todayDate],
    queryFn: () => fetchTodayAttendanceDashboardApiCall(businessId!, todayDate).then((res) => res.data.data),
    enabled: !!businessId,
  });
};
