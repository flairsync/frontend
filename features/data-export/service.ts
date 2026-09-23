import flairapi, { API_URL, Timeouts } from "@/lib/flairapi";
import { unwrap } from "../shared/api-response";

const baseUrl = `${API_URL}`;

export enum BusinessExportStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  READY = "READY",
  FAILED = "FAILED",
  EXPIRED = "EXPIRED",
}

export enum BusinessExportTrigger {
  MANUAL = "MANUAL",
  SCHEDULED = "SCHEDULED",
}

export interface BusinessExport {
  id: string;
  status: BusinessExportStatus;
  trigger: BusinessExportTrigger;
  includeGuestData: boolean;
  sizeBytes: number | null;
  rowCounts: Record<string, number> | null;
  durationMs: number | null;
  error: string | null;
  expiresAt: string | null;
  downloadCount: number;
  createdAt: string;
}

/**
 * These routes are UUID-only. BusinessOwnerGuard reads request.params.businessId
 * directly and rejects anything that isn't a UUID, so a slug will 403 — always pass
 * routeParams.id, never a business slug.
 */
const exportsUrl = (businessId: string) =>
  `${baseUrl}/businesses/${businessId}/exports`;

export const listExportsApiCall = async (businessId: string) =>
  unwrap<BusinessExport[]>(await flairapi.get(exportsUrl(businessId)));

export const createExportApiCall = async (
  businessId: string,
  includeGuestData: boolean,
) =>
  unwrap<Pick<BusinessExport, "id" | "status" | "createdAt">>(
    await flairapi.post(exportsUrl(businessId), { includeGuestData }),
  );

/**
 * Returns a short-lived presigned URL; the browser then navigates to it. The API never
 * proxies the bytes, so this deliberately does not return a blob.
 */
export const getExportDownloadUrlApiCall = async (
  businessId: string,
  exportId: string,
) =>
  unwrap<{ url: string }>(
    await flairapi.get(`${exportsUrl(businessId)}/${exportId}/download`, {
      timeout: Timeouts.SHORT,
    }),
  );
