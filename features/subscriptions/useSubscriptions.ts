import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getCurrentUserSubscriptionApiCall,
  getSubscriptionPacksApiCall,
  getUserSubscriptionsListApiCall,
  handleUserCheckoutApiCall,
  getSubscriptionPortalUrlApiCall,
  syncSubscriptionApiCall,
} from "./service";
import { Subscription } from "@/models/Subscription";
import { usePageContext } from "vike-react/usePageContext";
import { SubscriptionPack } from "@/models/SubscriptionPack";

export const useSubscriptions = () => {
  const queryClient = useQueryClient();
  const { user } = usePageContext();
  const { data: currentUserSubscription } = useQuery({
    queryKey: ["current_user_subscription"],
    queryFn: async () => {
      const res = await getCurrentUserSubscriptionApiCall();
      if (res.data.success) {
        return Subscription.parseApiResponse(res.data.data.data);
      } else {
        return null;
      }
    },
    enabled: user != null,
  });

  const { data: subscriptionPacks, isPending: fetchingPacks } = useQuery({
    queryKey: ["subscription_packs"],
    queryFn: async () => {
      // Extract country code from browser locale (e.g., 'en-US' -> 'US')
      let countryCode;
      /* if (typeof navigator !== "undefined" && navigator.language) {
        countryCode = navigator.language.split("-")[1]?.toUpperCase();
      } */
      const res = await getSubscriptionPacksApiCall(countryCode);
      if (res.data.success) {
        return SubscriptionPack.parseApiArrayResponse(res.data.data.data);
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
        return resp.data.data.data.url as string;
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
          return Subscription.parseApiArrayResponse(resp.data.data.data);
        } else {
          return null;
        }
      },
      enabled: user != null,
    });

  const {
    data: portalUrlData,
    isPending: fetchingPortalUrl,
    mutateAsync: fetchPortalUrl,
  } = useMutation({
    mutationKey: ["fetch_portal_url"],
    mutationFn: async () => {
      const resp = await getSubscriptionPortalUrlApiCall();
      if (resp.status === 200 && resp.data?.data?.data?.url) {
        return resp.data.data.data.url as string;
      } else {
        return null;
      }
    },
  });

  const { mutate: syncSubscription, isPending: syncingSubscription } = useMutation({
    mutationKey: ["sync_subscription"],
    mutationFn: async (subId: string) => {
      toast.loading("Syncing subscription...", { id: "sync_sub_toast" });
      const resp = await syncSubscriptionApiCall(subId);
      return resp.data;
    },
    onSuccess: (data) => {
      toast.dismiss("sync_sub_toast");
      toast.success("Subscription synced successfully.");
      queryClient.invalidateQueries({ queryKey: ["user_subscriptions_list"] });
      queryClient.invalidateQueries({ queryKey: ["current_user_subscription"] });
    },
    onError: (error) => {
      toast.dismiss("sync_sub_toast");
      toast.error("Failed to sync subscription.");
    },
  });

  return {
    currentUserSubscription,
    subscriptionPacks,
    fetchingPacks,

    checkoutData,
    creatingCheckout,
    createCheckout,
    handleUserCheckoutApiCall,

    // subs list
    userSubscriptionsList,
    fetchingUserSubscriptions,

    // portal
    portalUrlData,
    fetchingPortalUrl,
    fetchPortalUrl,

    syncSubscription,
    syncingSubscription,
  };
};
