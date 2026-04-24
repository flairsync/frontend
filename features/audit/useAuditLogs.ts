import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogsApiCall, AuditLog, FetchAuditLogsParams } from "./service";

export const useLatestAuditLog = (businessId: string | undefined, entityType: string, entityId: string | undefined) => {
  return useQuery({
    queryKey: ["audit_logs", businessId, entityType, entityId, "latest"],
    queryFn: async () => {
      if (!businessId || !entityId) return null;
      
      const response = await fetchAuditLogsApiCall({
        businessId,
        entityType,
        entityId,
        limit: 1,
        page: 1,
      });
      
      const logs = response.data.data.data as AuditLog[];
      return logs.length > 0 ? logs[0] : null;
    },
    enabled: !!businessId && !!entityId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useAuditLogs = (params: FetchAuditLogsParams) => {
  return useQuery({
    queryKey: ["audit_logs", "list", params],
    queryFn: async () => {
      const response = await fetchAuditLogsApiCall(params);
      return response.data.data as { data: AuditLog[]; current: number; pages: number };
    },
    enabled: !!params.businessId,
    staleTime: 1000 * 60 * 2,
  });
};
