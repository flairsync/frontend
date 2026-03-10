import React from "react";
import { subDays, subMonths, startOfMonth, startOfDay, endOfDay, formatISO } from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export type TimeRangePreset = "Today" | "Last 7 Days" | "Last 30 Days" | "This Month" | "Last Month";

interface AnalyticsTimeFilterProps {
    value: TimeRangePreset;
    onChange: (preset: TimeRangePreset, startDate: string, endDate: string) => void;
}

export const AnalyticsTimeFilter: React.FC<AnalyticsTimeFilterProps> = ({ value, onChange }) => {
    const handleValueChange = (val: string) => {
        const preset = val as TimeRangePreset;
        const now = new Date();
        let start: Date;
        let end: Date = endOfDay(now);

        switch (preset) {
            case "Today":
                start = startOfDay(now);
                break;
            case "Last 7 Days":
                start = startOfDay(subDays(now, 7));
                break;
            case "Last 30 Days":
                start = startOfDay(subDays(now, 30));
                break;
            case "This Month":
                start = startOfMonth(now);
                break;
            case "Last Month":
                start = startOfMonth(subMonths(now, 1));
                // End of last month is just before the start of this month
                end = endOfDay(subDays(startOfMonth(now), 1));
                break;
            default:
                start = startOfDay(subDays(now, 7));
                break;
        }

        onChange(preset, formatISO(start), formatISO(end));
    };

    return (
        <Select value={value} onValueChange={handleValueChange}>
            <SelectTrigger className="w-48 bg-white dark:bg-zinc-950">
                <SelectValue placeholder="Select Time Range" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="Today">Today</SelectItem>
                <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
                <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
                <SelectItem value="This Month">This Month</SelectItem>
                <SelectItem value="Last Month">Last Month</SelectItem>
            </SelectContent>
        </Select>
    );
};
