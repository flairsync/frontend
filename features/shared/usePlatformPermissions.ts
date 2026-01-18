import { useQuery } from "@tanstack/react-query";
import { getPermissionsListApiCall } from "./service";
import { Permission } from "@/models/business/roles/Permission";

export const usePlatformPermissions = () => {
  const { data: permissionsList, isPending: loadingPermissionsList } = useQuery(
    {
      queryKey: ["permissions_list"],
      queryFn: async () => {
        const permsD = await getPermissionsListApiCall();
        return Permission.parseApiArrayResponse(permsD.data.data);
      },
      gcTime: Infinity,
      staleTime: Infinity,
    }
  );

  return {
    permissionsList,
    loadingPermissionsList,
  };
};
