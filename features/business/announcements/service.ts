import flairapi from "@/lib/flairapi";
import { unwrap, unwrapPaginated, PaginatedData } from "@/features/shared/api-response";
import { AnnouncementInboxItem, AnnouncementKind, AnnouncementAudienceType, SentAnnouncement } from "@/models/business/Announcement";

const baseUrl = (businessId: string) =>
    `${'https://api.flairsync.com/api/v1'}/businesses/${businessId}/announcements`;

export interface CreateAnnouncementPayload {
    kind: AnnouncementKind;
    title: string;
    content: string;
    audienceType: AnnouncementAudienceType;
    teamId?: string;
    staffEmploymentIds?: string[];
}

export const createAnnouncementApiCall = async (
    businessId: string,
    payload: CreateAnnouncementPayload,
): Promise<SentAnnouncement> => unwrap(await flairapi.post(baseUrl(businessId), payload));

export const fetchSentAnnouncementsApiCall = async (
    businessId: string,
    params?: { page?: number; limit?: number; kind?: AnnouncementKind },
): Promise<PaginatedData<SentAnnouncement>> =>
    unwrapPaginated(await flairapi.get(baseUrl(businessId), { params }));

export const deleteAnnouncementApiCall = async (businessId: string, id: string) =>
    flairapi.delete(`${baseUrl(businessId)}/${id}`);

export const fetchAnnouncementsInboxApiCall = async (
    businessId: string,
    params?: { kind?: AnnouncementKind },
): Promise<AnnouncementInboxItem[]> =>
    unwrap(await flairapi.get(`${baseUrl(businessId)}/inbox`, { params }));

export const markAnnouncementReadApiCall = async (businessId: string, recipientId: string) =>
    flairapi.patch(`${baseUrl(businessId)}/inbox/${recipientId}/read`);
