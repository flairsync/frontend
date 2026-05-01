import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  checkInApiCall,
  checkOutApiCall,
  startBreakApiCall,
  endBreakApiCall,
  fetchAttendanceLogsApiCall,
  fetchAttendanceByIdApiCall,
  fetchMyAttendanceApiCall,
  fetchTodayAttendanceDashboardApiCall,
  validateAttendanceApiCall,
  fetchAttendanceSummaryApiCall,
  CheckInDto,
  CheckOutDto,
  ValidateAttendanceDto,
} from "./service";
import { toast } from "sonner";
import { extractErrorMessage } from "@/utils/error-utils";
import {
  AttendanceLog,
  AttendancePage,
  AttendanceSummaryEntry,
  BusinessAttendanceFilters,
  MyAttendanceFilters,
} from "@/models/business/shift/Attendance";

export const useAttendance = (businessId?: string, filters?: BusinessAttendanceFilters) => {
  const queryClient = useQueryClient();

  const { data: logsPage, isLoading: isLoadingLogs } = useQuery<AttendancePage>({
    queryKey: ["attendance-logs", businessId, filters],
    queryFn: async () => {
      const res = await fetchAttendanceLogsApiCall(businessId!, filters);
      const raw = res.data?.data ?? res.data;
      if (Array.isArray(raw)) return { data: raw, total: raw.length, page: 1, limit: raw.length };
      return raw as AttendancePage;
    },
    enabled: !!businessId,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["attendance-logs", businessId] });
    queryClient.invalidateQueries({ queryKey: ["my-attendance", businessId] });
    queryClient.invalidateQueries({ queryKey: ["attendance-today", businessId] });
  };

  const checkInMutation = useMutation({
    mutationFn: (data: CheckInDto) => checkInApiCall(data),
    onSuccess: () => {
      invalidateAll();
      toast.success("Checked in successfully");
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to check in"));
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (data: CheckOutDto) => checkOutApiCall(data),
    onSuccess: () => {
      invalidateAll();
      toast.success("Checked out successfully");
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to check out"));
    },
  });

  const startBreakMutation = useMutation({
    mutationFn: (data: CheckOutDto) => startBreakApiCall(data),
    onSuccess: () => {
      invalidateAll();
      toast.success("Break started");
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to start break"));
    },
  });

  const endBreakMutation = useMutation({
    mutationFn: (data: CheckOutDto) => endBreakApiCall(data),
    onSuccess: () => {
      invalidateAll();
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
      invalidateAll();
      queryClient.invalidateQueries({ queryKey: ["upcoming-shifts"] });
      queryClient.invalidateQueries({ queryKey: ["manager-roster"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-summary"] });
      toast.success("Attendance validated successfully");
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to validate attendance"));
    },
  });

  return {
    logsPage,
    logs: logsPage?.data ?? [],
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

export const useAttendanceById = (id?: string) => {
  return useQuery<AttendanceLog>({
    queryKey: ["attendance-by-id", id],
    queryFn: async () => {
      const res = await fetchAttendanceByIdApiCall(id!);
      return res.data?.data ?? res.data;
    },
    enabled: !!id,
  });
};

export const useMyAttendance = (businessId?: string, filters?: MyAttendanceFilters) => {
  return useQuery<AttendancePage>({
    queryKey: ["my-attendance", businessId, filters],
    queryFn: async () => {
      const res = await fetchMyAttendanceApiCall(businessId!, filters);
      const raw = res.data?.data ?? res.data;
      if (Array.isArray(raw)) return { data: raw, total: raw.length, page: 1, limit: raw.length };
      return raw as AttendancePage;
    },
    enabled: !!businessId,
  });
};

export const useTodayAttendanceDashboard = (businessId?: string) => {
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  return useQuery({
    queryKey: ["attendance-today", businessId, todayDate],
    queryFn: () =>
      fetchTodayAttendanceDashboardApiCall(businessId!, todayDate).then((res) => res.data?.data ?? res.data),
    enabled: !!businessId,
  });
};

export const useAttendanceSummary = (
  businessId?: string,
  startDate?: string,
  endDate?: string,
  employmentId?: string
) => {
  return useQuery<AttendanceSummaryEntry[]>({
    queryKey: ["attendance-summary", businessId, startDate, endDate, employmentId],
    queryFn: async () => {
      const res = await fetchAttendanceSummaryApiCall(businessId!, startDate!, endDate!, employmentId);
      const raw = res.data?.data ?? res.data;
      return Array.isArray(raw) ? raw : [];
    },
    enabled: !!businessId && !!startDate && !!endDate,
  });
};
