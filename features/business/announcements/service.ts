import flairapi from "@/lib/flairapi";
import { unwrap, unwrapPaginated, PaginatedData } from "@/features/shared/api-response";
import { AnnouncementInboxItem, AnnouncementKind, AnnouncementAudienceType, SentAnnouncement, GlobalInboxBusiness } from "@/models/business/Announcement";

const apiRoot = 'https://api.flairsync.com/api/v1';

const baseUrl = (businessId: string) =>
    `${apiRoot}/businesses/${businessId}/announcements`;

export interface CreateAnnouncementPayload {
    kind: AnnouncementKind;
    title: string;
    content: string;
    audienceType: AnnouncementAudienceType;
    teamId?: string;
    staffEmploymentIds?: string[];
    expiresAt?: string;
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
    params?: { page?: number; limit?: number; kind?: AnnouncementKind },
): Promise<PaginatedData<AnnouncementInboxItem>> =>
    unwrapPaginated(await flairapi.get(`${baseUrl(businessId)}/inbox`, { params }));

export const markAnnouncementReadApiCall = async (businessId: string, recipientId: string) =>
    flairapi.patch(`${baseUrl(businessId)}/inbox/${recipientId}/read`);

// Cross-business preview: latest 3 messages per joined business, no businessId needed.
export const fetchGlobalAnnouncementsInboxApiCall = async (): Promise<GlobalInboxBusiness[]> =>
    unwrap(await flairapi.get(`${apiRoot}/announcements/inbox`));
