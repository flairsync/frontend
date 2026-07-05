import React, { useLayoutEffect, useRef } from "react";
import { animate, onScroll, utils, Scope, createScope } from "animejs";
import { TrendingUp, Clock, Leaf, CalendarCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

const stats = [
    {
        icon: TrendingUp,
        prefixKey: "landing_page.stats.items.0.prefix",
        valueKey: "landing_page.stats.items.0.value",
        labelKey: "landing_page.stats.items.0.label",
        subKey: "landing_page.stats.items.0.sub",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
    },
    {
        icon: Clock,
        prefixKey: "landing_page.stats.items.1.prefix",
        valueKey: "landing_page.stats.items.1.value",
        labelKey: "landing_page.stats.items.1.label",
        subKey: "landing_page.stats.items.1.sub",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    {
        icon: Leaf,
        prefixKey: "landing_page.stats.items.2.prefix",
        valueKey: "landing_page.stats.items.2.value",
        labelKey: "landing_page.stats.items.2.label",
        subKey: "landing_page.stats.items.2.sub",
        color: "text-amber-500",
        bg: "bg-amber-500/10",
    },
    {
        icon: CalendarCheck,
        prefixKey: "landing_page.stats.items.3.prefix",
        valueKey: "landing_page.stats.items.3.value",
        labelKey: "landing_page.stats.items.3.label",
        subKey: "landing_page.stats.items.3.sub",
        color: "text-violet-500",
        bg: "bg-violet-500/10",
    },
];

const LandingStatsBar = () => {
    const { t } = useTranslation("landing");
    const scope = useRef<Scope>(null);

    useLayoutEffect(() => {
        scope.current = createScope().add(() => {
            utils.$(".stat_card").forEach(($el, index) => {
                animate($el, {
                    opacity: [0, 1],
                    y: ["2rem", "0rem"],
                    duration: 500,
                    easing: "easeOutQuad",
                    autoplay: onScroll({ sync: "play", enter: "bottom top", leave: "center top" }),
                    delay: index * 80,
                });
            });
        });

        return () => scope.current?.revert();
    }, []);

    return (
        <section className="w-full border-y border-border bg-muted/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {stats.map(({ icon: Icon, prefixKey, valueKey, labelKey, subKey, color, bg }, i) => (
                        <div
                            key={i}
                            className="stat_card flex flex-col items-center text-center gap-3"
                            style={{ opacity: 0 }}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                                    {t(prefixKey)}
                                </p>
                                <p className={`text-4xl sm:text-5xl font-extrabold leading-none ${color}`}>
                                    {t(valueKey)}
                                </p>
                                <p className="text-sm font-semibold text-foreground mt-1.5">
                                    {t(labelKey)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 max-w-[160px] mx-auto leading-relaxed">
                                    {t(subKey)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LandingStatsBar;
