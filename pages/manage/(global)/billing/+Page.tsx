import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, AlertTriangle } from "lucide-react";
import { useSubscriptions } from "@/features/subscriptions/useSubscriptions";
import { Subscription, SubscriptionStatus } from "@/models/Subscription";
import { BillingInvoicesTable } from "@/components/management/billing/BillingInvoicesTable";
import { useProfile } from "@/features/profile/useProfile";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const BillingPage = () => {
    const { t } = useTranslation("management");

    const {
        userProfile
    } = useProfile();

    const {
        currentUserSubscription,
        userSubscriptionsList,
        fetchingUserSubscriptions,
        fetchPortalUrl,
        fetchingPortalUrl,
        resumeSubscription,
    } = useSubscriptions();

    const [resumingCurrent, setResumingCurrent] = useState(false);

    const handleResumeCurrent = async () => {
        if (!currentUserSubscription) return;
        setResumingCurrent(true);
        try {
            await resumeSubscription(currentUserSubscription.id);
        } finally {
            setResumingCurrent(false);
        }
    };

    const isCurrentCanceled =
        currentUserSubscription?.status === SubscriptionStatus.CANCELED &&
        currentUserSubscription.endsAt != null &&
        currentUserSubscription.endsAt > new Date();

    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

    useEffect(() => {
        if (userSubscriptionsList) {
            setSubscriptions(userSubscriptionsList);
        }
    }, [userSubscriptionsList]);

    return (
        <div className="p-6 w-full">
            <div className="flex items-center gap-3 mb-6">
                <Crown className="h-7 w-7 text-yellow-500" />
                <h1 className="text-2xl font-bold">{t("billing_page.title")}</h1>
            </div>
            <p className="text-muted-foreground mb-8">
                {t("billing_page.subtitle")}
            </p>

            {/* Canceled subscription warning banner */}
            {isCurrentCanceled && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 mb-6 text-amber-800">
                    <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-amber-500" />
                    <div className="flex-1 text-sm">
                        <span className="font-semibold">{t("billing_page.cancelled_label")}</span> {t("billing_page.cancelled_prefix")}{" "}
                        <strong>{currentUserSubscription!.getEndDate("MMMM D, YYYY")}</strong>.
                        {" "}{t("billing_page.cancelled_suffix")}
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-400 text-amber-800 hover:bg-amber-100 shrink-0"
                        disabled={resumingCurrent}
                        onClick={handleResumeCurrent}
                    >
                        {resumingCurrent ? t("billing_page.resuming") : t("billing_page.resume_subscription")}
                    </Button>
                </div>
            )}

            {/* Subscription Overview */}
            <Card className="mb-8 border border-border shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row justify-between items-center bg-muted/50 border-b border-border">
                    <CardTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-primary" />
                        {t("billing_page.current_plan")}
                    </CardTitle>
                    {currentUserSubscription?.isDefault ? (
                        <a href="/manage/plans">
                            <Button variant="outline" className="rounded-xl">
                                {t("billing_page.explore_plans")}
                            </Button>
                        </a>
                    ) : (
                        <Button
                            variant="outline"
                            className="rounded-xl"
                            disabled={fetchingPortalUrl}
                            onClick={async () => {
                                try {
                                    const url = await fetchPortalUrl();
                                    if (url) {
                                        window.location.href = url;
                                    } else {
                                        toast.error(t("billing_page.portal_url_error"));
                                    }
                                } catch (e) {
                                    toast.error(t("billing_page.portal_connect_error"));
                                }
                            }}
                        >
                            {fetchingPortalUrl ? t("billing_page.loading") : t("billing_page.manage_subscription")}
                        </Button>
                    )}
                </CardHeader>

                <CardContent className="pt-6">
                    {(currentUserSubscription || userProfile?.currentSubscription) ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                            <div className="space-y-1">
                                <p className="text-muted-foreground font-medium tracking-tight">{t("billing_page.plan_name")}</p>
                                <p className="font-bold text-lg text-foreground">
                                    {(currentUserSubscription?.pack?.name || userProfile?.currentSubscription?.pack?.name) || t("billing_page.free")}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground font-medium tracking-tight">
                                    {currentUserSubscription?.status === SubscriptionStatus.CANCELED ? t("billing_page.access_ends_on") : t("billing_page.next_renewal")}
                                </p>
                                <p className="font-bold text-lg text-foreground">
                                    {currentUserSubscription?.isDefault ? t("billing_page.never") : (
                                        currentUserSubscription?.status === SubscriptionStatus.CANCELED
                                            ? currentUserSubscription?.getEndDate() || t("billing_page.not_available")
                                            : (currentUserSubscription?.getRenewalDate() || userProfile?.currentSubscription?.getRenewalDate() || t("billing_page.not_available"))
                                    )}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground font-medium tracking-tight">{t("billing_page.status")}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={cn(
                                        "h-2 w-2 rounded-full",
                                        (currentUserSubscription?.status === SubscriptionStatus.ACTIVE || userProfile?.currentSubscription?.status === SubscriptionStatus.ACTIVE)
                                            ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                                            : (currentUserSubscription?.status === SubscriptionStatus.ON_TRIAL || userProfile?.currentSubscription?.status === SubscriptionStatus.ON_TRIAL)
                                                ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                                                : currentUserSubscription?.status === SubscriptionStatus.CANCELED
                                                    ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]"
                                                    : currentUserSubscription?.status === SubscriptionStatus.PAST_DUE
                                                        ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                                                        : "bg-red-500"
                                    )} />
                                    <p className="font-bold text-foreground">
                                        {(currentUserSubscription?.status === SubscriptionStatus.CANCELED
                                            ? t("billing_page.canceling")
                                            : currentUserSubscription?.status === SubscriptionStatus.PAST_DUE
                                                ? t("billing_page.payment_failed_past_due")
                                                : (currentUserSubscription?.status === SubscriptionStatus.ON_TRIAL || userProfile?.currentSubscription?.status === SubscriptionStatus.ON_TRIAL)
                                                    ? t("billing_page.free_trial")
                                                    : currentUserSubscription?.status || userProfile?.currentSubscription?.status || t("billing_page.active")).toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-6 text-center">
                            <div className="bg-muted p-4 rounded-full mb-4">
                                <Crown className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-bold text-foreground text-lg">{t("billing_page.free_plan")}</h3>
                            <p className="text-muted-foreground text-sm mb-6">{t("billing_page.free_plan_description")}</p>
                            <a href="/manage/plans">
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">{t("billing_page.see_pro_plans")}</Button>
                            </a>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Subscriptions */}
            <BillingInvoicesTable
                subscriptions={subscriptions}
            />
        </div>
    );
};

export default BillingPage;
