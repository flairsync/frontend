import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    fetchReservationsApiCall,
    createReservationApiCall,
    fetchReservationDetailsApiCall,
    updateReservationApiCall,
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
                const resp = await fetchReservationsApiCall(businessId, filters);
                return resp.data;
            } catch (error) {
                console.warn("Failed to fetch reservations:", error);
                return { data: [], meta: { totalPages: 1, totalItems: 0 } };
            }
        },
        enabled: !!businessId,
    });

    const createReservationMutation = useMutation({
        mutationFn: async (data: CreateReservationDto) => {
            const response = await createReservationApiCall(businessId, data);
            return response.data?.data !== undefined ? response.data.data : response.data;
        },
        onSuccess: () => {
            toast.success("Reservation created successfully");
            queryClient.invalidateQueries({ queryKey: ["reservations", businessId] });
        },
        onError: (error: any) => {
            const status = error.response?.status || error.status;
            if (status === 400) {
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
        },
    });

    // Extract arrays from backend response wrapping
    const actualData = reservationsData?.data !== undefined ? reservationsData.data : reservationsData;
    const reservationsArray = (actualData && actualData.data && Array.isArray(actualData.data))
        ? actualData.data
        : (Array.isArray(actualData) ? actualData : []);

    const meta = reservationsData?.meta || reservationsData?.data?.meta || { totalPages: 1, totalItems: reservationsArray.length };

    return {
        reservations: reservationsArray,
        meta,
        fetchingReservations,
        refetchReservations: refetch,
        createReservation: createReservationMutation.mutate,
        isCreatingReservation: createReservationMutation.isPending,
        updateReservation: updateReservationMutation.mutate,
        isUpdatingReservation: updateReservationMutation.isPending,
    };
};

export const useAvailability = (businessId: string) => {
    return useMutation({
        mutationFn: async (data: { date: string; guestCount: number }) => {
            const response = await findAvailabilityApiCall(businessId, data.date, data.guestCount);
            return response.data?.data || response.data || [];
        },
    });
};

export const useReservationDetails = (businessId: string, reservationId: string) => {
    return useQuery({
        queryKey: ["reservation", businessId, reservationId],
        queryFn: async () => {
            try {
                const resp = await fetchReservationDetailsApiCall(businessId, reservationId);
                return resp.data?.data || resp.data || null;
            } catch (error) {
                console.warn("Failed to fetch reservation details:", error);
                return null;
            }
        },
        enabled: !!businessId && !!reservationId,
    });
};

export const useUserLookup = (email?: string, phone?: string) => {
    return useQuery({
        queryKey: ["user-lookup", email, phone],
        queryFn: async () => {
            if (!email && !phone) return null;
            try {
                const resp = await lookupUserApiCall(email, phone);
                return resp.data?.data || null;
            } catch (error) {
                console.warn("User lookup failed:", error);
                return null;
            }
        },
        enabled: !!email || !!phone,
        retry: false,
    });
};
