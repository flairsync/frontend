import flairapi from "@/lib/flairapi";

const BASE_URL = `${import.meta.env.BASE_URL}/businesses`;

export interface CreateTeamPayload {
    name: string;
    colorCode?: string;
}

export interface UpdateTeamPayload {
    name?: string;
    colorCode?: string;
}

export const fetchTeamsApiCall = async (businessId: string) => {
    return flairapi.get(`${BASE_URL}/${businessId}/teams`);
};

export const fetchTeamApiCall = async (businessId: string, teamId: string) => {
    return flairapi.get(`${BASE_URL}/${businessId}/teams/${teamId}`);
};

export const createTeamApiCall = async (businessId: string, payload: CreateTeamPayload) => {
    return flairapi.post(`${BASE_URL}/${businessId}/teams`, payload);
};

export const updateTeamApiCall = async (businessId: string, teamId: string, payload: UpdateTeamPayload) => {
    return flairapi.patch(`${BASE_URL}/${businessId}/teams/${teamId}`, payload);
};

export const deleteTeamApiCall = async (businessId: string, teamId: string) => {
    return flairapi.delete(`${BASE_URL}/${businessId}/teams/${teamId}`);
};

export const assignStaffToTeamApiCall = async (businessId: string, teamId: string, employmentId: string) => {
    return flairapi.post(`${BASE_URL}/${businessId}/teams/${teamId}/employments/${employmentId}`);
};

export const removeStaffFromTeamApiCall = async (businessId: string, teamId: string, employmentId: string) => {
    return flairapi.delete(`${BASE_URL}/${businessId}/teams/${teamId}/employments/${employmentId}`);
};
