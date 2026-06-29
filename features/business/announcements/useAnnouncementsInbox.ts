import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAnnouncementsInboxApiCall, markAnnouncementReadApiCall } from "./service";

export const useAnnouncementsInbox = (businessId: string) => {
    const queryClient = useQueryClient();

    const { data: items, isPending: loadingInbox } = useQuery({
        queryKey: ["announcements_inbox", businessId],
        queryFn: () => fetchAnnouncementsInboxApiCall(businessId),
        enabled: !!businessId,
    });

    const { mutate: markAsRead, isPending: markingAsRead } = useMutation({
        mutationFn: (recipientId: string) => markAnnouncementReadApiCall(businessId, recipientId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["announcements_inbox", businessId] });
        },
    });

    return {
        items: items ?? [],
        loadingInbox,
        markAsRead,
        markingAsRead,
    };
};
