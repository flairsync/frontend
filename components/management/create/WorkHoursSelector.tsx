import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, CopyPlus } from "lucide-react";
import { OpeningHours, OpeningPeriod } from "@/models/business/MyBusinessFullDetails";

interface WorkHoursSelectorProps {
    value?: OpeningHours[];
    onChange: (newValue: OpeningHours[]) => void;
    hideTitle?: boolean;
}

const DAYS_OF_WEEK = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
] as const;

export default function WorkHoursSelector({
    value,
    onChange,
    hideTitle,
}: WorkHoursSelectorProps) {
    const { t } = useTranslation("management");
    /**
     * Normalize input:
     * - undefined value
     * - missing days
     * - keep correct order
     */
    const hoursByDay = useMemo(() => {
        const map = new Map<string, OpeningHours>();

        value?.forEach((h) => map.set(h.day, h));

        return DAYS_OF_WEEK.map((day) => {
            return (
                map.get(day) ??
                new OpeningHours(undefined as any, day, false, [])
            );
        });
    }, [value]);

    const updateDay = (day: string, updater: (oh: OpeningHours) => OpeningHours) => {
        const updated = hoursByDay.map((oh) =>
            oh.day === day ? updater(oh) : oh
        );
        onChange(updated);
    };

    const toggleClosed = (day: string, closed: boolean) => {
        updateDay(day, (oh) =>
            new OpeningHours(oh.id, oh.day, closed, closed ? [] : oh.periods)
        );
    };

    const addPeriod = (day: string) => {
        updateDay(day, (oh) =>
            new OpeningHours(oh.id, oh.day, oh.isClosed, [
                ...oh.periods,
                new OpeningPeriod(undefined as any, "09:00", "17:00"),
            ])
        );
    };

    const updatePeriod = (
        day: string,
        index: number,
        field: "open" | "close",
        value: string
    ) => {
        updateDay(day, (oh) => {
            const periods = [...oh.periods];
            const p = periods[index];
            periods[index] = new OpeningPeriod(
                p.id,
                field === "open" ? value : p.open,
                field === "close" ? value : p.close
            );
            return new OpeningHours(oh.id, oh.day, oh.isClosed, periods);
        });
    };

    const removePeriod = (day: string, index: number) => {
        updateDay(day, (oh) =>
            new OpeningHours(
                oh.id,
                oh.day,
                oh.isClosed,
                oh.periods.filter((_, i) => i !== index)
            )
        );
    };

    const duplicateToAllDays = (day: string) => {
        const source = hoursByDay.find((oh) => oh.day === day);
        if (!source) return;

        const updated = hoursByDay.map((oh) =>
            oh.day === day
                ? oh
                : new OpeningHours(
                      oh.id,
                      oh.day,
                      source.isClosed,
                      source.periods.map(
                          (p) => new OpeningPeriod(undefined as any, p.open, p.close)
                      )
                  )
        );
        onChange(updated);
    };

    return (
        <Card className="mt-6 w-full">
            <CardContent className="p-4 space-y-6">
                {!hideTitle && (
                    <h2 className="text-lg font-semibold text-foreground">
                        {t("work_hours_selector.title")}
                    </h2>
                )}

                <div className="space-y-4">
                    {hoursByDay.map((dayHours) => (
                        <div
                            key={dayHours.day}
                            className="border border-border rounded-xl p-3 bg-muted/50 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <Label className="font-medium text-foreground capitalize">
                                    {t(`schedule_recurring_rules_tab.days.${dayHours.day}`)}
                                </Label>

                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={!dayHours.isClosed}
                                        onCheckedChange={(checked) =>
                                            toggleClosed(dayHours.day, !checked)
                                        }
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        {dayHours.isClosed ? t("work_hours_selector.closed") : t("work_hours_selector.open")}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        title={t("work_hours_selector.copy_to_all_days")}
                                        className="text-muted-foreground hover:text-primary"
                                        onClick={() => duplicateToAllDays(dayHours.day)}
                                    >
                                        <CopyPlus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {!dayHours.isClosed ? (
                                <div className="flex flex-col gap-3">
                                    {dayHours.periods.length === 0 && (
                                        <p className="text-sm text-muted-foreground italic">
                                            {t("work_hours_selector.no_shifts_yet")}
                                        </p>
                                    )}

                                    {dayHours.periods.map((p, i) => (
                                        <div
                                            key={p.id ?? i}
                                            className="flex flex-wrap items-center gap-3 border border-border bg-background p-2 rounded-lg"
                                        >
                                            <div className="flex flex-col">
                                                <Label className="text-xs text-muted-foreground">{t("work_hours_selector.opens_label")}</Label>
                                                <input
                                                    type="time"
                                                    value={p.open}
                                                    className="border border-border rounded-md p-1 text-sm bg-background text-foreground"
                                                    onChange={(e) =>
                                                        updatePeriod(dayHours.day, i, "open", e.target.value)
                                                    }
                                                />
                                            </div>

                                            <div className="flex flex-col">
                                                <Label className="text-xs text-muted-foreground">{t("work_hours_selector.closes_label")}</Label>
                                                <input
                                                    type="time"
                                                    value={p.close}
                                                    className="border border-border rounded-md p-1 text-sm bg-background text-foreground"
                                                    onChange={(e) =>
                                                        updatePeriod(dayHours.day, i, "close", e.target.value)
                                                    }
                                                />
                                            </div>

                                            <span className="text-xs text-muted-foreground italic">
                                                {p.open > p.close ? t("work_hours_selector.next_day") : ""}
                                            </span>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="ml-auto text-muted-foreground hover:text-destructive"
                                                onClick={() => removePeriod(dayHours.day, i)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    <Button
                                        variant="outline"
                                        className="w-fit text-sm flex items-center gap-1 mt-2"
                                        onClick={() => addPeriod(dayHours.day)}
                                    >
                                        <Plus className="h-4 w-4" /> {t("work_hours_selector.add_shift")}
                                    </Button>
                                </div>
                            ) : (
                                <span className="text-sm text-muted-foreground">{t("work_hours_selector.day_off")}</span>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
