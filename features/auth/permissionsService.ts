import flairapi, { API_URL } from "@/lib/flairapi";

const baseUrl = `${API_URL}/effective-employee-permissions`;

export const fetchMyPermissionsApiCall = (businessId: string) => {
    return flairapi.get(`${baseUrl}/${businessId}`);
};

export type PermissionFlags = {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
};

export type EffectivePermissions = Record<string, PermissionFlags>;
