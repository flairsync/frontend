import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";

type Shift = {
    open: string;
    close: string;
};

export interface DayHours {
    isClosed: boolean;
    shifts: Shift[];
}

export interface WorkHours {
    [day: string]: DayHours;
}

interface WorkHoursSelectorProps {
    value: WorkHours;
    onChange: (newValue: WorkHours) => void;
}

const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
];

export default function WorkHoursSelector({ value, onChange }: WorkHoursSelectorProps) {
    const handleToggleClosed = (day: string, closed: boolean) => {
        onChange({
            ...value,
            [day]: {
                ...value[day],
                isClosed: closed,
            },
        });
    };

    const handleShiftChange = (
        day: string,
        index: number,
        field: "open" | "close",
        time: string
    ) => {
        const newShifts = [...(value[day].shifts || [])];
        newShifts[index] = { ...newShifts[index], [field]: time };
        onChange({
            ...value,
            [day]: { ...value[day], shifts: newShifts },
        });
    };

    const addShift = (day: string) => {
        const newShifts = [...(value[day].shifts || []), { open: "09:00", close: "17:00" }];
        onChange({
            ...value,
            [day]: { ...value[day], shifts: newShifts },
        });
    };

    const removeShift = (day: string, index: number) => {
        const newShifts = value[day].shifts.filter((_, i) => i !== index);
        onChange({
            ...value,
            [day]: { ...value[day], shifts: newShifts },
        });
    };

    return (
        <Card className="mt-6 w-full">
            <CardContent className="p-4 space-y-6">
                <h2 className="text-lg font-semibold text-gray-800">🕒 Business Hours</h2>

                <div className="space-y-4">
                    {daysOfWeek.map((day) => {
                        const dayData = value[day] || { isClosed: false, shifts: [] };

                        return (
                            <div
                                key={day}
                                className="border border-gray-200 rounded-xl p-3 bg-gray-50 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <Label className="font-medium text-gray-700">{day}</Label>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={!dayData.isClosed}
                                            onCheckedChange={(checked) => handleToggleClosed(day, !checked)}
                                        />
                                        <span className="text-sm text-gray-600">
                                            {dayData.isClosed ? "Closed" : "Open"}
                                        </span>
                                    </div>
                                </div>

                                {!dayData.isClosed ? (
                                    <div className="flex flex-col gap-3">
                                        {dayData.shifts.length === 0 && (
                                            <p className="text-sm text-gray-500 italic">No shifts added yet</p>
                                        )}

                                        {dayData.shifts.map((shift, i) => (
                                            <div
                                                key={i}
                                                className="flex flex-wrap items-center gap-3 border border-gray-200 bg-white p-2 rounded-lg"
                                            >
                                                <div className="flex flex-col">
                                                    <Label className="text-xs text-gray-500">Opens</Label>
                                                    <input
                                                        type="time"
                                                        className="border rounded-md p-1 text-sm"
                                                        value={shift.open}
                                                        onChange={(e) =>
                                                            handleShiftChange(day, i, "open", e.target.value)
                                                        }
                                                    />
                                                </div>

                                                <div className="flex flex-col">
                                                    <Label className="text-xs text-gray-500">Closes</Label>
                                                    <input
                                                        type="time"
                                                        className="border rounded-md p-1 text-sm"
                                                        value={shift.close}
                                                        onChange={(e) =>
                                                            handleShiftChange(day, i, "close", e.target.value)
                                                        }
                                                    />
                                                </div>

                                                <span className="text-xs text-gray-500 italic">
                                                    {shift.open > shift.close ? "Next day ➜" : ""}
                                                </span>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeShift(day, i)}
                                                    className="ml-auto text-gray-500 hover:text-red-500"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}

                                        <Button
                                            onClick={() => addShift(day)}
                                            variant="outline"
                                            className="w-fit text-sm flex items-center gap-1 mt-2"
                                        >
                                            <Plus className="h-4 w-4" /> Add Shift
                                        </Button>
                                    </div>
                                ) : (
                                    <span className="text-sm text-gray-500">Day off</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
