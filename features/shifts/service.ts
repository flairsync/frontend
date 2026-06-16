import flairapi from "@/lib/flairapi";
import { ShiftStatus } from "@/models/business/shift/Shift";
import { unwrap, unwrapPaginated } from "../shared/api-response";

// DTOs
export interface CreateShiftTemplateDto {
  businessId: string;
  name: string;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  colorCode?: string;
}

export interface UpdateShiftTemplateDto {
  name?: string;
  startTime?: string;
  endTime?: string;
  colorCode?: string;
}

export interface BulkScheduleTeamDto {
  businessId: string;
  teamId: string;
  templateId?: string;
  startTime?: string;
  endTime?: string;
  dates: { date: string }[];
}

export interface BulkStaffWeeklyDto {
  businessId: string;
  employmentId: string;
  templateId?: string;
  startTime?: string;
  endTime?: string;
  dates: { date: string }[];
}

export interface CreateIndividualShiftDto {
  businessId: string;
  employmentId?: string; // Optional for OPEN shifts
  startTime: string; // "YYYY-MM-DD HH:mm:ss" (Wall Time)
  endTime: string; // "YYYY-MM-DD HH:mm:ss" (Wall Time)
  notes?: string;
  requiredRoleId?: string;
}

export interface UpdateShiftDto {
  startTime?: string; // "YYYY-MM-DD HH:mm:ss" (Wall Time)
  endTime?: string; // "YYYY-MM-DD HH:mm:ss" (Wall Time)
  status?: ShiftStatus;
  notes?: string;
  requiredRoleId?: string;
}

// Attendance DTOs
export interface CheckInDto {
  businessId: string;
  employmentId: string;
  shiftId?: string;
  location?: { lat: number; lng: number };
}

export interface CheckOutDto {
  businessId: string;
  employmentId: string;
  location?: { lat: number; lng: number };
  type?: 'PAID' | 'UNPAID';
}

export interface ValidateAttendanceDto {
  adminId: string;
  updateData: {
    checkInTime: string; // "YYYY-MM-DD HH:mm:ss"
    checkOutTime: string; // "YYYY-MM-DD HH:mm:ss"
    notes: string;
  };
}

// Availability DTOs
export interface UpdateAvailabilityDto {
  employmentId: string;
  dayOfWeek: number;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  isAvailable: boolean;
}

export interface UnvalidatedShiftSummary {
  total: number;
  weeklyBreakdown: {
    weekStart: string;
    count: number;
  }[];
}

const baseUrl = `${import.meta.env.PUBLIC_ENV__BASE_URL}/shifts`;

// Templates API
export const fetchShiftTemplatesApiCall = async (businessId: string) =>
  unwrap(await flairapi.get(`${baseUrl}/templates?businessId=${businessId}`));

export const createShiftTemplateApiCall = (data: CreateShiftTemplateDto) => {
  return flairapi.post(`${baseUrl}/templates`, data);
};

export const updateShiftTemplateApiCall = (templateId: string, data: UpdateShiftTemplateDto) => {
  return flairapi.patch(`${baseUrl}/templates/${templateId}`, data);
};

export const deleteShiftTemplateApiCall = (templateId: string) => {
  return flairapi.delete(`${baseUrl}/templates/${templateId}`);
};

// Shifts API
export const fetchShiftsApiCall = async (businessId: string, startDate?: string, endDate?: string, employmentId?: string) => {
  const params = new URLSearchParams();
  params.append("businessId", businessId);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (employmentId) params.append("employmentId", employmentId);
  return unwrap(await flairapi.get(`${baseUrl}?${params.toString()}`));
};

export const getUpcomingShiftsApiCall = async (params: any) =>
  unwrapPaginated(await flairapi.get(`${baseUrl}/upcoming`, { params }));

export const fetchManagerRosterApiCall = async (businessId: string, startDate: string, endDate: string) =>
  unwrap(await flairapi.get(`${baseUrl}/manager-roster?businessId=${businessId}&startDate=${startDate}&endDate=${endDate}`));

export const fetchAvailableShiftsApiCall = async (businessId: string) =>
  unwrap(await flairapi.get(`${baseUrl}/available?businessId=${businessId}`));

export const fetchMyBidsApiCall = async () =>
  unwrap(await flairapi.get(`${baseUrl}/my-bids`));

export const bulkScheduleTeamShiftsApiCall = (data: BulkScheduleTeamDto) => {
  return flairapi.post(`${baseUrl}/bulk-team`, data);
};

export const createIndividualShiftApiCall = (data: CreateIndividualShiftDto) => {
  return flairapi.post(`${baseUrl}/individual`, data);
};

export const bulkStaffWeeklySetupApiCall = (data: BulkStaffWeeklyDto) => {
  return flairapi.post(`${baseUrl}/bulk-staff`, data);
};

