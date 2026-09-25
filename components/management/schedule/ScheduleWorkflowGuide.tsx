import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight, ClipboardList, Repeat, CalendarRange, Send, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

const STORAGE_KEY = "flairsync.schedule_guide_collapsed";

interface GuideStep {
    /** The tab this step lives in — same values the page's `?tab=` param uses. */
    tab: string;
    icon: LucideIcon;
    titleKey: string;
    bodyKey: string;
    /** Steps you can skip entirely and still end up with a working rota. */
    optional?: boolean;
}

const STEPS: GuideStep[] = [
    { tab: "shifts", icon: ClipboardList, titleKey: "step_presets_title", bodyKey: "step_presets_body", optional: true },
    { tab: "rules", icon: Repeat, titleKey: "step_rules_title", bodyKey: "step_rules_body", optional: true },
    { tab: "manage", icon: CalendarRange, titleKey: "step_build_title", bodyKey: "step_build_body" },
    { tab: "manage", icon: Send, titleKey: "step_publish_title", bodyKey: "step_publish_body" },
];

interface ScheduleWorkflowGuideProps {
    /** Switches the page's tab in place — the page owns the tab state. */
    onJumpToTab: (tab: string) => void;
}

/**
 * The four-step "how does any of this fit together" explainer above the rota tabs.
 *
 * The scheduling module has three concepts that sound interchangeable but aren't:
 * presets are only saved times, recurring rules are the thing that repeats, and
 * Generate is what turns rules into actual (draft) shifts. Nothing in the tabs
 * themselves says so, so it's said once, here.
 */
export const ScheduleWorkflowGuide: React.FC<ScheduleWorkflowGuideProps> = ({ onJumpToTab }) => {
    const { t } = useTranslation("management");

    // Starts collapsed on the server render so the guide never flashes open for
    // someone who dismissed it; the stored preference is read on mount.
    const [collapsed, setCollapsed] = useState(true);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
        } catch {
            setCollapsed(false);
        }
        setHydrated(true);
    }, []);

    const toggle = () => {
        const next = !collapsed;
        setCollapsed(next);
        try {
            localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
        } catch {
            // Private browsing / blocked site data — the guide just won't remember.
        }
    };

    return (
        <div className="rounded-lg border bg-muted/30">
            <div className="flex items-center justify-between gap-2 px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                    <HelpCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-semibold truncate">{t("schedule_workflow_guide.title")}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs shrink-0" onClick={toggle}>
                    {collapsed ? t("schedule_workflow_guide.show") : t("schedule_workflow_guide.hide")}
                </Button>
            </div>

            {hydrated && !collapsed && (
                <div className="px-4 pb-4 space-y-3">
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        {STEPS.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <button
                                    key={step.titleKey}
                                    type="button"
                                    onClick={() => onJumpToTab(step.tab)}
                                    className="group text-left rounded-md border bg-background p-3 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                                >
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                                            {index + 1}
                                        </span>
                                        <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                        <span className="text-xs font-semibold truncate">{t(`schedule_workflow_guide.${step.titleKey}`)}</span>
                                        <ChevronRight className="w-3.5 h-3.5 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                    </div>
                                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                                        {t(`schedule_workflow_guide.${step.bodyKey}`)}
                                    </p>
                                    {step.optional && (
                                        <span className="inline-block mt-1.5 text-[10px] font-medium text-muted-foreground/80 uppercase tracking-wide">
                                            {t("schedule_workflow_guide.optional")}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{t("schedule_workflow_guide.footnote")}</p>
                </div>
            )}
        </div>
    );
};

export default ScheduleWorkflowGuide;
