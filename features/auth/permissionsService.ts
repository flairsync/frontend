import flairapi from "@/lib/flairapi";

const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/effective-employee-permissions`;

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
