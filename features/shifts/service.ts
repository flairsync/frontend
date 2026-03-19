import flairapi from "@/lib/flairapi";
import { ShiftStatus } from "@/models/business/shift/Shift";

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
  employmentId: string;
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

const baseUrl = `${import.meta.env.BASE_URL}/shifts`;

// Templates API
export const fetchShiftTemplatesApiCall = (businessId: string) => {
  return flairapi.get(`${baseUrl}/templates?businessId=${businessId}`);
};

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
export const fetchShiftsApiCall = (businessId: string, startDate?: string, endDate?: string, employmentId?: string) => {
  const params = new URLSearchParams();
  params.append("businessId", businessId);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (employmentId) params.append("employmentId", employmentId);

  const qs = params.toString();
  return flairapi.get(`${baseUrl}?${qs}`);
};

export const getUpcomingShiftsApiCall = (params: any) => {
  return flairapi.get(`${baseUrl}/upcoming`, { params });
};

export const fetchManagerRosterApiCall = (businessId: string, startDate: string, endDate: string) => {
  return flairapi.get(`${baseUrl}/manager-roster?businessId=${businessId}&startDate=${startDate}&endDate=${endDate}`);
};

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

export const claimShiftApiCall = (shiftId: string, employmentId: string) => {
  return flairapi.post(`${baseUrl}/${shiftId}/claim`, { employmentId });
};

// Weekly Management API
export const generateWeeklyDraftApiCall = (businessId: string, weekStartDate: string) => {
  return flairapi.post(`${baseUrl}/generate-weekly-draft?businessId=${businessId}&weekStartDate=${weekStartDate}`);
};

export const publishWeeklyScheduleApiCall = (data: { businessId: string; startDate: string; endDate: string }) => {
  return flairapi.post(`${baseUrl}/publish-weekly-schedule`, data);
};

export const copyPreviousWeekApiCall = (data: { businessId: string; sourceWeekStart: string; targetWeekStart: string; employmentId?: string }) => {
  return flairapi.post(`${baseUrl}/copy-previous-week`, data);
};

// Recurring Rules API
export const fetchRecurringRulesApiCall = (businessId: string) => {
  return flairapi.get(`${baseUrl}/rules?businessId=${businessId}`);
};

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
export const fetchAvailabilityApiCall = (employmentId: string) => {
  return flairapi.get(`${baseUrl}/availability/${employmentId}`);
};

export const updateAvailabilityApiCall = (data: UpdateAvailabilityDto) => {
  return flairapi.post(`${baseUrl}/availability`, data);
};

// Time Off API
export const fetchTimeOffRequestsApiCall = (businessId: string, employmentId?: string) => {
  const params = new URLSearchParams();
  params.append("businessId", businessId);
  if (employmentId) params.append("employmentId", employmentId);
  return flairapi.get(`${baseUrl}/time-off?${params.toString()}`);
};

export const submitTimeOffRequestApiCall = (data: { businessId: string; employmentId: string; startDate: string; endDate: string; reason: string; documentUrl?: string }) => {
  return flairapi.post(`${baseUrl}/time-off`, data);
};

export const updateTimeOffStatusApiCall = (requestId: string, data: { status: string; reviewerId: string }) => {
  return flairapi.patch(`${baseUrl}/time-off/${requestId}/status`, data);
};

// Shift Swaps API
export const fetchShiftSwapsApiCall = (businessId: string, employmentId?: string) => {
  const params = new URLSearchParams();
  params.append("businessId", businessId);
  if (employmentId) params.append("employmentId", employmentId);
  return flairapi.get(`${baseUrl}/swaps?${params.toString()}`);
};

export const requestShiftSwapApiCall = (data: { businessId: string; shiftId: string; fromEmploymentId: string; toEmploymentId: string }) => {
  return flairapi.post(`${baseUrl}/swaps`, data);
};

export const updateShiftSwapStatusApiCall = (swapId: string, data: { status: string }) => {
  return flairapi.patch(`${baseUrl}/swaps/${swapId}/status`, data);
};

export const fetchUnvalidatedShiftSummaryApiCall = (businessId: string, weeks: number = 4) => {
  return flairapi.get(`${baseUrl}/unvalidated-summary?businessId=${businessId}&weeks=${weeks}`);
};

// Attendance API
export const checkInApiCall = (data: CheckInDto) => {
  return flairapi.post(`${import.meta.env.BASE_URL}/attendance/check-in`, data);
};

export const checkOutApiCall = (data: CheckOutDto) => {
  return flairapi.post(`${import.meta.env.BASE_URL}/attendance/check-out`, data);
};

export const startBreakApiCall = (data: CheckOutDto) => {
  return flairapi.post(`${import.meta.env.BASE_URL}/attendance/break/start`, data);
};

export const endBreakApiCall = (data: CheckOutDto) => {
  return flairapi.post(`${import.meta.env.BASE_URL}/attendance/break/end`, data);
};

export const fetchAttendanceLogsApiCall = (businessId: string) => {
  return flairapi.get(`${import.meta.env.BASE_URL}/attendance/business/${businessId}`);
};

export const fetchMyAttendanceApiCall = (businessId: string) => {
  return flairapi.get(`${import.meta.env.BASE_URL}/attendance/me?businessId=${businessId}`);
};

export const fetchTodayAttendanceDashboardApiCall = (businessId: string, date?: string) => {
  const url = `${import.meta.env.BASE_URL}/attendance/today?businessId=${businessId}`;
  return flairapi.get(date ? `${url}&date=${date}` : url);
};
