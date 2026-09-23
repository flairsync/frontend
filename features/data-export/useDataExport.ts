import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import {
  listExportsApiCall,
  createExportApiCall,
  getExportDownloadUrlApiCall,
  BusinessExport,
  BusinessExportStatus,
} from "./service";

const exportsKey = (businessId: string) => ["business_exports", businessId];

/**
 * An export takes tens of seconds, so the list polls while anything is in flight and
 * stops once everything has settled. Without this the owner clicks "Export now" and the
 * page sits on PENDING until they reload, which reads as broken.
 */
export const useBusinessExports = (businessId: string) =>
  useQuery({
    queryKey: exportsKey(businessId),
    queryFn: () => listExportsApiCall(businessId),
    enabled: !!businessId,
    refetchInterval: (query) => {
      const data = query.state.data as BusinessExport[] | undefined;
      const inFlight = data?.some(
        (e) =>
          e.status === BusinessExportStatus.PENDING ||
          e.status === BusinessExportStatus.RUNNING,
      );
      return inFlight ? 5000 : false;
    },
  });

export const useCreateBusinessExport = (businessId: string) => {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (includeGuestData: boolean) =>
      createExportApiCall(businessId, includeGuestData),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: exportsKey(businessId) }),
  });
};

export const useDownloadBusinessExport = (businessId: string) => {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (exportId: string) =>
      getExportDownloadUrlApiCall(businessId, exportId),
    onSuccess: (data) => {
      // Navigate rather than fetch: the presigned URL carries a Content-Disposition
      // attachment header, so the browser downloads it directly without the bytes ever
      // passing through the app.
      window.location.href = data.url;
      // The download count changed server-side, so the list is now stale.
      queryClient.invalidateQueries({ queryKey: exportsKey(businessId) });
    },
  });
};
