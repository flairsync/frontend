import flairapi, { API_URL } from "@/lib/flairapi";
import { unwrap } from "../shared/api-response";
const baseUrl = `${API_URL}/subscriptions`;

const currentSubscriptionUrl = `${baseUrl}/current`;
const subscriptionsListUrl = `${baseUrl}/my`;
const subscriptionPacksUrl = `${baseUrl}/packs`;
const checkoutUrl = `${baseUrl}/checkout`;
const usageUrl = `${baseUrl}/usage`;
const portalUrl = `${baseUrl}/portal`;
const syncUrl = `${baseUrl}/sync`;
const invoiceUrl = `${baseUrl}/invoice`;

// These endpoints use paginatedResponse on the backend even for single items.
// unwrap() strips the ApiResponse envelope; the result shape is { data: T, current, pages }.
// Hooks access .data to get the actual payload.
interface SingleItemResponse<T = any> {
  data: T;
  current: number;
  pages: number;
}

export const getCurrentUserSubscriptionApiCall = async () =>
  unwrap<SingleItemResponse>(await flairapi.get(currentSubscriptionUrl));

export const getSubscriptionPacksApiCall = async (country?: string) => {
  const query = country ? `?country=${country}` : "";
  return unwrap<SingleItemResponse>(await flairapi.get(`${subscriptionPacksUrl}${query}`));
};

export const handleUserCheckoutApiCall = async (data: { packId: string; businessCount?: number }) =>
  unwrap<SingleItemResponse>(await flairapi.post(checkoutUrl, data));

export const getUserSubscriptionsListApiCall = async () =>
  unwrap<SingleItemResponse>(await flairapi.get(subscriptionsListUrl));

export const getUserUsageApiCall = async () =>
  unwrap<SingleItemResponse>(await flairapi.get(usageUrl));

export const getSubscriptionPortalUrlApiCall = async () =>
  unwrap<SingleItemResponse>(await flairapi.get(portalUrl));

export const syncSubscriptionApiCall = (subId: string) => {
  return flairapi.post(`${syncUrl}/${subId}`);
};

export const cancelSubscriptionApiCall = async (subId: string) =>
  unwrap<SingleItemResponse>(await flairapi.post(`${baseUrl}/${subId}/cancel`));

export const resumeSubscriptionApiCall = async (subId: string) =>
  unwrap<SingleItemResponse>(await flairapi.post(`${baseUrl}/${subId}/resume`));

export const changePlanApiCall = async (subId: string, packId: string, businessCount?: number) =>
  unwrap<SingleItemResponse>(await flairapi.post(`${baseUrl}/${subId}/change-plan`, { packId, businessCount }));

export const getSubscriptionInvoicesApiCall = async (subId: string) =>
  unwrap<any[]>(await flairapi.get(`${invoiceUrl}/${subId}`));

export const downloadSubscriptionInvoiceApiCall = async (subId: string, invoiceId: string) =>
  unwrap<SingleItemResponse>(await flairapi.get(`${invoiceUrl}/${subId}/download/${invoiceId}`));
