import flairapi from "@/lib/flairapi";
const baseUrl = `${import.meta.env.BASE_URL}/subscriptions`;

const currentSubscriptionUrl = `${baseUrl}/current`;
const subscriptionsListUrl = `${baseUrl}/my`;
const subscriptionPacksUrl = `${baseUrl}/packs`;
const checkoutUrl = `${baseUrl}/checkout`;

export const getCurrentUserSubscriptionApiCall = () => {
  return flairapi.get(currentSubscriptionUrl);
};

export const getSubscriptionPacksApiCall = () => {
  return flairapi.get(subscriptionPacksUrl);
};

export const handleUserCheckoutApiCall = (data: { packId: string }) => {
  return flairapi.post(checkoutUrl, data);
};

export const getUserSubscriptionsListApiCall = () => {
  return flairapi.get(subscriptionsListUrl);
};
