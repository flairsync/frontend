import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getCurrentUserSubscriptionApiCall,
  getSubscriptionPacksApiCall,
  getUserSubscriptionsListApiCall,
  handleUserCheckoutApiCall,
} from "./service";
import { Subscription } from "@/models/Subscription";
import { usePageContext } from "vike-react/usePageContext";
import { SubscriptionPack } from "@/models/SubscriptionPack";

export const useSubscriptions = () => {
  const { user } = usePageContext();
  const { data: currentUserSubscription } = useQuery({
    queryKey: ["current_user_subscription"],
    queryFn: async () => {
      const res = await getCurrentUserSubscriptionApiCall();
      if (res.data.success) {
        return Subscription.parseApiResponse(res.data.data);
      } else {
        return null;
      }
    },
    enabled: user != null,
  });

  const { data: subscriptionPacks } = useQuery({
    queryKey: ["subscription_packs"],
    queryFn: async () => {
      const res = await getSubscriptionPacksApiCall();
      if (res.data.success) {
        return SubscriptionPack.parseApiArrayResponse(res.data.data);
      } else {
        return null;
      }
    },
  });

  const {
    data: checkoutData,
    isPending: creatingCheckout,
    mutate: createCheckout,
  } = useMutation({
    mutationKey: ["create_user_checkout"],
    mutationFn: async (data: { packId: string }) => {
      const resp = await handleUserCheckoutApiCall(data);
      if (resp.data.success) {
        return resp.data.data.url as string;
      } else {
        return null;
      }
    },
  });

  const { data: userSubscriptionsList, isPending: fetchingUserSubscriptions } =
    useQuery({
      queryKey: ["user_subscriptions_list"],
      queryFn: async () => {
        const resp = await getUserSubscriptionsListApiCall();
        if (resp.data.success) {
          return Subscription.parseApiArrayResponse(resp.data.data);
        } else {
          return null;
        }
      },
      enabled: user != null,
    });

  return {
    currentUserSubscription,
    subscriptionPacks,

    checkoutData,
    creatingCheckout,
    createCheckout,
    handleUserCheckoutApiCall,

    // subs list
    userSubscriptionsList,
    fetchingUserSubscriptions,
  };
};
