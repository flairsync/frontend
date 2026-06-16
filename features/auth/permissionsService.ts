import flairapi from "@/lib/flairapi";

const baseUrl = `${'https://api.flairsync.com/api/v1'}/effective-employee-permissions`;

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
