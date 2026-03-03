import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSubscriptions } from "@/features/subscriptions/useSubscriptions";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { subscriptionPacks, fetchingPacks, currentUserSubscription, createCheckout, creatingCheckout } = useSubscriptions();

    const handleSubscribe = (packId: string) => {
        createCheckout({ packId }, {
            onSuccess: (url) => {
                if (url) {
                    window.location.href = url;
                }
            }
        });
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open && !creatingCheckout) onClose();
            }}
        >
            <DialogContent className="sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-8 rounded-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center mb-2">Upgrade Your Plan</DialogTitle>
                    <p className="text-center text-gray-500 mb-6">Choose a plan that fits your business needs.</p>
                </DialogHeader>

                {fetchingPacks ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {subscriptionPacks?.map((pack) => {
                            const isCurrentPlan = currentUserSubscription?.pack?.id === pack.id;
                            // Also considering free plan might have price 0
                            const isFree = parseFloat(pack.price.toString()) === 0;

                            return (
                                <div
                                    key={pack.id}
                                    className={`relative flex flex-col p-6 rounded-2xl border ${isCurrentPlan ? "border-indigo-500 shadow-md ring-1 ring-indigo-500" : "border-gray-200"
                                        } bg-white`}
                                >
                                    {isCurrentPlan && (
                                        <div className="absolute top-0 right-0 -mt-3 mr-4">
                                            <span className="bg-indigo-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                                                Current Plan
                                            </span>
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold text-gray-900">{pack.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1 h-10">{pack.getShortDescription()}</p>
                                    </div>

                                    <div className="my-6">
                                        <span className="text-4xl font-extrabold text-gray-900">{isFree ? "Free" : pack.getFormattedPrice()}</span>
                                        {!isFree && <span className="text-gray-500 font-medium">/mo</span>}
                                    </div>

                                    <ul className="mb-8 space-y-3 flex-1 text-sm text-gray-600">
                                        <li className="flex items-center">
                                            <Check className="h-5 w-5 text-indigo-500 mr-2 shrink-0" />
                                            {t("subscriptions.limits.businesses", { count: pack.maxBusinesses })}
                                        </li>
                                        <li className="flex items-center">
                                            <Check className="h-5 w-5 text-indigo-500 mr-2 shrink-0" />
                                            {t("subscriptions.limits.employees", { count: pack.maxEmployees })}
                                        </li>
                                        <li className="flex items-center">
                                            <Check className="h-5 w-5 text-indigo-500 mr-2 shrink-0" />
                                            {t("subscriptions.limits.menus", { count: pack.maxMenus })}
                                        </li>
                                        <li className="flex items-center">
                                            <Check className="h-5 w-5 text-indigo-500 mr-2 shrink-0" />
                                            {t("subscriptions.limits.products", { count: pack.maxProducts })}
                                        </li>
                                        {pack.features.filter(f => f !== 'api_access').map((feature, idx) => (
                                            <li key={idx} className="flex items-center">
                                                <Check className="h-5 w-5 text-indigo-500 mr-2 shrink-0" />
                                                {t(`subscriptions.features.${feature}`, feature)}
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        className="w-full mt-auto"
                                        variant={isCurrentPlan ? "outline" : "default"}
                                        disabled={isCurrentPlan || isFree || creatingCheckout}
                                        onClick={() => handleSubscribe(pack.id)}
                                    >
                                        {isCurrentPlan ? "Current Plan" : creatingCheckout ? "Loading..." : "Subscribe"}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
