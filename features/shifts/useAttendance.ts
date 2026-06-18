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
import { fetchMyEmploymentsApiCall } from "@/features/business/service";
import { MyEmployment } from "@/models/business/MyEmployment";

export const useAttendance = (businessId?: string, filters?: BusinessAttendanceFilters) => {
  const queryClient = useQueryClient();

  const { data: logsPage, isLoading: isLoadingLogs } = useQuery<AttendancePage>({
    queryKey: ["attendance-logs", businessId, filters],
    queryFn: async () => {
      const data = await fetchAttendanceLogsApiCall(businessId!, filters);
      return data as unknown as AttendancePage;
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
    queryFn: () => fetchAttendanceByIdApiCall(id!),
    enabled: !!id,
  });
};

export const useMyAttendance = (businessId?: string, filters?: MyAttendanceFilters) => {
  return useQuery<AttendancePage>({
    queryKey: ["my-attendance", businessId, filters],
    queryFn: async () => {
      const data = await fetchMyAttendanceApiCall(businessId!, filters);
      return data as unknown as AttendancePage;
    },
    enabled: !!businessId,
  });
};

export const useTodayAttendanceDashboard = (businessId?: string) => {
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  return useQuery({
    queryKey: ["attendance-today", businessId, todayDate],
    queryFn: () => fetchTodayAttendanceDashboardApiCall(businessId!, todayDate),
    enabled: !!businessId,
  });
};

export interface ActiveShiftInfo {
  businessId: string;
  businessName: string;
  employmentId: string;
  attendance: AttendanceLog;
  onBreak: boolean;
}

// Scans across all of the logged-in user's employments to find one ongoing
// (clocked-in, not checked-out) attendance log, so a global "you're clocked in"
// reminder can be shown regardless of which business/page is currently open.
export const useMyActiveShift = (enabled: boolean = true) => {
  return useQuery<ActiveShiftInfo | null>({
    queryKey: ["my-active-shift"],
    queryFn: async () => {
      const employmentsRes = await fetchMyEmploymentsApiCall(1, 50);
      const employments = MyEmployment.parseApiArrayResponse(employmentsRes.data || []).filter(
        (e) => e.status === "ACTIVE"
      );

      for (const employment of employments) {
        try {
          const dashboard = (await fetchTodayAttendanceDashboardApiCall(employment.business.id)) as
            | { attendance?: AttendanceLog }
            | undefined;
          const attendance = dashboard?.attendance;
          if (attendance?.checkInTime && !attendance.checkOutTime) {
            return {
              businessId: employment.business.id,
              businessName: employment.business.name,
              employmentId: employment.id,
              attendance,
              onBreak: !!attendance.breaks?.some((b) => !b.end),
            };
          }
        } catch {
          // Skip businesses we fail to fetch attendance for
        }
      }
      return null;
    },
    enabled,
    refetchInterval: 60_000,
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
      const data = await fetchAttendanceSummaryApiCall(businessId!, startDate!, endDate!, employmentId);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!businessId && !!startDate && !!endDate,
  });
};
