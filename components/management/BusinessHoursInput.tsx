import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Trash } from "lucide-react";

type Shift = { start: string; end: string };
type DayShifts = Shift[];

const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

const BusinessHoursInput: React.FC = () => {
    const [hours, setHours] = useState<Record<string, DayShifts>>(() => {
        const initial: Record<string, DayShifts> = {};
        daysOfWeek.forEach((day) => (initial[day] = []));
        return initial;
    });

    const addShift = (day: string) => {
        setHours((prev) => ({
            ...prev,
            [day]: [...prev[day], { start: "08:00", end: "17:00" }],
        }));
    };

    const removeShift = (day: string, index: number) => {
        setHours((prev) => ({
            ...prev,
            [day]: prev[day].filter((_, i) => i !== index),
        }));
    };

    const updateShift = (
        day: string,
        index: number,
        field: "start" | "end",
        value: string
    ) => {
        setHours((prev) => ({
            ...prev,
            [day]: prev[day].map((shift, i) =>
                i === index ? { ...shift, [field]: value } : shift
            ),
        }));
    };

    const handleSave = () => {
        console.log(hours);
        alert("Business hours saved! Check console for output.");
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
                    Opening Hours
                </h1>

                <Separator />

                {daysOfWeek.map((day) => (
                    <Card key={day}>
                        <CardHeader>
                            <CardTitle>{day}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {hours[day].map((shift, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 flex-wrap sm:flex-nowrap"
                                >
                                    <Input
                                        type="time"
                                        step="60"
                                        value={shift.start}
                                        onChange={(e) =>
                                            updateShift(day, index, "start", e.target.value)
                                        }
                                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                                    />

                                    <span>to</span>

                                    <Input
                                        type="time"
                                        step="60"
                                        value={shift.end}
                                        onChange={(e) =>
                                            updateShift(day, index, "end", e.target.value)
                                        }
                                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                                    />

                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => removeShift(day, index)}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}

                            <Button size="sm" onClick={() => addShift(day)}>
                                + Add Shift
                            </Button>
                        </CardContent>
                    </Card>
                ))}

                <div className="flex justify-end">
                    <Button onClick={handleSave}>Save Hours</Button>
                </div>
            </div>
        </div>
    );
};

export default BusinessHoursInput;
