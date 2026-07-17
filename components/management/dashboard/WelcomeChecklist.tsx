import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, X, Utensils, LayoutDashboard, Users, Rocket } from "lucide-react";
import { useMyBusiness } from "@/features/business/useMyBusiness";
import { useBusinessMenus } from "@/features/business/menu/useBusinessMenus";
import { useTables } from "@/features/floor-plan/useFloorPlan";
import { useBusinessEmployees } from "@/features/business/employment/useBusinessEmployees";
import { navigate } from "vike/client/router";

interface WelcomeChecklistProps {
    businessId: string;
}

const DISMISS_KEY_PREFIX = "flairsync_welcome_checklist_dismissed_";

export const WelcomeChecklist: React.FC<WelcomeChecklistProps> = ({ businessId }) => {
    const [dismissed, setDismissed] = useState(true);

    useEffect(() => {
        setDismissed(localStorage.getItem(`${DISMISS_KEY_PREFIX}${businessId}`) === "1");
    }, [businessId]);

    const { myBusinessFullDetails, fetchingMyBusinessFullDetails } = useMyBusiness(businessId);
    const { businessAllItems } = useBusinessMenus(businessId);
    const { tables } = useTables(businessId);
    const { employees, isPending: fetchingEmployees } = useBusinessEmployees(businessId);

    // Each of these starts out empty/undefined before its first fetch resolves.
    // Wait for all of them so we compute real completion once, instead of
    // showing a false "nothing done" state that then jumps to "all done" (or
    // vice versa) a moment later as each query finishes.
    const stillLoading =
        fetchingMyBusinessFullDetails ||
        fetchingEmployees ||
        businessAllItems === undefined ||
        tables === undefined;

    const steps = [
        {
            key: "menu",
            label: "Add your menu",
            description: "Create categories and items so guests know what you serve",
            done: (businessAllItems?.length ?? 0) > 0,
            icon: Utensils,
            href: `/manage/${businessId}/owner/menu`,
        },
        {
            key: "floor-plan",
            label: "Set up your floor plan",
            description: "Add tables so staff can seat guests and take dine-in orders",
            done: (tables?.length ?? 0) > 0,
            icon: LayoutDashboard,
            href: `/manage/${businessId}/owner/floor-plan`,
        },
        {
            key: "staff",
            label: "Invite your team",
            description: "Bring in staff and assign them roles",
            done: (employees ?? []).some((e) => e.type !== "OWNER"),
            icon: Users,
            href: `/manage/${businessId}/owner/staff`,
        },
        {
            key: "publish",
            label: "Publish your business",
            description: "Go live so customers can find and order from you",
            done: Boolean(myBusinessFullDetails?.isPublished),
            icon: Rocket,
            href: `/manage/${businessId}/owner/settings?section=general-info`,
        },
    ];

    const completedCount = steps.filter((s) => s.done).length;
    const allDone = completedCount === steps.length;

    // Still loading data has no visible state to animate away from, so skip
    // straight to nothing — only a previously-visible card (dismissed or
    // just-completed) animates out.
    if (stillLoading) return null;

    const handleDismiss = () => {
        localStorage.setItem(`${DISMISS_KEY_PREFIX}${businessId}`, "1");
        setDismissed(true);
    };

    return (
        <AnimatePresence>
            {!dismissed && !allDone && (
                <motion.div
                    key="welcome-checklist"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                >
                    <Card className="shadow-sm border-primary/20 bg-primary/[0.02]">
                        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                            <div>
                                <CardTitle>Welcome! Let's get you set up</CardTitle>
                                <CardDescription>
                                    {completedCount} of {steps.length} steps complete — finish these to get your business ready for guests.
                                </CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleDismiss} title="Dismiss">
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Progress value={(completedCount / steps.length) * 100} />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {steps.map((step) => (
                                    <button
                                        key={step.key}
                                        type="button"
                                        onClick={() => navigate(step.href)}
                                        className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/5 ${step.done ? "opacity-60" : ""}`}
                                    >
                                        {step.done ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                                        ) : (
                                            <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                        )}
                                        <div>
                                            <p className={`text-sm font-medium ${step.done ? "line-through text-muted-foreground" : "text-zinc-800 dark:text-zinc-100"}`}>
                                                {step.label}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
