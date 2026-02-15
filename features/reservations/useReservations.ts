import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    fetchReservationsApiCall,
    createReservationApiCall,
    fetchReservationDetailsApiCall,
    updateReservationApiCall,
    CreateReservationDto,
    UpdateReservationDto
} from "./service";

export const useReservations = (businessId: string) => {
    const queryClient = useQueryClient();

    const { data: reservations, isFetching: fetchingReservations, refetch } = useQuery({
        queryKey: ["reservations", businessId],
        queryFn: async () => {
            try {
                const resp = await fetchReservationsApiCall(businessId);
                const resData = resp.data;
                const actualData = resData?.data !== undefined ? resData.data : resData;

                if (actualData && actualData.data && Array.isArray(actualData.data)) return actualData.data;
                return Array.isArray(actualData) ? actualData : [];
            } catch (error) {
                console.warn("Failed to fetch reservations:", error);
                return [];
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

    return {
        reservations,
        fetchingReservations,
        refetchReservations: refetch,
        createReservation: createReservationMutation.mutate,
        isCreatingReservation: createReservationMutation.isPending,
        updateReservation: updateReservationMutation.mutate,
        isUpdatingReservation: updateReservationMutation.isPending,
    };
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
