import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowLeft, Loader2, BadgeCheck } from "lucide-react";
import { SubscriptionPack, PricingType, getMonthlyEquivalentPrice, isSamePlanFamily } from "@/models/SubscriptionPack";
import { SubscriptionStatus } from "@/models/Subscription";
import { useSubscriptions } from "@/features/subscriptions/useSubscriptions";
import BusinessManagementHeader from "@/components/management/BusinessManagementHeader";
import LemonPaymentOverlay from "@/components/payments/LemonPaymentOverlay";
import { toast } from "sonner";
import { usePageContext } from "vike-react/usePageContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import dayjs from "dayjs";

const PlansPage: React.FC = () => {
  const { urlParsed } = usePageContext();
  const { subscriptionPacks, currentUserSubscription, createCheckout, creatingCheckout, changePlan, changingPlan } = useSubscriptions();


  const [billingType, setBillingType] = useState<PricingType>(PricingType.MONTHLY);
  const [displayedPacks, setDisplayedPacks] = useState<SubscriptionPack[]>([]);
  const [checkoutLink, setCheckoutLink] = useState<string>();
  const [confirmPack, setConfirmPack] = useState<SubscriptionPack | null>(null);
  const autoCheckoutHandled = useRef(false);

  useEffect(() => {
    if (subscriptionPacks) {
      setDisplayedPacks(subscriptionPacks.filter((pack) => pack.pricingType === billingType));
    }
  }, [subscriptionPacks, billingType]);

  const getPlanAction = (pack: SubscriptionPack): "current" | "upgrade" | "downgrade" | "select" => {
    const currentPack = currentUserSubscription?.pack;
    if (!currentPack) return "select";
    // Same tier, whether it's the exact billing interval or the same plan on a different cycle (e.g. Starter Monthly vs Starter Yearly).
    if (currentPack.id === pack.id || isSamePlanFamily(currentPack, pack)) return "current";

    const currentMonthlyPrice = getMonthlyEquivalentPrice(currentPack);
    const packMonthlyPrice = getMonthlyEquivalentPrice(pack);
    if (packMonthlyPrice > currentMonthlyPrice) return "upgrade";
    if (packMonthlyPrice < currentMonthlyPrice) return "downgrade";
    return "select";
  };

  const planActionLabel: Record<ReturnType<typeof getPlanAction>, string> = {
    current: "Current Plan",
    upgrade: "Upgrade",
    downgrade: "Downgrade",
    select: "Select Plan",
  };

  const onChoosePlan = (packId: string) => {
    const pack = subscriptionPacks?.find((p) => p.id === packId);
    const hasRealSubscription = currentUserSubscription?.id && !currentUserSubscription.isDefault;

    // Existing subscribers must go through the change-plan flow (in-place PATCH on Lemon
    // Squeezy) rather than a brand-new checkout, which would start a fresh free trial and
    // create a second subscription on Lemon Squeezy's side. Since this swaps billing
    // immediately with no Lemon Squeezy checkout page to confirm on, ask first.
    if (hasRealSubscription && pack && getPlanAction(pack) !== "select") {
      setConfirmPack(pack);
      return;
    }

    createCheckout({ packId }, {
      onSuccess: (url) => {
        if (url) setCheckoutLink(url);
      }
    });
  }

  const isOnTrial = currentUserSubscription?.status === SubscriptionStatus.TRIALING
    || currentUserSubscription?.status === SubscriptionStatus.ON_TRIAL;
  const trialEndsAt = currentUserSubscription?.trialEndsAt;

  const handleConfirmChangePlan = () => {
    if (!currentUserSubscription?.id || !confirmPack) return;
    changePlan({ subId: currentUserSubscription.id, packId: confirmPack.id }, {
      onSettled: () => setConfirmPack(null),
    });
  }

  // Auto-trigger checkout when arriving from the landing page / login with a packId in the URL.
  useEffect(() => {
    const packId = urlParsed.search.packId;
    if (!packId || autoCheckoutHandled.current || !subscriptionPacks) return;

    const pack = subscriptionPacks.find((p) => p.id === packId);
    if (pack) {
      autoCheckoutHandled.current = true;
      setBillingType(pack.pricingType);

      const newUrl = window.location.pathname + window.location.search
        .replace(new RegExp(`[?&]packId=${packId}`), '')
        .replace(/^&/, '?');
      window.history.replaceState({}, '', newUrl);

      onChoosePlan(packId);
    }
  }, [urlParsed.search.packId, subscriptionPacks]);

  return (
    <div className="p-6 w-full max-w-6xl mx-auto">
      <LemonPaymentOverlay
        url={checkoutLink}
        onOverlayClosed={() => {
          setCheckoutLink(undefined);
        }}

        onCheckoutSuccess={() => {
          setCheckoutLink(undefined);
          toast("Payment success !");
        }}
      />

      <AlertDialog open={!!confirmPack} onOpenChange={(open) => !open && setConfirmPack(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmPack && getPlanAction(confirmPack) === "downgrade" ? "Downgrade" : "Upgrade"} to {confirmPack?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <span>
                {isOnTrial ? (
                  <>
                    Your plan will switch to <strong>{confirmPack?.name}</strong> immediately, but you
                    won&apos;t be charged while your free trial is active
                    {trialEndsAt ? ` (ends ${dayjs(trialEndsAt).format("DD/MM/YYYY")})` : ""}.
                    {" "}Once the trial ends, you&apos;ll be billed{" "}
                    <strong>{confirmPack?.getFormattedPrice()} {confirmPack?.getPlanDuration()}</strong>.
                  </>
                ) : (
                  <>
                    Your plan will switch to <strong>{confirmPack?.name}</strong> immediately and billing
                    will be adjusted by Lemon Squeezy. Going forward you&apos;ll be billed{" "}
                    <strong>{confirmPack?.getFormattedPrice()} {confirmPack?.getPlanDuration()}</strong>.
                  </>
                )}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={changingPlan}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmChangePlan} disabled={changingPlan}>
              {changingPlan ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="text-center mb-12">
        {/* Go Back Button */}


        <h1 className="text-4xl font-bold mb-3">Choose Your Plan</h1>
        <p className="text-muted-foreground">
          Select the subscription that fits your business best.
        </p>

        {/* Billing toggle */}
        <div className="mt-6 inline-flex bg-card rounded-full p-1 shadow-md">
          <Button
            variant={billingType === PricingType.MONTHLY ? "default" : "ghost"}
            className="rounded-full px-5 py-2"
            onClick={() => setBillingType(PricingType.MONTHLY)}
          >
            Monthly
          </Button>
          <Button
            variant={billingType === PricingType.YEARLY ? "default" : "ghost"}
            className="rounded-full px-5 py-2"
            onClick={() => setBillingType(PricingType.YEARLY)}
          >
            Yearly
          </Button>
        </div>
      </div>
      {(creatingCheckout || changingPlan) && (
        <div className="flex flex-col items-center justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Loading, please wait...</p>
        </div>
      )}
      {/* Plans grid */}
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {displayedPacks.map((pack) => {
          const planAction = getPlanAction(pack);
          const isCurrentPlan = planAction === "current";

          return (
          <motion.div
            key={pack.id}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className={cn(
              "relative border border-border shadow-sm hover:shadow-lg transition bg-card flex flex-col h-full",
              isCurrentPlan && "ring-2 ring-emerald-500 border-emerald-500"
            )}>
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow-md z-10">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Your Current Plan
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-primary mb-1">
                  {pack.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{pack.getShortDescription()}</p>
              </CardHeader>

              <CardContent className="flex flex-col justify-between flex-grow">
                <div className="mt-2 text-center mb-6">
                  <p className="text-4xl font-bold mb-1">
                    {pack.price}{" "}
                    <span className="text-lg font-normal">{pack.currency}</span>
                  </p>
                  <p className="text-muted-foreground text-sm">{pack.getPlanDuration()}</p>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4 text-xs bg-muted/50 p-3 rounded-lg border border-border">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground mb-1">Businesses</span>
                    <span className="font-semibold text-foreground">{pack.maxBusinesses === -1 ? "Unlimited" : pack.maxBusinesses}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground mb-1">Staff</span>
                    <span className="font-semibold text-foreground">{pack.maxEmployees === -1 ? "Unlimited" : pack.maxEmployees}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground mb-1">Menus</span>
                    <span className="font-semibold text-foreground">{pack.maxMenus === -1 ? "Unlimited" : pack.maxMenus}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground mb-1">Products</span>
                    <span className="font-semibold text-foreground">{pack.maxProducts === -1 ? "Unlimited" : pack.maxProducts}</span>
                  </div>
                </div>

                <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                  {pack.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>{f.replace(/_/g, " ")}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => {
                    onChoosePlan(pack.id)
                  }}
                  disabled={isCurrentPlan || creatingCheckout || changingPlan}
                  variant={isCurrentPlan ? "outline" : planAction === "downgrade" ? "secondary" : "default"}
                  className="w-full mt-auto">{planActionLabel[planAction]}</Button>
              </CardContent>
            </Card>
          </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PlansPage;
