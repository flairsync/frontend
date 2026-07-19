import { useQuery, useSuspenseQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchDiscoveryBusinessesApiCall,
    fetchDiscoveryProfileApiCall,
    fetchDiscoveryMenuApiCall,
    fetchDiscoveryTablesApiCall,
    submitReservationApiCall,
    submitOrderApiCall,
    fetchAllMyReservationsApiCall,
    fetchMyReservationsApiCall,
    fetchMyOrdersApiCall,
    fetchSingleOrderApiCall,
    reorderApiCall,
    cancelReservationApiCall,
    checkDiscoveryTableAvailabilityApiCall,
    fetchReservationTimelineApiCall,
    postReservationActionApiCall,
    fetchReviewsApiCall,
    fetchReviewStatsApiCall,
    fetchMyReviewApiCall,
    fetchMyReviewsApiCall,
    createReviewApiCall,
    updateReviewApiCall,
    deleteReviewApiCall,
    FetchDiscoveryBusinessesParams,
    FetchAllMyReservationsParams,
    FetchMyReservationsParams,
    FetchMyOrdersParams,
    FetchReviewsParams,
} from "./discovery.api";
import { CustomerActionPayload, CustomerTimelineResponse } from "./types";
import { toast } from "sonner";
import { DiscoveryBusiness } from "@/models/discovery/DiscoveryBusiness";
import { DiscoveryBusinessProfile } from "@/models/discovery/DiscoveryBusinessProfile";
import { BusinessMenu } from "@/models/business/menu/BusinessMenu";
import { FloorPlanLayout } from "@/features/floor-plan/components/types";
import { usePageContext } from "vike-react/usePageContext";

export const useDiscoverySearch = (params: FetchDiscoveryBusinessesParams) => {
    return useQuery({
        queryKey: ["discovery_search", params],
        queryFn: async () => {
            const res = await fetchDiscoveryBusinessesApiCall(params);
            return {
                businesses: DiscoveryBusiness.parseApiArrayResponse(res.data),
                total: res.total ?? res.data.length,
                page: res.current ?? 1,
                limit: res.limit ?? 10,
            };
        },
        refetchOnWindowFocus: false,
    });
};

// Suspense variant of useDiscoverySearch, for the public feed page's SSR-rendered
// first paint (used with vike-react-query's withFallback). Same queryKey/queryFn
// shape as useDiscoverySearch so both hit the same cache entry.
export const useSuspenseDiscoverySearch = (params: FetchDiscoveryBusinessesParams) => {
    return useSuspenseQuery({
        queryKey: ["discovery_search", params],
        queryFn: async () => {
            const res = await fetchDiscoveryBusinessesApiCall(params);
            return {
                businesses: DiscoveryBusiness.parseApiArrayResponse(res.data),
                total: res.total ?? res.data.length,
                page: res.current ?? 1,
                limit: res.limit ?? 10,
            };
        },
        refetchOnWindowFocus: false,
    });
};

// Suspense variant that fetches a business's public profile + menu together in one
// query, for the business detail page's SSR-rendered first paint (used with
// vike-react-query's withFallback) — a single suspense boundary for both rather than
// two separate ones.
export const useSuspenseBusinessPageData = (businessId: string) => {
    return useSuspenseQuery({
        queryKey: ["business_page", businessId],
        queryFn: async () => {
            const [profileData, menuRaw] = await Promise.all([
                fetchDiscoveryProfileApiCall(businessId),
                fetchDiscoveryMenuApiCall(businessId),
            ]);
            const menuData = Array.isArray(menuRaw) ? menuRaw[0] : menuRaw;
            const profile = DiscoveryBusinessProfile.parseApiResponse(profileData);
            if (!profile) throw new Error("Business not found");
            return {
                profile,
                menu: BusinessMenu.parseApiResponse(menuData),
            };
        },
    });
};

