import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAttendanceStatusApiCall, postAttendanceActionApiCall } from "./attendance.service";
import { useStaffSession } from "./useStaffSession";

const ATTENDANCE_STATUS_QUERY_KEY = ["pos_attendance_status"];

export const useAttendanceStatus = () => {
    const { session } = useStaffSession();
    return useQuery({
        queryKey: [...ATTENDANCE_STATUS_QUERY_KEY, session?.employmentId],
        queryFn: fetchAttendanceStatusApiCall,
        enabled: !!session,
    });
};

export const useAttendanceAction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ endpoint, body }: { endpoint: string; body?: object }) =>
            postAttendanceActionApiCall(endpoint, body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ATTENDANCE_STATUS_QUERY_KEY });
        },
    });
};
