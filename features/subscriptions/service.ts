import flairapi from "@/lib/flairapi";
const baseUrl = `${import.meta.env.BASE_URL}/subscriptions`;

const currentSubscriptionUrl = `${baseUrl}/current`;
const subscriptionsListUrl = `${baseUrl}/my`;
const subscriptionPacksUrl = `${baseUrl}/packs`;
const checkoutUrl = `${baseUrl}/checkout`;

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
