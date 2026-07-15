import flairapi from "@/lib/flairapi";

export type JoinRequestChildType = "BUSINESS" | "REGION";
export type JoinRequestParentType = "REGION" | "ORGANIZATION";
export type JoinRequestStatus = "PENDING" | "APPROVED" | "DECLINED" | "CANCELLED";
export type JoinRequestAction = "LINK" | "UNLINK";

export interface JoinRequest {
    id: string;
    childType: JoinRequestChildType;
    childId: string;
    childName: string;
    parentType: JoinRequestParentType;
    parentId: string;
    parentName: string;
    initiatedBy: "CHILD" | "PARENT";
    action: JoinRequestAction;
    status: JoinRequestStatus;
    requestedByUserId: string;
    respondedByUserId: string | null;
    childOwnerId: string;
    parentOwnerId: string;
    createdAt: string;
    respondedAt: string | null;
}

export interface CreateJoinRequestPayload {
    childType: JoinRequestChildType;
    childId: string;
    parentType: JoinRequestParentType;
    parentId: string;
}

export interface BusinessSearchResult {
    id: string;
    name: string;
    description: string | null;
    city: string | null;
    state: string | null;
    logo: string | null;
    createdAt: string;
    media: { id: string; url: string; order: number }[];
    alreadyLinked: boolean;
}

export interface BusinessSearchResponse {
    businesses: BusinessSearchResult[];
    total: number;
    page: number;
    limit: number;
}

export interface RegionSearchResult {
    id: string;
    name: string;
    createdAt: string;
    businessCount: number;
    alreadyLinked: boolean;
}

export interface RegionSearchResponse {
    regions: RegionSearchResult[];
    total: number;
    page: number;
    limit: number;
}

export interface OrganizationSearchResult {
    id: string;
    name: string;
    createdAt: string;
    businessCount: number;
}

export interface OrganizationSearchResponse {
    organizations: OrganizationSearchResult[];
    total: number;
    page: number;
    limit: number;
}

const baseUrl = `${'https://api.flairsync.com/api/v1'}/join-requests`;

export const joinRequestsApi = {
    create: (payload: CreateJoinRequestPayload) =>
        flairapi.post(baseUrl, payload).then((r) => r.data.data as JoinRequest),

    incoming: () =>
        flairapi.get(`${baseUrl}/incoming`).then((r) => r.data.data as JoinRequest[]),

    outgoing: () =>
        flairapi.get(`${baseUrl}/outgoing`).then((r) => r.data.data as JoinRequest[]),

    approve: (id: string) =>
        flairapi.post(`${baseUrl}/${id}/approve`).then((r) => r.data.data as JoinRequest),

    decline: (id: string) =>
        flairapi.post(`${baseUrl}/${id}/decline`).then((r) => r.data.data as JoinRequest),

    cancel: (id: string) =>
        flairapi.post(`${baseUrl}/${id}/cancel`).then((r) => r.data.data as JoinRequest),

    unlink: (childType: JoinRequestChildType, childId: string) =>
        flairapi.delete(`${baseUrl}/link/${childType}/${childId}`),

    requestLeave: (childType: JoinRequestChildType, childId: string) =>
        flairapi.post(`${baseUrl}/leave`, { childType, childId }).then((r) => r.data.data as JoinRequest),

    searchBusinesses: (countryId: number, city: string, name: string, page: number = 1, limit: number = 20) =>
        flairapi
            .get(`${baseUrl}/search-businesses`, { params: { countryId, city: city || undefined, name: name || undefined, page, limit } })
            .then((r) => r.data.data as BusinessSearchResponse),

    searchRegions: (name: string, page: number = 1, limit: number = 20) =>
        flairapi
            .get(`${baseUrl}/search-regions`, { params: { name: name || undefined, page, limit } })
            .then((r) => r.data.data as RegionSearchResponse),

    searchOrganizations: (name: string, page: number = 1, limit: number = 20) =>
        flairapi
            .get(`${baseUrl}/search-organizations`, { params: { name: name || undefined, page, limit } })
            .then((r) => r.data.data as OrganizationSearchResponse),
};