export const updateShiftApiCall = (shiftId: string, data: UpdateShiftDto) => {
  return flairapi.patch(`${baseUrl}/${shiftId}`, data);
};

export const deleteShiftApiCall = (shiftId: string) => {
  return flairapi.delete(`${baseUrl}/${shiftId}`);
};

export const respondToShiftApiCall = (shiftId: string, response: 'ACCEPTED' | 'REJECTED') => {
  return flairapi.patch(`${baseUrl}/${shiftId}/respond`, { response });
};

export const claimShiftApiCall = (shiftId: string) => {
  return flairapi.post(`${baseUrl}/${shiftId}/claim`, {});
};

export const bidOnShiftApiCall = (shiftId: string) => {
  return flairapi.post(`${baseUrl}/${shiftId}/bid`, {});
};

export const fetchShiftBidsApiCall = async (shiftId: string) =>
  unwrap(await flairapi.get(`${baseUrl}/${shiftId}/bids`));

export const fetchAllBusinessBidsApiCall = async (businessId: string) =>
  unwrap(await flairapi.get(`${baseUrl}/bids/all?businessId=${businessId}`));

export const updateShiftBidStatusApiCall = (bidId: string, status: 'APPROVED' | 'REJECTED') => {
  return flairapi.patch(`${baseUrl}/bids/${bidId}/status`, { status });
};

// Weekly Management API
export const generateWeeklyDraftApiCall = (businessId: string, weekStartDate: string) => {
  return flairapi.post(`${baseUrl}/generate-weekly-draft?businessId=${businessId}&weekStartDate=${weekStartDate}`);
};

export const buildShiftExportUrl = (
  businessId: string,
  startDate: string,
  endDate: string,
  exportFormat: 'pdf' | 'excel',
  employmentId?: string
): string => {
  const params = new URLSearchParams({ businessId, startDate, endDate, format: exportFormat });
  if (employmentId) params.append('employmentId', employmentId);
  return `${import.meta.env.PUBLIC_ENV__BASE_URL}/shifts/export?${params.toString()}`;
};

export const generateDraftApiCall = (
  businessId: string,
  startDate: string,
  endDate: string,
  employmentId?: string
) => {
  const params = new URLSearchParams({ businessId, startDate, endDate });
  if (employmentId) params.append("employmentId", employmentId);
  return flairapi.post(`${baseUrl}/generate-draft?${params.toString()}`);
};

export const publishWeeklyScheduleApiCall = (data: { businessId: string; startDate: string; endDate: string }) => {
  return flairapi.post(`${baseUrl}/publish-weekly-schedule`, data);
};

export const copyPreviousWeekApiCall = (data: { businessId: string; sourceWeekStart: string; targetWeekStart: string; employmentId?: string }) => {
  return flairapi.post(`${baseUrl}/copy-previous-week`, data);
};

// Recurring Rules API
export const fetchRecurringRulesApiCall = async (businessId: string) =>
  unwrap(await flairapi.get(`${baseUrl}/rules?businessId=${businessId}`));

export const createRecurringRuleApiCall = (data: any) => {
  return flairapi.post(`${baseUrl}/rules`, data);
};

export const updateRecurringRuleApiCall = (ruleId: string, data: any) => {
  return flairapi.patch(`${baseUrl}/rules/${ruleId}`, data);
};

export const deleteRecurringRuleApiCall = (ruleId: string) => {
  return flairapi.delete(`${baseUrl}/rules/${ruleId}`);
};

// Availability API
export const fetchAvailabilityApiCall = async (employmentId: string) =>
  unwrap(await flairapi.get(`${baseUrl}/availability/${employmentId}`));

export const updateAvailabilityApiCall = (data: UpdateAvailabilityDto) => {
  return flairapi.post(`${baseUrl}/availability`, data);
};

// Time Off API
export const fetchTimeOffRequestsApiCall = async (businessId: string, employmentId?: string) => {
  const params = new URLSearchParams();
  params.append("businessId", businessId);
  if (employmentId) params.append("employmentId", employmentId);
  return unwrap(await flairapi.get(`${baseUrl}/time-off?${params.toString()}`));
};

export const submitTimeOffRequestApiCall = (data: { businessId: string; employmentId: string; startDate: string; endDate: string; leaveType: string; reason: string; documentUrl?: string }) => {
  return flairapi.post(`${baseUrl}/time-off`, data);
};

export const updateTimeOffStatusApiCall = (requestId: string, data: { status: string; reviewerId: string }) => {
  return flairapi.patch(`${baseUrl}/time-off/${requestId}/status`, data);
};

// Shift Swaps API
export const fetchShiftSwapsApiCall = async (businessId: string, employmentId?: string) => {
  const params = new URLSearchParams();
  params.append("businessId", businessId);
  if (employmentId) params.append("employmentId", employmentId);
  return unwrap(await flairapi.get(`${baseUrl}/swaps?${params.toString()}`));
};