export const useInfiniteDiscoverySearch = (params: Omit<FetchDiscoveryBusinessesParams, 'page'>) => {
    return useInfiniteQuery({
        queryKey: ["discovery_search_infinite", params],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await fetchDiscoveryBusinessesApiCall({ ...params, page: pageParam as number });
            return {
                businesses: DiscoveryBusiness.parseApiArrayResponse(res.data),
                total: res.total ?? res.data.length,
                page: res.current ?? 1,
                limit: res.limit ?? 10,
            };
        },
        getNextPageParam: (lastPage) => {
            const { page, limit, total } = lastPage;
            if (page * limit < total) return page + 1;
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
            const data = await fetchDiscoveryProfileApiCall(businessId);
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
            const data = await fetchDiscoveryMenuApiCall(businessId);
            const menuData = Array.isArray(data) ? data[0] : data;
            return BusinessMenu.parseApiResponse(menuData);
        },
        enabled: !!businessId,
        // Diners can browse for a while before ordering — poll so item
        // availability (e.g. auto-disabled out-of-stock items) and newly
        // added items/combos show up without a manual refresh.
        refetchInterval: 2 * 60_000,
    });
};

export const useDiscoveryTables = (businessId: string | undefined) => {
    return useQuery({
        queryKey: ["discovery_tables", businessId],
        queryFn: async () => {
            if (!businessId) return [];
            const data = await fetchDiscoveryTablesApiCall(businessId);
            return (data?.layouts ?? data ?? []) as FloorPlanLayout[];
        },
        enabled: !!businessId,
    });
};

export interface DiscoveryTableRecord {
    id: string;
    name: string;
    number: number;
    capacity: number;
    floorId: string;
    status?: string;
    position?: {
        x: number;
        y: number;
        shape: 'circle' | 'square' | 'rectangle';
        width?: number;
        height?: number;
        rotation?: number;
    };
}

export interface DiscoveryElementRecord {
    id: string;
    type: string;
    label?: string;
    position?: {
        x: number;
        y: number;
        width?: number;
        height?: number;
        rotation?: number;
    };
}

export interface DiscoveryFloor {
    id: string;
    name: string;
    description?: string;
    order?: number;
    tables?: DiscoveryTableRecord[];
    elements?: DiscoveryElementRecord[];
}

export const useDiscoveryFloors = (businessId: string | undefined) => {
    return useQuery({
        queryKey: ["discovery_floors", businessId],
        queryFn: async () => {
            if (!businessId) return [];
            const data = await fetchDiscoveryTablesApiCall(businessId);
            const raw = data?.layouts ?? data;
            const arr: any[] = Array.isArray(raw) ? raw : [];
            if (arr.length > 0 && arr[0].tables !== undefined) {
                return arr as DiscoveryFloor[];
            }
            if (arr.length > 0 && arr[0].floorId !== undefined) {
                const byFloor: Record<string, DiscoveryFloor> = {};
                arr.forEach((t: DiscoveryTableRecord) => {
                    const fid = t.floorId ?? 'default';
                    if (!byFloor[fid]) byFloor[fid] = { id: fid, name: 'Main Floor', tables: [] };
                    byFloor[fid].tables!.push(t);
                });
                return Object.values(byFloor) as DiscoveryFloor[];
            }
            return [] as DiscoveryFloor[];
        },
        enabled: !!businessId,
    });
};

