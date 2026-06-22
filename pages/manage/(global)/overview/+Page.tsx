import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, LogIn, Building2, Crown, ChevronRight, Ban, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useSubscriptions } from "@/features/subscriptions/useSubscriptions";
import { useUsage } from "@/features/subscriptions/useUsage";
import { useMyBusinesses } from "@/features/business/useMyBusinesses";
import { useMyEmployments } from "@/features/business/employment/useMyEmployments";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useSubscriptionStore } from "@/features/subscriptions/SubscriptionStore";
import { SubscriptionStatus } from "@/models/Subscription";
import { cn } from "@/lib/utils";
import { MyEmployment } from "@/models/business/MyEmployment";
import { useTranslation } from "react-i18next";

const ManagePage: React.FC = () => {
    const { t } = useTranslation("management");
    const { currentUserSubscription } = useSubscriptions();
    const { usage, isLoading: loadingUsage } = useUsage();
    const { myBusinesses, loadingMyBussinesses } = useMyBusinesses();
    const { myEmployments, loadingMyEmployments } = useMyEmployments();
    const { openUpgradeModal } = useSubscriptionStore();

    const joinedBusinesses = myEmployments?.filter(
        (emp: MyEmployment) => emp.type === "INVITED" && emp.status === "ACTIVE" && emp.business
    ) || [];

    const canCreateBusiness = usage?.canCreateBusiness ?? (currentUserSubscription ? true : false);

    return (
        <div className="min-h-screen bg-background p-4 sm:p-8">

            <div className="max-w-6xl mx-auto space-y-12 mt-8">
                {/* SUBSCRIPTION & USAGE OVERVIEW */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-1 shadow-sm border-border/60 overflow-hidden bg-card">
                        <CardHeader className="bg-muted/50 border-b border-border">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Crown className="h-5 w-5 text-primary" />
                                {t("manage_overview.current_plan_title")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {currentUserSubscription ? (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-3xl font-bold text-foreground">{currentUserSubscription.pack?.name}</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge
                                                variant={currentUserSubscription.status === SubscriptionStatus.ACTIVE ? "default" : "destructive"}
                                                className={cn(
                                                    "rounded-full",
                                                    (currentUserSubscription.status === SubscriptionStatus.ACTIVE || currentUserSubscription.isDefault)
                                                        ? "bg-green-600 hover:bg-green-700"
                                                        : currentUserSubscription.status === SubscriptionStatus.ON_TRIAL
                                                            ? "bg-blue-600 hover:bg-blue-700"
                                                            : ""
                                                )}
                                            >
                                                {currentUserSubscription.isDefault
                                                    ? t("manage_overview.status.free_plan")
                                                    : currentUserSubscription.status === SubscriptionStatus.ON_TRIAL
                                                        ? t("manage_overview.status.free_trial")
                                                        : (currentUserSubscription.status?.toUpperCase() || t("manage_overview.status.active"))}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground font-medium">
                                                {currentUserSubscription.isDefault
                                                    ? t("manage_overview.never_renews")
                                                    : currentUserSubscription.status === SubscriptionStatus.ON_TRIAL
                                                        ? t("manage_overview.trial_ends_on", { date: currentUserSubscription.getRenewalDate("MMM DD, YYYY") ?? "N/A" })
                                                        : t("manage_overview.renews_on", { date: currentUserSubscription.getRenewalDate("MMM DD, YYYY") ?? "N/A" })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-border">
                                        <a href="/manage/plans">
                                            <Button variant="outline" className="w-full justify-between group">
                                                {t("manage_overview.manage_subscription_button")}
                                                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center py-4">
                                    <div className="bg-muted p-4 rounded-full mb-4">
                                        <Ban className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">{t("manage_overview.no_active_plan_title")}</h3>
                                    <p className="text-sm text-muted-foreground mb-6">{t("manage_overview.no_active_plan_subtitle")}</p>
                                    <a href="/manage/plans">
                                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">{t("manage_overview.explore_plans_button")}</Button>
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 shadow-sm border-border/60 bg-card">
                        <CardHeader className="bg-muted/50 border-b border-border">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <AlertCircle className="h-5 w-5 text-primary" />
                                {t("manage_overview.resource_usage_title")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 px-8">
                            {usage ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                    <UsageItem
                                        label={t("manage_overview.usage_labels.businesses")}
                                        current={usage.current.businesses}
                                        allowed={usage.allowed.businesses}
                                    />
                                    <UsageItem
                                        label={t("manage_overview.usage_labels.menus_active")}
                                        current={usage.current.menus}
                                        allowed={usage.allowed.menus}
                                    />
                                    <UsageItem
                                        label={t("manage_overview.usage_labels.products")}
                                        current={usage.current.products}
                                        allowed={usage.allowed.products}
                                    />
                                    <UsageItem
                                        label={t("manage_overview.usage_labels.employees")}
                                        current={usage.current.employees}
                                        allowed={usage.allowed.employees}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center py-10 text-muted-foreground">
                                    {loadingUsage ? t("manage_overview.loading_usage") : t("manage_overview.usage_unavailable")}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                    {/* OWNED BUSINESSES */}
                    <section className="space-y-6">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h2 className="text-xl sm:text-2xl font-bold text-foreground">{t("manage_overview.my_businesses_title")}</h2>
                                <p className="text-sm text-muted-foreground mt-1">{t("manage_overview.my_businesses_subtitle")}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <Button
                                    variant={canCreateBusiness ? "default" : "outline"}
                                    className={cn("gap-2 shadow-sm h-11", !canCreateBusiness && "border-border text-muted-foreground cursor-not-allowed")}
                                    onClick={() => {
                                        if (canCreateBusiness) {
                                            window.location.href = "/manage/owned/new";
                                        } else {
                                            openUpgradeModal(t("manage_overview.business_limit_reached"));
                                        }
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>{t("manage_overview.create_new_button")}</span>
                                </Button>
                                {!canCreateBusiness && (
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-tight">{t("manage_overview.upgrade_required_label")}</span>
                                )}
                            </div>
                        </div>

                        {loadingMyBussinesses ? (
                            <div className="grid grid-cols-1 gap-4">
                                {[1, 2].map(i => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}
                            </div>
                        ) : myBusinesses && myBusinesses.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {myBusinesses.map((biz) => (
                                    <motion.div
                                        key={biz.id}
                                        whileHover={{ x: 8 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Card
                                            className="cursor-pointer hover:shadow-md transition-all border-border/80 bg-card group flex flex-col"
                                            onClick={() => (window.location.href = `/manage/${biz.id}/owner/dashboard`)}
                                        >
                                            <CardContent className="p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                            <Building2 className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-lg block text-foreground">{biz.name}</span>
                                                            <span className="text-xs text-muted-foreground font-medium">{t("manage_overview.owner_dashboard_label")}</span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                                                </div>

                                                {/* PER-BUSINESS USAGE */}
                                                {biz.counts && usage && (
                                                    <div className="pt-4 mt-2 border-t border-border/80 grid grid-cols-2 gap-4">
                                                        <UsageItem
                                                            label={t("manage_overview.usage_labels.employees")}
                                                            current={biz.counts.employees}
                                                            allowed={usage.allowed.employees}
                                                        />
                                                        <UsageItem
                                                            label={t("manage_overview.usage_labels.menus")}
                                                            current={biz.counts.menus}
                                                            allowed={usage.allowed.menus}
                                                        />
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-border rounded-3xl bg-muted/30">
                                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground/50 mb-4">
                                    <Building2 className="h-8 w-8" />
                                </div>
                                <h3 className="font-bold text-lg text-foreground">{t("manage_overview.no_businesses_title")}</h3>
                                <p className="text-sm text-muted-foreground max-w-xs mt-2">{t("manage_overview.no_businesses_subtitle")}</p>
                            </div>
                        )}
                    </section>

                    {/* STAFF BUSINESSES */}
                    <section className="space-y-6">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h2 className="text-xl sm:text-2xl font-bold text-foreground">{t("manage_overview.joined_businesses_title")}</h2>
                                <p className="text-sm text-muted-foreground mt-1">{t("manage_overview.joined_businesses_subtitle")}</p>
                            </div>
                            <Button variant="outline" className="gap-2 shadow-sm border-border h-11 shrink-0" onClick={() => window.location.href = "/manage/join"}>
                                <LogIn className="h-4 w-4" />
                                {t("manage_overview.join_button")}
                            </Button>
                        </div>

                        {loadingMyEmployments ? (
                            <div className="grid grid-cols-1 gap-4">
                                {[1].map(i => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}
                            </div>
                        ) : joinedBusinesses.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {joinedBusinesses.map((emp: MyEmployment) => (
                                    <motion.div
                                        key={emp.id}
                                        whileHover={{ x: 8 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Card
                                            className="cursor-pointer hover:shadow-md transition-all border-border/80 bg-card group"
                                            onClick={() => (window.location.href = `/manage/${emp.business.id}/staff/dashboard`)}
                                        >
                                            <CardContent className="flex items-center justify-between p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                                        <Building2 className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-lg block text-foreground">{emp.business.name}</span>
                                                        <span className="text-xs text-muted-foreground font-medium">{t("manage_overview.staff_member_label")}</span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-green-600 transition-colors" />
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-border rounded-3xl bg-muted/30">
                                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground/50 mb-4">
                                    <Building2 className="h-8 w-8" />
                                </div>
                                <h3 className="font-bold text-lg text-foreground">{t("manage_overview.no_teams_title")}</h3>
                                <p className="text-sm text-muted-foreground max-w-xs mt-2">{t("manage_overview.no_teams_subtitle")}</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

const UsageItem = ({ label, current, allowed }: { label: string, current: number, allowed: number }) => {
    const percentage = Math.min((current / allowed) * 100, 100);
    const isFull = current >= allowed;

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-foreground/80">{label}</span>
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", isFull ? "bg-amber-100 text-amber-700 font-bold" : "text-muted-foreground bg-muted")}>
                    {current} / {allowed}
                </span>
            </div>
            <Progress value={percentage} className={cn("h-1.5", isFull ? "[&>div]:bg-amber-500 bg-amber-100" : "[&>div]:bg-primary bg-primary/10")} />
        </div>
    );
}

export default ManagePage;
