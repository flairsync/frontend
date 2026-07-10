import flairapi from "@/lib/flairapi";
import { unwrap } from "../shared/api-response";
import { SitePageContent } from "./types";

const baseUrl = 'https://api.flairsync.com/api/v1';

const getSitePagesUrl = (businessId: string) => `${baseUrl}/businesses/${businessId}/site-pages`;
const getDiscoverySitePagesUrl = (businessId: string) => `${baseUrl}/discovery/businesses/${businessId}/site-pages`;

// ─── Owner (draft/publish CRUD) ────────────────────────────────────────────

export interface SitePageSummary {
    id: string;
    slug: string;
    title: string;
    order: number;
    isPublished: boolean;
    publishedAt?: string | null;
}

export interface SitePageDetail extends SitePageSummary {
    draftContent: SitePageContent | null;
    publishedContent: SitePageContent | null;
}

export interface CreateSitePageDto {
    slug: string;
    title: string;
}

export interface UpdateSitePageDto {
    title?: string;
    order?: number;
}

export const fetchSitePagesApiCall = async (businessId: string): Promise<SitePageSummary[]> =>
    unwrap(await flairapi.get(getSitePagesUrl(businessId)));

export const fetchSitePageApiCall = async (businessId: string, pageId: string): Promise<SitePageDetail> =>
    unwrap(await flairapi.get(`${getSitePagesUrl(businessId)}/${pageId}`));

export const createSitePageApiCall = (businessId: string, data: CreateSitePageDto) =>
    flairapi.post(getSitePagesUrl(businessId), data);

export const updateSitePageApiCall = (businessId: string, pageId: string, data: UpdateSitePageDto) =>
    flairapi.patch(`${getSitePagesUrl(businessId)}/${pageId}`, data);

export const saveSitePageDraftApiCall = (businessId: string, pageId: string, content: SitePageContent) =>
    flairapi.patch(`${getSitePagesUrl(businessId)}/${pageId}/draft`, content);

export const publishSitePageApiCall = (businessId: string, pageId: string) =>
    flairapi.post(`${getSitePagesUrl(businessId)}/${pageId}/publish`);

export const unpublishSitePageApiCall = (businessId: string, pageId: string) =>
    flairapi.post(`${getSitePagesUrl(businessId)}/${pageId}/unpublish`);

export const deleteSitePageApiCall = (businessId: string, pageId: string) =>
    flairapi.delete(`${getSitePagesUrl(businessId)}/${pageId}`);

// ─── Public (published only, no auth) ──────────────────────────────────────

export interface PublicSitePageSummary {
    slug: string;
    title: string;
    order: number;
}

export interface PublicSitePage {
    slug: string;
    title: string;
    publishedContent: SitePageContent;
    publishedAt: string;
}

export const fetchPublicSitePagesApiCall = async (businessId: string): Promise<PublicSitePageSummary[]> =>
    unwrap(await flairapi.get(getDiscoverySitePagesUrl(businessId)));

export const fetchPublicSitePageApiCall = async (businessId: string, slug: string): Promise<PublicSitePage> =>
    unwrap(await flairapi.get(`${getDiscoverySitePagesUrl(businessId)}/${slug}`));
