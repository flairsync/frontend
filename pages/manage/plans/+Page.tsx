import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { SubscriptionPack, PricingType } from "@/models/SubscriptionPack";
import { useSubscriptions } from "@/features/subscriptions/useSubscriptions";
import BusinessManagementHeader from "@/components/management/BusinessManagementHeader";
import LemonPaymentOverlay from "@/components/payments/LemonPaymentOverlay";

const PlansPage: React.FC = () => {
  const { subscriptionPacks, handleUserCheckoutApiCall } = useSubscriptions();


  const [billingType, setBillingType] = useState<PricingType>(PricingType.MONTHLY);
  const [displayedPacks, setDisplayedPacks] = useState<SubscriptionPack[]>([]);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [checkoutLink, setCheckoutLink] = useState<string>();

  useEffect(() => {
    if (subscriptionPacks) {
      setDisplayedPacks(subscriptionPacks.filter((pack) => pack.pricingType === billingType));
    }
  }, [subscriptionPacks, billingType]);


  const onChoosePlan = (packId: string) => {
    setLoadingCheckout(true);
    handleUserCheckoutApiCall({
      packId: packId
    }).then(res => {
      if (res.data.success) {
        setCheckoutLink(res.data.data.url);
      }
    }).finally(() => {
      setLoadingCheckout(false);
    })
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8">
      <LemonPaymentOverlay
        url={checkoutLink}
      />
      <BusinessManagementHeader />

      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center mb-12">
          {/* Go Back Button */}
          <div className="flex items-center justify-start mb-6">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300 hover:text-primary transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>

          <h1 className="text-4xl font-bold mb-3">Choose Your Plan</h1>
          <p className="text-zinc-500">
            Select the subscription that fits your restaurant best.
          </p>

          {/* Billing toggle */}
          <div className="mt-6 inline-flex bg-white dark:bg-zinc-800 rounded-full p-1 shadow-md">
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
        {
          loadingCheckout && <div>Loading please wait ...</div>
        }
        {/* Plans grid */}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {displayedPacks.map((pack) => (
            <motion.div
              key={pack.id}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-lg transition bg-white dark:bg-zinc-900 flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold text-primary mb-1">
                    {pack.name}
                  </CardTitle>
                  <p className="text-sm text-zinc-500">{pack.getShortDescription()}</p>
                </CardHeader>

                <CardContent className="flex flex-col justify-between flex-grow">
                  <div className="mt-2 mb-4">
                    <p className="text-4xl font-bold mb-1">
                      {pack.price}{" "}
                      <span className="text-lg font-normal">{pack.currency}</span>
                    </p>
                    <p className="text-zinc-500 text-sm">{pack.getPlanDuration()}</p>
                  </div>

                  <ul className="text-sm text-zinc-600 dark:text-zinc-300 space-y-2 mb-6">
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
                    className="w-full mt-auto">Select Plan</Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlansPage;
