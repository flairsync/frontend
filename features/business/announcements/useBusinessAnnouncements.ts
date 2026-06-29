import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
    createAnnouncementApiCall,
    fetchSentAnnouncementsApiCall,
    deleteAnnouncementApiCall,
    CreateAnnouncementPayload,
} from "./service";
import { AnnouncementKind } from "@/models/business/Announcement";

const SENT_PAGE_SIZE = 10;

export const useBusinessAnnouncements = (businessId: string, kind?: AnnouncementKind) => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);

    const { data, isPending: loadingAnnouncements, isFetching } = useQuery({
        queryKey: ["business_announcements", businessId, kind, page],
        queryFn: () =>
            fetchSentAnnouncementsApiCall(businessId, { page, limit: SENT_PAGE_SIZE, kind }),
        enabled: !!businessId,
    });

    const { mutateAsync: createAnnouncement, isPending: creatingAnnouncement } = useMutation({
        mutationFn: (payload: CreateAnnouncementPayload) =>
            createAnnouncementApiCall(businessId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["business_announcements", businessId] });
        },
    });

    const { mutateAsync: deleteAnnouncement, isPending: deletingAnnouncement } = useMutation({
        mutationFn: (id: string) => deleteAnnouncementApiCall(businessId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["business_announcements", businessId] });
        },
    });

    return {
        announcements: data?.data ?? [],
        currentPage: data?.current ?? page,
        totalPages: data?.pages ?? 1,
        setPage,
        loadingAnnouncements,
        isFetching,
        createAnnouncement,
        creatingAnnouncement,
        deleteAnnouncement,
        deletingAnnouncement,
    };
};
