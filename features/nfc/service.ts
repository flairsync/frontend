import flairapi, { API_URL } from "@/lib/flairapi";
import { unwrap, unwrapPaginated } from "../shared/api-response";

const baseBusinessUrl = `${API_URL}/businesses`;

const getNfcTagsUrl = (businessId: string) => {
    return `${baseBusinessUrl}/${businessId}/nfc-tags`;
};

// DTOs & Types
export type NfcTagStatusFilter = "unissued" | "linked" | "revoked";

export interface NfcTagFilters {
    status?: NfcTagStatusFilter;
    page?: number;
    limit?: number;
}

export type NfcTagActionType = "attendance_clock_in_out" | "pos_login";
export type NfcTagPosAccessMode = "basic" | "full";

export type NfcTagSelfRevokeReason = "lost" | "stolen";

export interface SelfRevokeNfcTagDto {
    reason: NfcTagSelfRevokeReason;
    note?: string;
    requestReplacement?: boolean;
}

export type NfcCardRequestReason = "new_staff_card" | "lost_replacement" | "other";

export interface CreateNfcCardRequestDto {
    reason: NfcCardRequestReason;
    note?: string;
}

export type NfcCardRequestStatusFilter = "pending" | "fulfilled" | "rejected";

export interface NfcCardRequestFilters {
    status?: NfcCardRequestStatusFilter;
    page?: number;
    limit?: number;
}

// API Calls - Tags
export const fetchNfcTagsApiCall = async (businessId: string, params?: NfcTagFilters) =>
    unwrapPaginated(await flairapi.get(`${getNfcTagsUrl(businessId)}`, { params }));

export const fetchNfcTagByIdApiCall = async (businessId: string, id: string) =>
    unwrap(await flairapi.get(`${getNfcTagsUrl(businessId)}/${id}`));

export const assignNfcTagEmploymentApiCall = (businessId: string, id: string, assignedEmploymentId: string | null) => {
    return flairapi.patch(`${getNfcTagsUrl(businessId)}/${id}/assignment`, { assignedEmploymentId });
};

export const assignNfcTagActionApiCall = (
    businessId: string,
    id: string,
    actionType: NfcTagActionType | null,
    posAccessMode?: NfcTagPosAccessMode | null,
) => {
    return flairapi.patch(`${getNfcTagsUrl(businessId)}/${id}/action`, { actionType, posAccessMode });
};

export const selfRevokeNfcTagApiCall = (businessId: string, id: string, data: SelfRevokeNfcTagDto) => {
    return flairapi.post(`${getNfcTagsUrl(businessId)}/${id}/self-revoke`, data);
};

// API Calls - Requests
export const createNfcCardRequestApiCall = (businessId: string, data: CreateNfcCardRequestDto) => {
    return flairapi.post(`${getNfcTagsUrl(businessId)}/requests`, data);
};

export const fetchNfcCardRequestsApiCall = async (businessId: string, params?: NfcCardRequestFilters) =>
    unwrapPaginated(await flairapi.get(`${getNfcTagsUrl(businessId)}/requests`, { params }));
