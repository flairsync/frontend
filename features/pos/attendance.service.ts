import { staffApi } from "@/features/station/station-api";

export interface AttendanceRecord {
    id: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    status: "PRESENT" | "LATE" | "ON_BREAK" | "NO_SHOW";
    lifecycleStatus: "ONGOING" | "FINISHED" | "VALIDATED";
    breaks: { start: string; end: string | null; type: "PAID" | "UNPAID" }[];
}

export const fetchAttendanceStatusApiCall = async (): Promise<AttendanceRecord | null> => {
    const res = await staffApi.get("/station/staff/attendance/status");
    return res.data?.data?.attendance ?? null;
};

export const postAttendanceActionApiCall = (endpoint: string, body?: object) =>
    staffApi.post(`/station/staff/attendance/${endpoint}`, body ?? {});
