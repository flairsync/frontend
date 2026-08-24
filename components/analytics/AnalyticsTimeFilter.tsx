import React from "react";
import { useTranslation } from "react-i18next";
import { subDays, subMonths, startOfMonth, startOfDay, endOfDay, formatISO } from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export type TimeRangePreset = "Today" | "Last 7 Days" | "Last 30 Days" | "This Month" | "Last Month";

const PRESET_LABEL_KEYS: Record<TimeRangePreset, string> = {
    "Today": "analytics.time_filter.today",
    "Last 7 Days": "analytics.time_filter.last_7_days",
    "Last 30 Days": "analytics.time_filter.last_30_days",
    "This Month": "analytics.time_filter.this_month",
    "Last Month": "analytics.time_filter.last_month",
};

interface AnalyticsTimeFilterProps {
    value: TimeRangePreset;
    onChange: (preset: TimeRangePreset, startDate: string, endDate: string) => void;
}

export const AnalyticsTimeFilter: React.FC<AnalyticsTimeFilterProps> = ({ value, onChange }) => {
    const { t } = useTranslation("management");
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
            <SelectTrigger className="w-48">
                <SelectValue placeholder={t("analytics.time_filter.placeholder")} />
            </SelectTrigger>
            <SelectContent>
                {(Object.keys(PRESET_LABEL_KEYS) as TimeRangePreset[]).map((preset) => (
                    <SelectItem key={preset} value={preset}>
                        {t(PRESET_LABEL_KEYS[preset])}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
