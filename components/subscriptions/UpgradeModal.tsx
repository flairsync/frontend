import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSubscriptions } from "@/features/subscriptions/useSubscriptions";
import { Button } from "@/components/ui/button";
import { Check, Crown, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSubscriptionStore } from "@/features/subscriptions/SubscriptionStore";
import { PricingType } from "@/models/SubscriptionPack";
import { cn } from "@/lib/utils";

const UpgradeModal: React.FC = () => {
    const { t } = useTranslation();
    const { isUpgradeModalOpen, closeUpgradeModal, limitMessage } = useSubscriptionStore();
    const { subscriptionPacks, fetchingPacks, currentUserSubscription, createCheckout, creatingCheckout } = useSubscriptions();
    const [isMonthly, setIsMonthly] = useState(true);

    const handleSubscribe = (packId: string) => {
        createCheckout({ packId }, {
            onSuccess: (url) => {
                if (url) {
                    window.location.href = url;
                }
            }
        });
    };

    const displayedPacks = subscriptionPacks?.filter(
        (p) => p.pricingType === (isMonthly ? PricingType.MONTHLY : PricingType.YEARLY)
    ) || [];

    // Filter out the free pack if user is already on a paid plan or if they are looking to upgrade
    const upgradePacks = displayedPacks.filter(p => {
        const price = parseFloat(p.price.toString());
        const currentPrice = currentUserSubscription?.price || 0;
        return price > currentPrice || (currentPrice === 0 && price === 0 && p.id !== currentUserSubscription?.pack?.id);
    });

    return (
        <Dialog
            open={isUpgradeModalOpen}
            onOpenChange={(open) => {
                if (!open && !creatingCheckout) closeUpgradeModal();
            }}
        >
            <DialogContent className="sm:max-w-4xl w-full max-h-[95vh] overflow-y-auto p-0 rounded-2xl border-none bg-zinc-50">
                <div className="p-6 sm:p-10">
                    <DialogHeader className="mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="bg-indigo-100 p-3 rounded-2xl">
                                <Crown className="h-8 w-8 text-indigo-600" />
                            </div>
                        </div>
                        <DialogTitle className="text-3xl font-bold text-center">Upgrade Your Plan</DialogTitle>
                        <DialogDescription className="text-center text-zinc-600 text-lg mt-2 max-w-md mx-auto">
                            {limitMessage || t("subscriptions.upgrade_message", "Choose a plan that fits your business needs and unlock more power.")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-center mb-10">
                        <div className="flex bg-zinc-200 p-1 rounded-full gap-1 shadow-inner border border-zinc-300/50">
                            <Button
                                size="sm"
                                variant={isMonthly ? "default" : "ghost"}
                                className={cn(
                                    "rounded-full px-6 py-2.5 h-auto font-bold transition-all text-sm",
                                    isMonthly ? "shadow-sm" : "text-zinc-600 hover:bg-zinc-300"
                                )}
                                onClick={() => setIsMonthly(true)}
                            >
                                Monthly
                            </Button>
                            <Button
                                size="sm"
                                variant={!isMonthly ? "default" : "ghost"}
                                className={cn(
                                    "rounded-full px-6 py-2.5 h-auto font-bold transition-all text-sm",
                                    !isMonthly ? "shadow-sm" : "text-zinc-600 hover:bg-zinc-300"
                                )}
                                onClick={() => setIsMonthly(false)}
                            >
                                Yearly
                            </Button>
                        </div>
                    </div>

                    {fetchingPacks ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                        </div>
                    ) : (
                        <div className={cn(
                            "grid gap-6",
                            upgradePacks.length === 1 ? "max-w-md mx-auto grid-cols-1" :
                                upgradePacks.length === 2 ? "max-w-2xl mx-auto grid-cols-1 md:grid-cols-2" :
                                    "grid-cols-1 md:grid-cols-3"
                        )}>
                            {upgradePacks.map((pack) => {
                                const isFree = parseFloat(pack.price.toString()) === 0;

                                return (
                                    <div
                                        key={pack.id}
                                        className="relative flex flex-col p-8 rounded-3xl border border-zinc-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        <div className="mb-6">
                                            <h3 className="text-2xl font-bold text-zinc-900">{pack.name}</h3>
                                            <p className="text-sm text-zinc-500 mt-2 leading-relaxed min-h-[3rem]">
                                                {pack.description || pack.getShortDescription()}
                                            </p>
                                        </div>

                                        <div className="mb-8">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-black text-zinc-900">
                                                    {isFree ? "Free" : pack.getFormattedPrice()}
                                                </span>
                                                {!isFree && <span className="text-zinc-500 font-bold text-lg">/{isMonthly ? "mo" : "yr"}</span>}
                                            </div>
                                        </div>

                                        <ul className="mb-10 space-y-4 flex-1 text-sm font-medium text-zinc-700">
                                            <li className="flex items-start">
                                                <Check className="h-5 w-5 text-indigo-500 mr-3 shrink-0 mt-0.5" />
                                                <span>{t("subscriptions.limits.businesses", { count: pack.maxBusinesses })}</span>
                                            </li>
                                            <li className="flex items-start">
                                                <Check className="h-5 w-5 text-indigo-500 mr-3 shrink-0 mt-0.5" />
                                                <span>{t("subscriptions.limits.employees", { count: pack.maxEmployees })}</span>
                                            </li>
                                            <li className="flex items-start">
                                                <Check className="h-5 w-5 text-indigo-500 mr-3 shrink-0 mt-0.5" />
                                                <span>{t("subscriptions.limits.menus", { count: pack.maxMenus })}</span>
                                            </li>
                                            <li className="flex items-start">
                                                <Check className="h-5 w-5 text-indigo-500 mr-3 shrink-0 mt-0.5" />
                                                <span>{t("subscriptions.limits.products", { count: pack.maxProducts })}</span>
                                            </li>
                                        </ul>

                                        <Button
                                            className="w-full py-7 rounded-2xl font-bold text-lg shadow-lg hover:shadow-indigo-500/20 transition-all"
                                            disabled={creatingCheckout}
                                            onClick={() => handleSubscribe(pack.id)}
                                        >
                                            {creatingCheckout ? (
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                            ) : (
                                                "Get Started"
                                            )}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UpgradeModal;
