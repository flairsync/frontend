import flairapi from "@/lib/flairapi";
import { unwrap } from "../../shared/api-response";
import { PinnedLink } from "@/models/PinnedLink";

const businessesBaseUrl = `${'https://api.flairsync.com/api/v1'}/businesses`;

export const fetchPinnedLinksApiCall = async (businessId: string) =>
  unwrap<PinnedLink[]>(await flairapi.get(`${businessesBaseUrl}/${businessId}/pinned-links`));

export const createPinnedLinkApiCall = (businessId: string, path: string) =>
  flairapi.post(`${businessesBaseUrl}/${businessId}/pinned-links`, { path });

export const deletePinnedLinkApiCall = (businessId: string, id: string) =>
  flairapi.delete(`${businessesBaseUrl}/${businessId}/pinned-links/${id}`);
