import { useQuery } from "@tanstack/react-query";
import { fetchMyPermissionsApiCall } from "./permissionsService";

export const usePermissions = (businessId?: string) => {
    const {
        data: permissions,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["permissions", businessId],
        queryFn: async () => {
            if (!businessId) return {};
            const res = await fetchMyPermissionsApiCall(businessId);
            return res.data;
        },
        enabled: !!businessId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const hasPermission = (key: string, action: "read" | "create" | "update" | "delete") => {
        if (!permissions) return false;
        return permissions[key]?.[action] === true;
    };

    return {
        permissions,
        isLoading,
        error,
        hasPermission,
    };
};
