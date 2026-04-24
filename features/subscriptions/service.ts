import flairapi from "@/lib/flairapi";
const baseUrl = `${import.meta.env.BASE_URL}/subscriptions`;

const currentSubscriptionUrl = `${baseUrl}/current`;
const subscriptionsListUrl = `${baseUrl}/my`;
const subscriptionPacksUrl = `${baseUrl}/packs`;
const checkoutUrl = `${baseUrl}/checkout`;
const usageUrl = `${baseUrl}/usage`;
const portalUrl = `${baseUrl}/portal`;
const syncUrl = `${baseUrl}/sync`;
const invoiceUrl = `${baseUrl}/invoice`;

export const getCurrentUserSubscriptionApiCall = () => {
  return flairapi.get(currentSubscriptionUrl);
};

export const getSubscriptionPacksApiCall = (country?: string) => {
  const query = country ? `?country=${country}` : "";
  return flairapi.get(`${subscriptionPacksUrl}${query}`);
};

export const handleUserCheckoutApiCall = (data: { packId: string }) => {
  return flairapi.post(checkoutUrl, data);
};

export const getUserSubscriptionsListApiCall = () => {
  return flairapi.get(subscriptionsListUrl);
};

export const getUserUsageApiCall = () => {
  return flairapi.get(usageUrl);
};

export const getSubscriptionPortalUrlApiCall = () => {
  return flairapi.get(portalUrl);
};

export const syncSubscriptionApiCall = (subId: string) => {
  return flairapi.post(`${syncUrl}/${subId}`);
};

export const getSubscriptionInvoicesApiCall = (subId: string) => {
  return flairapi.get(`${invoiceUrl}/${subId}`);
};

export const downloadSubscriptionInvoiceApiCall = (subId: string, invoiceId: string) => {
  return flairapi.get(`${invoiceUrl}/${subId}/download/${invoiceId}`);
};
