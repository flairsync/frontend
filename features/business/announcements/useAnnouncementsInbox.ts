import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
    fetchAnnouncementsInboxApiCall,
    fetchGlobalAnnouncementsInboxApiCall,
    markAnnouncementReadApiCall,
} from "./service";

export const useAnnouncementsInbox = (businessId: string, page: number = 1, limit: number = 20) => {
    const queryClient = useQueryClient();

    const { data, isPending: loadingInbox } = useQuery({
        queryKey: ["announcements_inbox", businessId, page, limit],
        queryFn: () => fetchAnnouncementsInboxApiCall(businessId, { page, limit }),
        enabled: !!businessId,
        placeholderData: keepPreviousData,
    });

    const { mutate: markAsRead, isPending: markingAsRead } = useMutation({
        mutationFn: (recipientId: string) => markAnnouncementReadApiCall(businessId, recipientId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["announcements_inbox", businessId] });
        },
    });

    return {
        items: data?.data ?? [],
        currentPage: data?.current ?? page,
        totalPages: data?.pages ?? 1,
        loadingInbox,
        markAsRead,
        markingAsRead,
    };
};

// Cross-business preview for the joined-businesses screen: latest 3 messages
// per business the user is actively employed at, no businessId needed.
export const useGlobalAnnouncementsInbox = () => {
    const { data: businesses, isPending: loadingGlobalInbox } = useQuery({
        queryKey: ["announcements_global_inbox"],
        queryFn: () => fetchGlobalAnnouncementsInboxApiCall(),
    });

    return {
        businesses: businesses ?? [],
        loadingGlobalInbox,
    };
};
