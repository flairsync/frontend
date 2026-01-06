import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
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

    return (
        <Card className="mt-6 w-full">
            <CardContent className="p-4 space-y-6">
                {!hideTitle && (
                    <h2 className="text-lg font-semibold text-gray-800">
                        🕒 Business Hours
                    </h2>
                )}

                <div className="space-y-4">
                    {hoursByDay.map((dayHours) => (
                        <div
                            key={dayHours.day}
                            className="border border-gray-200 rounded-xl p-3 bg-gray-50 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <Label className="font-medium text-gray-700 capitalize">
                                    {dayHours.day}
                                </Label>

                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={!dayHours.isClosed}
                                        onCheckedChange={(checked) =>
                                            toggleClosed(dayHours.day, !checked)
                                        }
                                    />
                                    <span className="text-sm text-gray-600">
                                        {dayHours.isClosed ? "Closed" : "Open"}
                                    </span>
                                </div>
                            </div>

                            {!dayHours.isClosed ? (
                                <div className="flex flex-col gap-3">
                                    {dayHours.periods.length === 0 && (
                                        <p className="text-sm text-gray-500 italic">
                                            No shifts added yet
                                        </p>
                                    )}

                                    {dayHours.periods.map((p, i) => (
                                        <div
                                            key={p.id ?? i}
                                            className="flex flex-wrap items-center gap-3 border border-gray-200 bg-white p-2 rounded-lg"
                                        >
                                            <div className="flex flex-col">
                                                <Label className="text-xs text-gray-500">Opens</Label>
                                                <input
                                                    type="time"
                                                    value={p.open}
                                                    className="border rounded-md p-1 text-sm"
                                                    onChange={(e) =>
                                                        updatePeriod(dayHours.day, i, "open", e.target.value)
                                                    }
                                                />
                                            </div>

                                            <div className="flex flex-col">
                                                <Label className="text-xs text-gray-500">Closes</Label>
                                                <input
                                                    type="time"
                                                    value={p.close}
                                                    className="border rounded-md p-1 text-sm"
                                                    onChange={(e) =>
                                                        updatePeriod(dayHours.day, i, "close", e.target.value)
                                                    }
                                                />
                                            </div>

                                            <span className="text-xs text-gray-500 italic">
                                                {p.open > p.close ? "Next day ➜" : ""}
                                            </span>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="ml-auto text-gray-500 hover:text-red-500"
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
                                        <Plus className="h-4 w-4" /> Add Shift
                                    </Button>
                                </div>
                            ) : (
                                <span className="text-sm text-gray-500">Day off</span>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
