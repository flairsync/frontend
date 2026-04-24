import flairapi from "@/lib/flairapi";
const baseUrl = `${import.meta.env.BASE_URL}`;
const auditLogsUrl = `${baseUrl}/audit-logs`;
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface AuditLog {
  id: string;
  businessId: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  changedBy: string;
  reason: string | null;
  changes: Record<string, { old: unknown; new: unknown }> | null;
  createdAt: string;
  // Included if the backend joins the user info
  actor?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface FetchAuditLogsParams {
  businessId: string;
  entityType?: string;
  entityId?: string;
  action?: AuditAction;
  changedBy?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const fetchAuditLogsApiCall = (params: FetchAuditLogsParams) => {
  return flairapi.get(auditLogsUrl, { params });
};
