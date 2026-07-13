import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    fetchReservationsApiCall,
    createReservationApiCall,
    fetchReservationDetailsApiCall,
    updateReservationApiCall,
    cancelReservationForStaffApiCall,
    markReservationNoShowApiCall,
    findAvailabilityApiCall,
    lookupUserApiCall,
    CreateReservationDto,
    UpdateReservationDto,
    FetchReservationsDto
} from "./service";

export const useReservations = (businessId: string, filters?: FetchReservationsDto) => {
    const queryClient = useQueryClient();

    const { data: reservationsData, isFetching: fetchingReservations, refetch } = useQuery({
        queryKey: ["reservations", businessId, filters],
        queryFn: async () => {
            try {
                return await fetchReservationsApiCall(businessId, filters);
            } catch (error) {
                console.warn("Failed to fetch reservations:", error);
                return { data: [], current: 1, pages: 1 };
            }
        },
        enabled: !!businessId,
    });

    const createReservationMutation = useMutation({
        mutationFn: (data: CreateReservationDto) => createReservationApiCall(businessId, data),
        onSuccess: () => {
            toast.success("Reservation created successfully");
            queryClient.invalidateQueries({ queryKey: ["reservations", businessId] });
        },
        onError: (error: any) => {
            const code = error.response?.data?.code;
            const status = error.response?.status || error.status;
            if (code === "reservation.past_time") {
                toast.error("Reservation time must be in the future.");
            } else if (code === "reservation.capacity_exceeded" || (status === 400 && !code)) {
                toast.error("Guest count exceeds the selected table's maximum capacity.");
            } else if (status === 409) {
                toast.error("This table is already booked around this time. Please select another table or time.");
            } else if (status === 403) {
                toast.error("You do not have permission to manage reservations.");
            } else {
                toast.error(error.response?.data?.message || "Failed to create reservation");
            }
        },
    });

    const updateReservationMutation = useMutation({
        mutationFn: ({ reservationId, data }: { reservationId: string; data: UpdateReservationDto }) =>
            updateReservationApiCall(businessId, reservationId, data),
        onSuccess: () => {
            toast.success("Reservation updated successfully");
            queryClient.invalidateQueries({ queryKey: ["reservations", businessId] });
            // Tables might be marked as reserved
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] });
            queryClient.invalidateQueries({ queryKey: ["tables", businessId] });
            // A waitlist entry may have just been seated
            queryClient.invalidateQueries({ queryKey: ["waitlist", businessId] });
            queryClient.invalidateQueries({ queryKey: ["reservation-dashboard", businessId] });
        },
    });

    const reservationsArray = reservationsData?.data ?? [];
    const meta = { totalPages: reservationsData?.pages ?? 1, totalItems: reservationsArray.length };

    const cancelReservationMutation = useMutation({
        mutationFn: ({ reservationId, cancelReason }: { reservationId: string; cancelReason?: string }) =>
            cancelReservationForStaffApiCall(businessId, reservationId, cancelReason),
        onSuccess: () => {
            toast.success("Reservation cancelled successfully");
            queryClient.invalidateQueries({ queryKey: ["reservations", businessId] });
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] });
            queryClient.invalidateQueries({ queryKey: ["tables", businessId] });
        },
    });

    const markNoShowMutation = useMutation({
        mutationFn: (reservationId: string) =>
            markReservationNoShowApiCall(businessId, reservationId),
        onSuccess: () => {
            toast.success("Reservation marked as no-show");
            queryClient.invalidateQueries({ queryKey: ["reservations", businessId] });
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] });
            queryClient.invalidateQueries({ queryKey: ["tables", businessId] });
        },
    });

    return {
        reservations: reservationsArray,
        meta,
        fetchingReservations,
        refetchReservations: refetch,
        createReservation: createReservationMutation.mutate,
        isCreatingReservation: createReservationMutation.isPending,
        updateReservation: updateReservationMutation.mutate,
        isUpdatingReservation: updateReservationMutation.isPending,
        cancelReservation: cancelReservationMutation.mutate,
        isCancellingReservation: cancelReservationMutation.isPending,
        markNoShow: markNoShowMutation.mutate,
        isMarkingNoShow: markNoShowMutation.isPending,
    };
};

export const useAvailability = (businessId: string) => {
    return useMutation({
        mutationFn: async (data: { date: string; guestCount: number }): Promise<any[]> =>
            findAvailabilityApiCall(businessId, data.date, data.guestCount),
    });
};

export const useReservationDetails = (businessId: string, reservationId: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ["reservation", businessId, reservationId],
        queryFn: async () => {
            try {
                return await fetchReservationDetailsApiCall(businessId, reservationId);
            } catch (error) {
                console.warn("Failed to fetch reservation details:", error);
                return null;
            }
        },
        enabled: (options?.enabled !== false) && !!businessId && !!reservationId,
    });
};

export const useUserLookup = (email?: string, phone?: string) => {
    return useQuery({
        queryKey: ["user-lookup", email, phone],
        queryFn: async () => {
            if (!email && !phone) return null;
            try {
                return await lookupUserApiCall(email, phone);
            } catch (error) {
                console.warn("User lookup failed:", error);
                return null;
            }
        },
        enabled: !!email || !!phone,
        retry: false,
    });
};
