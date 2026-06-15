import { useQuery } from "@tanstack/react-query";
import { getPermissionsListApiCall } from "./service";
import { Permission } from "@/models/business/roles/Permission";

export const usePlatformPermissions = () => {
  const { data: permissionsList, isPending: loadingPermissionsList } = useQuery(
    {
      queryKey: ["permissions_list"],
      queryFn: async () => {
        const data = await getPermissionsListApiCall();
        return Permission.parseApiArrayResponse(data);
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