export const requestShiftSwapApiCall = (data: { businessId: string; shiftId: string; fromEmploymentId: string; toEmploymentId: string }) => {
  return flairapi.post(`${baseUrl}/swaps`, data);
};

export const updateShiftSwapStatusApiCall = (swapId: string, data: { status: string }) => {
  return flairapi.patch(`${baseUrl}/swaps/${swapId}/status`, data);
};

export const fetchUnvalidatedShiftSummaryApiCall = async (businessId: string, weeks: number = 4) =>
  unwrap(await flairapi.get(`${baseUrl}/unvalidated-summary?businessId=${businessId}&weeks=${weeks}`));

// Attendance API
export const checkInApiCall = (data: CheckInDto) => {
  return flairapi.post(`${import.meta.env.PUBLIC_ENV__BASE_URL}/attendance/check-in`, data);
};

export const checkOutApiCall = (data: CheckOutDto) => {
  return flairapi.post(`${import.meta.env.PUBLIC_ENV__BASE_URL}/attendance/check-out`, data);
};

export const startBreakApiCall = (data: CheckOutDto) => {
  return flairapi.post(`${import.meta.env.PUBLIC_ENV__BASE_URL}/attendance/break/start`, data);
};

export const endBreakApiCall = (data: CheckOutDto) => {
  return flairapi.post(`${import.meta.env.PUBLIC_ENV__BASE_URL}/attendance/break/end`, data);
};

export const fetchAttendanceLogsApiCall = async (
  businessId: string,
  filters?: import('@/models/business/shift/Attendance').BusinessAttendanceFilters
) => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.employmentId) params.append('employmentId', filters.employmentId);
  if (filters?.lifecycleStatus) params.append('lifecycleStatus', filters.lifecycleStatus);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));
  const qs = params.toString();
  return unwrapPaginated(await flairapi.get(`${import.meta.env.PUBLIC_ENV__BASE_URL}/attendance/business/${businessId}${qs ? `?${qs}` : ''}`));
};

export const fetchAttendanceByIdApiCall = async (id: string) =>
  unwrap(await flairapi.get(`${import.meta.env.PUBLIC_ENV__BASE_URL}/attendance/${id}`));

export const fetchMyAttendanceApiCall = async (
  businessId: string,
  filters?: import('@/models/business/shift/Attendance').MyAttendanceFilters
) => {
  const params = new URLSearchParams({ businessId });
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.lifecycleStatus) params.append('lifecycleStatus', filters.lifecycleStatus);
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));
  return unwrapPaginated(await flairapi.get(`${import.meta.env.PUBLIC_ENV__BASE_URL}/attendance/me?${params.toString()}`));
};

export const fetchTodayAttendanceDashboardApiCall = async (businessId: string, date?: string) => {
  const url = `${import.meta.env.PUBLIC_ENV__BASE_URL}/attendance/today?businessId=${businessId}`;
  return unwrap(await flairapi.get(date ? `${url}&date=${date}` : url));
};

export const validateAttendanceApiCall = (attendanceId: string, data: ValidateAttendanceDto) => {
  return flairapi.post(`${import.meta.env.PUBLIC_ENV__BASE_URL}/attendance/${attendanceId}/validate`, data);
};

// Attendance Summary API
export const fetchAttendanceSummaryApiCall = async (businessId: string, startDate: string, endDate: string, employmentId?: string) => {
  const params = new URLSearchParams({ businessId, startDate, endDate });
  if (employmentId) params.append('employmentId', employmentId);
  return unwrap(await flairapi.get(`${import.meta.env.PUBLIC_ENV__BASE_URL}/attendance/summary?${params.toString()}`));
};

// Absence Records API
const absenceBaseUrl = `${import.meta.env.PUBLIC_ENV__BASE_URL}/attendance/absences`;

export const createAbsenceRecordApiCall = (data: import('@/models/business/shift/AbsenceRecord').CreateAbsenceRecordDto) => {
  return flairapi.post(absenceBaseUrl, data);
};

export const fetchAbsenceRecordsApiCall = async (businessId: string, employmentId?: string) => {
  const params = new URLSearchParams({ businessId });
  if (employmentId) params.append('employmentId', employmentId);
  return unwrap(await flairapi.get(`${absenceBaseUrl}?${params.toString()}`));
};

export const fetchMyAbsencesApiCall = async (employmentId: string) =>
  unwrap(await flairapi.get(`${absenceBaseUrl}/me?employmentId=${employmentId}`));

export const updateAbsenceRecordApiCall = (absenceId: string, data: import('@/models/business/shift/AbsenceRecord').UpdateAbsenceRecordDto) => {
  return flairapi.patch(`${absenceBaseUrl}/${absenceId}`, data);
};

export const deleteAbsenceRecordApiCall = (absenceId: string) => {
  return flairapi.delete(`${absenceBaseUrl}/${absenceId}`);
};
