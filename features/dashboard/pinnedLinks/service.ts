import flairapi, { API_URL } from "@/lib/flairapi";
import { unwrap } from "@/features/shared/api-response";
import { PinnedLink } from "@/models/PinnedLink";

const businessesBaseUrl = `${API_URL}/businesses`;

export const fetchPinnedLinksApiCall = async (businessId: string) =>
  unwrap<PinnedLink[]>(await flairapi.get(`${businessesBaseUrl}/${businessId}/pinned-links`));

export const createPinnedLinkApiCall = (businessId: string, path: string) =>
  flairapi.post(`${businessesBaseUrl}/${businessId}/pinned-links`, { path });

export const deletePinnedLinkApiCall = (businessId: string, id: string) =>
  flairapi.delete(`${businessesBaseUrl}/${businessId}/pinned-links/${id}`);
