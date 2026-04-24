import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchDiscoveryBusinessesApiCall,
    fetchDiscoveryProfileApiCall,
    fetchDiscoveryMenuApiCall,
    fetchDiscoveryTablesApiCall,
    submitReservationApiCall,
    submitOrderApiCall,
    fetchMyReservationsApiCall,
    fetchMyOrdersApiCall,
    cancelReservationApiCall,
    checkDiscoveryTableAvailabilityApiCall,
    fetchReservationTimelineApiCall,
    postReservationActionApiCall,
    FetchDiscoveryBusinessesParams,
    FetchMyReservationsParams,
} from "./discovery.api";
import { CustomerActionPayload, CustomerTimelineResponse } from "./types";
import { toast } from "sonner";
import { DiscoveryBusiness } from "@/models/discovery/DiscoveryBusiness";
import { DiscoveryBusinessProfile } from "@/models/discovery/DiscoveryBusinessProfile";
import { BusinessMenu } from "@/models/business/menu/BusinessMenu";
import { FloorPlanLayout } from "@/features/floor-plan/components/types";

export const useDiscoverySearch = (params: FetchDiscoveryBusinessesParams) => {
    return useQuery({
        queryKey: ["discovery_search", params],
        queryFn: async () => {
            const res = await fetchDiscoveryBusinessesApiCall(params);
            const rawBody = res.data;

            // Handle nested data structures like { data: { data: [...], current: 1, total: 10 } }
            const nestedData = rawBody.data;
            const businessesData = Array.isArray(nestedData)
                ? nestedData
                : (nestedData?.data || rawBody.businesses || []);

            return {
                businesses: DiscoveryBusiness.parseApiArrayResponse(businessesData),
                total: nestedData?.total || rawBody.total || 0,
                page: nestedData?.current || nestedData?.page || rawBody.page || 1,
                limit: nestedData?.limit || rawBody.limit || 10,
            };
        },
        // Don't refetch on window focus for discovery search to save bandwidth
        refetchOnWindowFocus: false,
    });
};

