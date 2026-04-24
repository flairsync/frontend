import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    fetchReservationDashboardApiCall,
    createWalkInApiCall,
    assignTableApiCall,
    recordCustomerLateApiCall,
    fetchReservationEventsApiCall,
} from "./service";
import { DashboardResponse, WalkInReservationDto, AssignTableDto, CustomerLateDto, ReservationEvent } from "./types";

export const useReservationDashboard = (businessId: string, pollingEnabled = true) => {
    return useQuery({
        queryKey: ["reservation-dashboard", businessId],
        queryFn: async (): Promise<DashboardResponse> => {
            const resp = await fetchReservationDashboardApiCall(businessId);
            return resp.data?.data ?? resp.data;
        },
        enabled: !!businessId,
        refetchInterval: pollingEnabled ? 60_000 : false,
    });
};

export const useWalkIn = (businessId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: WalkInReservationDto) => {
            const resp = await createWalkInApiCall(businessId, data);
            return resp.data?.data ?? resp.data;
        },
        onSuccess: () => {
            toast.success("Walk-in created successfully");
            queryClient.invalidateQueries({ queryKey: ["reservation-dashboard", businessId] });
            queryClient.invalidateQueries({ queryKey: ["reservations", businessId] });
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] });
            queryClient.invalidateQueries({ queryKey: ["tables", businessId] });
        },
        onError: (error: any) => {
            const code = error.response?.data?.code;
            const message = error.response?.data?.message;
            if (code === "table.not_found") {
                toast.error("Table not found");
            } else if (code === "table.occupied") {
                toast.error("Table is currently occupied or has an active reservation");
            } else if (code === "table.capacity_exceeded") {
                const capacity = error.response?.data?.details?.capacity;
                toast.error(`Party size exceeds table capacity${capacity ? ` (${capacity})` : ""}`);
            } else if (code === "reservation.party_too_large") {
                const max = error.response?.data?.details?.maxPartySize;
                toast.error(`Exceeds maximum party size${max ? ` (${max})` : ""}`);
            } else {
                toast.error(message || "Failed to create walk-in");
            }
        },
    });
};

export const useAssignTable = (businessId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ reservationId, data }: { reservationId: string; data: AssignTableDto }) => {
            const resp = await assignTableApiCall(businessId, reservationId, data);
            return resp.data?.data ?? resp.data;
        },
        onSuccess: () => {
            toast.success("Table assigned successfully");
            queryClient.invalidateQueries({ queryKey: ["reservation-dashboard", businessId] });
            queryClient.invalidateQueries({ queryKey: ["reservations", businessId] });
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] });
            queryClient.invalidateQueries({ queryKey: ["tables", businessId] });
        },
        onError: (error: any) => {
            const code = error.response?.data?.code;
            const message = error.response?.data?.message;
            if (code === "table.not_found") {
                toast.error("Table not found");
            } else if (code === "table.capacity_exceeded") {
                toast.error("Table cannot accommodate this party size");
            } else if (code === "table.out_of_service") {
                toast.error("This table is currently out of service");
            } else if (code === "reservation.overlap") {
                toast.error("Another reservation is using this table at this time");
            } else {
                toast.error(message || "Failed to assign table");
            }
        },
    });
};

export const useCustomerLate = (businessId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ reservationId, data }: { reservationId: string; data: CustomerLateDto }) => {
            const resp = await recordCustomerLateApiCall(businessId, reservationId, data);
            return resp.data?.data ?? resp.data;
        },
        onSuccess: () => {
            toast.success("Delay noted");
            queryClient.invalidateQueries({ queryKey: ["reservation-events"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to record delay");
        },
    });
};

export const useReservationEvents = (businessId: string, reservationId: string) => {
    return useQuery({
        queryKey: ["reservation-events", businessId, reservationId],
        queryFn: async (): Promise<ReservationEvent[]> => {
            const resp = await fetchReservationEventsApiCall(businessId, reservationId);
            const data = resp.data?.data ?? resp.data;
            return Array.isArray(data) ? data : [];
        },
        enabled: !!businessId && !!reservationId,
    });
};