export const useDiscoveryTableAvailability = (businessId: string | undefined, params: { date: string, guestCount: number }, enabled: boolean) => {
    return useQuery({
        queryKey: ["discovery_table_availability", businessId, params],
        queryFn: async () => {
            if (!businessId) return [];
            const data = await checkDiscoveryTableAvailabilityApiCall(businessId, params);
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

export const useAllMyReservations = (params?: FetchAllMyReservationsParams) => {
    return useQuery({
        queryKey: ["all_my_reservations", params],
        queryFn: async () => {
            const res = await fetchAllMyReservationsApiCall(params);
            return {
                data: res.data,
                page: res.current,
                totalPages: res.pages,
            };
        },
    });
};

export const useMyReservations = (params?: FetchMyReservationsParams | string) => {
    const fetchParams = typeof params === 'string' ? { businessId: params } : (params || {});
    const pageContext = usePageContext();
    const isLoggedIn = !!pageContext.user;

    return useQuery({
        queryKey: ["my_reservations", fetchParams],
        queryFn: async () => {
            const data = await fetchMyReservationsApiCall(fetchParams);
            return Array.isArray(data) ? data : [];
        },
        enabled: isLoggedIn,
    });
};

export const useMyOrders = (businessId: string | undefined, params?: FetchMyOrdersParams) => {
    return useQuery({
        queryKey: ["my_orders", businessId, params],
        queryFn: async () => {
            if (!businessId) return { data: [], page: 1, totalPages: 1 };
            const res = await fetchMyOrdersApiCall(businessId, params);
            return {
                data: res.data,
                page: res.current,
                totalPages: res.pages,
            };
        },
        enabled: !!businessId,
    });
};

export const useSingleOrder = (businessId: string | undefined, orderId: string | undefined) => {
    return useQuery({
        queryKey: ["my_order", businessId, orderId],
        queryFn: async () => {
            if (!businessId || !orderId) return null;
            return fetchSingleOrderApiCall(businessId, orderId);
        },
        enabled: !!businessId && !!orderId,
    });
};

export const useReorder = (businessId: string) => {
    return useMutation({
        mutationFn: async ({ orderId, payload }: { orderId: string; payload?: { type?: string; tableId?: string } }) => {
            const res = await reorderApiCall(businessId, orderId, payload);
            return res.data;
        },
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
            return fetchReservationTimelineApiCall(businessId, reservationId);
        },
        enabled: !!businessId && !!reservationId,
        refetchInterval: (query) => {
            const status = query.state.data?.reservation?.status?.toLowerCase();
            if (status && TERMINAL_STATUSES.includes(status)) return false;
            return 30_000;
        },
    });
};

export const useReviews = (businessId: string | undefined, params?: FetchReviewsParams) => {
    return useQuery({
        queryKey: ["reviews", businessId, params],
        queryFn: async () => {
            if (!businessId) return { data: [], page: 1, totalPages: 1 };
            const res = await fetchReviewsApiCall(businessId, params);
            return {
                data: res.data,
                page: res.current,
                totalPages: res.pages,
            };
        },
        enabled: !!businessId,
    });
};

export const useReviewStats = (businessId: string | undefined) => {
    return useQuery({
        queryKey: ["review_stats", businessId],
        queryFn: async () => {
            if (!businessId) return null;
            return fetchReviewStatsApiCall(businessId);
        },
        enabled: !!businessId,
    });
};

export const useMyReview = (businessId: string | undefined, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["my_review", businessId],
        queryFn: async () => {
            if (!businessId) return null;
            return fetchMyReviewApiCall(businessId);
        },
        enabled: !!businessId && enabled,
    });
};

export const useMyReviews = () => {
    return useQuery({
        queryKey: ["my_reviews"],
        queryFn: async () => {
            const res = await fetchMyReviewsApiCall();
            return res.data;
        },
    });
};

export const useCreateReview = (businessId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { rating: number; comment?: string }) => {
            const res = await createReviewApiCall(businessId, payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews", businessId] });
            queryClient.invalidateQueries({ queryKey: ["review_stats", businessId] });
            queryClient.invalidateQueries({ queryKey: ["my_review", businessId] });
        },
    });
};

export const useUpdateReview = (businessId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ reviewId, payload }: { reviewId: string; payload: { rating?: number; comment?: string } }) => {
            const res = await updateReviewApiCall(businessId, reviewId, payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews", businessId] });
            queryClient.invalidateQueries({ queryKey: ["review_stats", businessId] });
            queryClient.invalidateQueries({ queryKey: ["my_review", businessId] });
        },
    });
};

export const useDeleteReview = (businessId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (reviewId: string) => {
            const res = await deleteReviewApiCall(businessId, reviewId);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews", businessId] });
            queryClient.invalidateQueries({ queryKey: ["review_stats", businessId] });
            queryClient.invalidateQueries({ queryKey: ["my_review", businessId] });
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