export const useInfiniteDiscoverySearch = (params: Omit<FetchDiscoveryBusinessesParams, 'page'>) => {
    return useInfiniteQuery({
        queryKey: ["discovery_search_infinite", params],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await fetchDiscoveryBusinessesApiCall({ ...params, page: pageParam as number });
            const rawBody = res.data;

            const nestedData = rawBody.data;
            const businessesData = Array.isArray(nestedData)
                ? nestedData
                : (nestedData?.data || rawBody.businesses || []);

            return {
                businesses: DiscoveryBusiness.parseApiArrayResponse(businessesData),
                total: nestedData?.total || rawBody.total || 0,
                page: nestedData?.current || nestedData?.page || rawBody.page || 1,
                limit: nestedData?.limit || rawBody.limit || 10,
            };
        },
        getNextPageParam: (lastPage) => {
            const { page, limit, total } = lastPage;
            if (page * limit < total) {
                return page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        refetchOnWindowFocus: false,
    });
};

export const useDiscoveryProfile = (businessId: string | undefined) => {
    return useQuery({
        queryKey: ["discovery_profile", businessId],
        queryFn: async () => {
            if (!businessId) return null;
            const res = await fetchDiscoveryProfileApiCall(businessId);
            const data = res.data.data || res.data;
            return DiscoveryBusinessProfile.parseApiResponse(data);
        },
        enabled: !!businessId,
    });
};

export const useDiscoveryMenu = (businessId: string | undefined) => {
    return useQuery({
        queryKey: ["discovery_menu", businessId],
        queryFn: async () => {
            if (!businessId) return null;
            const res = await fetchDiscoveryMenuApiCall(businessId);
            const data = res.data.data || res.data;
            const menuData = Array.isArray(data) ? data[0] : data;
            return BusinessMenu.parseApiResponse(menuData);
        },
        enabled: !!businessId,
    });
};

export const useDiscoveryTables = (businessId: string | undefined) => {
    return useQuery({
        queryKey: ["discovery_tables", businessId],
        queryFn: async () => {
            if (!businessId) return [];
            const res = await fetchDiscoveryTablesApiCall(businessId);
            const data = res.data.data || res.data;
            // Depending on the API, this could just be FloorPlanLayout[]
            return (data.layouts || data || []) as FloorPlanLayout[];
        },
        enabled: !!businessId,
    });
};

export const useDiscoveryTableAvailability = (businessId: string | undefined, params: { date: string, guestCount: number }, enabled: boolean) => {
    return useQuery({
        queryKey: ["discovery_table_availability", businessId, params],
        queryFn: async () => {
            if (!businessId) return [];
            const res = await checkDiscoveryTableAvailabilityApiCall(businessId, params);
            const data = res.data.data || res.data;
            return Array.isArray(data) ? data : [];
        },
        enabled: enabled && !!businessId,
    });
};

export const useSubmitReservation = (businessId: string) => {
    return useMutation({
        mutationFn: async (payload: Record<string, any>) => {
            const res = await submitReservationApiCall(businessId, payload);
            return res.data;
        },
    });
};

export const useSubmitOrder = (businessId: string) => {
    return useMutation({
        mutationFn: async (payload: Record<string, any>) => {
            const res = await submitOrderApiCall(businessId, payload);
            return res.data;
        },
    });
};

export const useMyReservations = (params?: FetchMyReservationsParams | string) => {
    const fetchParams = typeof params === 'string' ? { businessId: params } : (params || {});

    return useQuery({
        queryKey: ["my_reservations", fetchParams],
        queryFn: async () => {
            const res = await fetchMyReservationsApiCall(fetchParams);
            // Handle both { data: { data: [] } } and { data: [] }
            const data = res.data.data?.data || res.data.data || res.data;
            return Array.isArray(data) ? data : [];
        },
    });
};

export const useMyOrders = (businessId: string | undefined) => {
    return useQuery({
        queryKey: ["my_orders", businessId],
        queryFn: async () => {
            if (!businessId) return [];
            const res = await fetchMyOrdersApiCall(businessId);
            // Handle both { data: { data: [] } } and { data: [] }
            const data = res.data.data?.data || res.data.data || res.data;
            return Array.isArray(data) ? data : [];
        },
        enabled: !!businessId,
    });
};

export const useCancelReservation = (businessId?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: { businessId: string, reservationId: string }) => {
            const res = await cancelReservationApiCall(payload.businessId, payload.reservationId);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my_reservations"] });
        },
    });
};

const TERMINAL_STATUSES = ['completed', 'cancelled', 'no_show', 'expired'];

export const useReservationTimeline = (businessId: string, reservationId: string) => {
    return useQuery({
        queryKey: ["reservation_timeline", businessId, reservationId],
        queryFn: async (): Promise<CustomerTimelineResponse> => {
            const res = await fetchReservationTimelineApiCall(businessId, reservationId);
            return res.data?.data ?? res.data;
        },
        enabled: !!businessId && !!reservationId,
        refetchInterval: (query) => {
            const status = query.state.data?.reservation?.status?.toLowerCase();
            if (status && TERMINAL_STATUSES.includes(status)) return false;
            return 30_000;
        },
    });
};

export const useReservationAction = (businessId: string, reservationId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CustomerActionPayload) => {
            const res = await postReservationActionApiCall(businessId, reservationId, payload);
            return res.data?.data ?? res.data;
        },
        onSuccess: (data) => {
            // Optimistically merge the new event + updated actions into cached query data
            queryClient.setQueryData(
                ["reservation_timeline", businessId, reservationId],
                (old: CustomerTimelineResponse | undefined) => {
                    if (!old) return old;
                    return {
                        ...old,
                        events: [...old.events, data.event],
                        availableActions: data.availableActions,
                    };
                }
            );
        },
        onError: (error: any) => {
            const code = error.response?.data?.code;
            if (code === 'reservation.not_found') {
                toast.error("Reservation not found.");
            } else if (code === 'reservation.forbidden') {
                toast.error("This reservation doesn't belong to your account.");
            } else if (code === 'reservation.action_not_allowed') {
                toast.error("This action is no longer available. Please refresh.");
                queryClient.invalidateQueries({ queryKey: ["reservation_timeline", businessId, reservationId] });
            } else {
                toast.error(error.response?.data?.message || "Action failed. Please try again.");
            }
        },
    });
};
