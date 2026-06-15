import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  cancelSubscriptionApiCall,
  changePlanApiCall,
  getCurrentUserSubscriptionApiCall,
  getSubscriptionPacksApiCall,
  getUserSubscriptionsListApiCall,
  handleUserCheckoutApiCall,
  getSubscriptionPortalUrlApiCall,
  resumeSubscriptionApiCall,
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
      return res.data ? Subscription.parseApiResponse(res.data) : null;
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
      return SubscriptionPack.parseApiArrayResponse(Array.isArray(res.data) ? res.data : []);
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
      return (resp.data as any)?.url as string ?? null;
    },
  });

  const { data: userSubscriptionsList, isPending: fetchingUserSubscriptions } =
    useQuery({
      queryKey: ["user_subscriptions_list"],
      queryFn: async () => {
        const resp = await getUserSubscriptionsListApiCall();
        return Subscription.parseApiArrayResponse(Array.isArray(resp.data) ? resp.data : []);
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
      return (resp.data as any)?.url as string ?? null;
    },
  });

  const { mutate: syncSubscription, mutateAsync: syncSubscriptionAsync, isPending: syncingSubscription } = useMutation({
    mutationKey: ["sync_subscription"],
    mutationFn: async (subId: string) => {
      const resp = await syncSubscriptionApiCall(subId);
      return resp.data;
    },
    onSuccess: () => {
      toast.success("Subscription synced.");
      queryClient.invalidateQueries({ queryKey: ["user_subscriptions_list"] });
      queryClient.invalidateQueries({ queryKey: ["current_user_subscription"] });
    },
    onError: () => {
      toast.error("Failed to sync subscription.");
    },
  });

  const { mutateAsync: cancelSubscription, isPending: cancelingSubscription } = useMutation({
    mutationKey: ["cancel_subscription"],
    mutationFn: async (subId: string) => {
      const resp = await cancelSubscriptionApiCall(subId);
      return resp.data ? Subscription.parseApiResponse(resp.data) : null;
    },
    onSuccess: () => {
      toast.success("Subscription cancelled.");
      queryClient.invalidateQueries({ queryKey: ["user_subscriptions_list"] });
      queryClient.invalidateQueries({ queryKey: ["current_user_subscription"] });
    },
    onError: (error: any) => {
      const code = error?.response?.data?.code;
      if (code === "sub.not_cancellable") {
        toast.error("This subscription cannot be cancelled right now.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    },
  });

  const { mutateAsync: resumeSubscription, isPending: resumingSubscription } = useMutation({
    mutationKey: ["resume_subscription"],
    mutationFn: async (subId: string) => {
      const resp = await resumeSubscriptionApiCall(subId);
      return resp.data ? Subscription.parseApiResponse(resp.data) : null;
    },
    onSuccess: () => {
      toast.success("Subscription resumed.");
      queryClient.invalidateQueries({ queryKey: ["user_subscriptions_list"] });
      queryClient.invalidateQueries({ queryKey: ["current_user_subscription"] });
    },
    onError: (error: any) => {
      const code = error?.response?.data?.code;
      if (code === "sub.not_resumable") {
        toast.error("This subscription can no longer be resumed.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    },
  });

  const { mutateAsync: changePlan, isPending: changingPlan } = useMutation({
    mutationKey: ["change_plan"],
    mutationFn: async ({ subId, packId }: { subId: string; packId: string }) => {
      const resp = await changePlanApiCall(subId, packId);
      return resp.data ? Subscription.parseApiResponse(resp.data) : null;
    },
    onSuccess: () => {
      toast.success("Plan changed successfully.");
      queryClient.invalidateQueries({ queryKey: ["user_subscriptions_list"] });
      queryClient.invalidateQueries({ queryKey: ["current_user_subscription"] });
    },
    onError: (error: any) => {
      const code = error?.response?.data?.code;
      const message = error?.response?.data?.message;
      if (code === "sub.same_plan") {
        toast.error("You're already on this plan.");
      } else if (code === "sub.not_changeable") {
        toast.error("Plan changes are not available in the current subscription state.");
      } else if (code === "pack.notfound") {
        toast.error("Selected plan is not available.");
      } else if (code === "sub.downgrade_limit_exceeded") {
        toast.error(message ?? "Cannot downgrade: you exceed the limits of the selected plan.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
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

    // sync
    syncSubscription,
    syncSubscriptionAsync,
    syncingSubscription,

    // cancel
    cancelSubscription,
    cancelingSubscription,

    // resume
    resumeSubscription,
    resumingSubscription,

    // change plan
    changePlan,
    changingPlan,
  };
};
