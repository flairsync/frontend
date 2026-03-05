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
import { cn } from "@/lib/utils";
import { MyEmployment } from "@/models/business/MyEmployment";

const ManagePage: React.FC = () => {
    const { currentUserSubscription } = useSubscriptions();
    const { usage, isLoading: loadingUsage } = useUsage();
    const { myBusinesses, loadingMyBussinesses } = useMyBusinesses();
    const { myEmployments, loadingMyEmployments } = useMyEmployments();
    const { openUpgradeModal } = useSubscriptionStore();

    const joinedBusinesses = myEmployments?.filter(
        (emp: MyEmployment) => emp.type === "INVITED" && emp.status === "ACTIVE"
    ) || [];

    const canCreateBusiness = usage?.canCreateBusiness ?? (currentUserSubscription ? true : false);

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-zinc-950 p-4 sm:p-8">

            <div className="max-w-6xl mx-auto space-y-12 mt-8">
                {/* SUBSCRIPTION & USAGE OVERVIEW */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-1 shadow-sm border-zinc-200/60 overflow-hidden bg-white">
                        <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Crown className="h-5 w-5 text-indigo-600" />
                                Current Plan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {currentUserSubscription ? (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-3xl font-bold text-zinc-900">{currentUserSubscription.pack?.name}</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge
                                                variant={currentUserSubscription.status === "active" ? "default" : "destructive"}
                                                className={cn("rounded-full", currentUserSubscription.status === "active" && "bg-green-600 hover:bg-green-700")}
                                            >
                                                {currentUserSubscription.status.toUpperCase()}
                                            </Badge>
                                            <span className="text-xs text-zinc-500 font-medium">
                                                Renews on {currentUserSubscription.getRenewalDate("MMM DD, YYYY")}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-zinc-100">
                                        <a href="/manage/plans">
                                            <Button variant="outline" className="w-full justify-between group">
                                                Manage Subscription
                                                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center py-4">
                                    <div className="bg-zinc-100 p-4 rounded-full mb-4">
                                        <Ban className="h-8 w-8 text-zinc-400" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">No Active Plan</h3>
                                    <p className="text-sm text-zinc-500 mb-6">Unlock more features by choosing a plan.</p>
                                    <a href="/manage/plans">
                                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Explore Plans</Button>
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 shadow-sm border-zinc-200/60 bg-white">
                        <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <AlertCircle className="h-5 w-5 text-indigo-600" />
                                Resource Usage
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 px-8">
                            {usage ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                    <UsageItem
                                        label="Businesses"
                                        current={usage.current.businesses}
                                        allowed={usage.allowed.businesses}
                                    />
                                    <UsageItem
                                        label="Menus (Active)"
                                        current={usage.current.menus}
                                        allowed={usage.allowed.menus}
                                    />
                                    <UsageItem
                                        label="Products"
                                        current={usage.current.products}
                                        allowed={usage.allowed.products}
                                    />
                                    <UsageItem
                                        label="Employees"
                                        current={usage.current.employees}
                                        allowed={usage.allowed.employees}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center py-10 text-zinc-400">
                                    {loadingUsage ? "Loading usage data..." : "Usage data unavailable"}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* OWNED BUSINESSES */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-zinc-900">My Restaurants</h2>
                                <p className="text-sm text-zinc-500 mt-1">Manage and edit your business profiles.</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <Button
                                    variant={canCreateBusiness ? "default" : "outline"}
                                    className={cn("gap-2 shadow-sm h-11", !canCreateBusiness && "border-zinc-200 text-zinc-400 cursor-not-allowed")}
                                    onClick={() => {
                                        if (canCreateBusiness) {
                                            window.location.href = "/manage/owned/new";
                                        } else {
                                            openUpgradeModal("You've reached your business limit. Upgrade to add more locations.");
                                        }
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Create New</span>
                                </Button>
                                {!canCreateBusiness && (
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight">Upgrade Required</span>
                                )}
                            </div>
                        </div>

                        {loadingMyBussinesses ? (
                            <div className="grid grid-cols-1 gap-4">
                                {[1, 2].map(i => <div key={i} className="h-24 bg-zinc-100 rounded-2xl animate-pulse" />)}
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
                                            className="cursor-pointer hover:shadow-md transition-all border-zinc-100/80 bg-white group"
                                            onClick={() => (window.location.href = `/manage/${biz.id}/owner/dashboard`)}
                                        >
                                            <CardContent className="flex items-center justify-between p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                        <Building2 className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-lg block text-zinc-900">{biz.name}</span>
                                                        <span className="text-xs text-zinc-500 font-medium">Owner Dashboard</span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-zinc-300 group-hover:text-indigo-600 transition-colors" />
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-zinc-100 rounded-3xl bg-zinc-50/30">
                                <div className="h-16 w-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-300 mb-4">
                                    <Building2 className="h-8 w-8" />
                                </div>
                                <h3 className="font-bold text-lg text-zinc-900">No restaurants yet</h3>
                                <p className="text-sm text-zinc-500 max-w-xs mt-2">Start your journey by adding your first restaurant or cafe.</p>
                            </div>
                        )}
                    </section>

                    {/* STAFF BUSINESSES */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-zinc-900">Joined Teams</h2>
                                <p className="text-sm text-zinc-500 mt-1">Businesses where you work as staff.</p>
                            </div>
                            <Button variant="outline" className="gap-2 shadow-sm border-zinc-200 h-11" onClick={() => window.location.href = "/manage/join"}>
                                <LogIn className="h-4 w-4" />
                                Join Team
                            </Button>
                        </div>

                        {loadingMyEmployments ? (
                            <div className="grid grid-cols-1 gap-4">
                                {[1].map(i => <div key={i} className="h-24 bg-zinc-100 rounded-2xl animate-pulse" />)}
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
                                            className="cursor-pointer hover:shadow-md transition-all border-zinc-100/80 bg-white group"
                                            onClick={() => (window.location.href = `/manage/${emp.business.id}/staff/dashboard`)}
                                        >
                                            <CardContent className="flex items-center justify-between p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                                        <Building2 className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-lg block text-zinc-900">{emp.business.name}</span>
                                                        <span className="text-xs text-zinc-500 font-medium">Staff Member</span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-zinc-300 group-hover:text-green-600 transition-colors" />
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-zinc-100 rounded-3xl bg-zinc-50/30">
                                <div className="h-16 w-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-300 mb-4">
                                    <Building2 className="h-8 w-8" />
                                </div>
                                <h3 className="font-bold text-lg text-zinc-900">Not in any teams</h3>
                                <p className="text-sm text-zinc-500 max-w-xs mt-2">When you join a business team, it will appear here.</p>
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
                <span className="text-sm font-bold text-zinc-700">{label}</span>
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", isFull ? "bg-amber-100 text-amber-700 font-bold" : "text-zinc-500 bg-zinc-100")}>
                    {current} / {allowed}
                </span>
            </div>
            <Progress value={percentage} className={cn("h-1.5", isFull ? "[&>div]:bg-amber-500 bg-amber-100" : "[&>div]:bg-indigo-600 bg-indigo-50")} />
        </div>
    );
}

export default ManagePage;
