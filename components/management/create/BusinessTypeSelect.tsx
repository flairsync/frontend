import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BusinessType } from "@/models/business/BusinessType";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BusinessTypeSelectProps {
    value: string;
    types: BusinessType[] | undefined;
    onChange: (newValue: string) => void;
    placeholder?: string;
    error?: string;
}

export default function BusinessTypeSelect({
    value,
    onChange,
    types,
    placeholder,
    error,
}: BusinessTypeSelectProps) {
    const { t } = useTranslation();
    // P1-25 (QA round 4, 2026-11-19): this default was a hardcoded English literal, never
    // reachable to translate since no call site overrides it with a translated string.
    const resolvedPlaceholder = placeholder ?? t("business_type_select_placeholder");

    return (
        <div className="flex flex-col space-y-1.5">
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder={resolvedPlaceholder} >{
                        types?.find(val => val.id == value)?.name ? t(`business_types.${types?.find(val => val.id == value)?.name}`) : undefined
                    }</SelectValue>
                </SelectTrigger>
                {/* KAN-79: pin exact trigger width (not just the min-width the shadcn default
                    gives it) and force side="bottom" so Radix's collision-avoidance can't flip
                    it above the trigger, which was overlapping the Description field above it. */}
                <SelectContent
                    position="popper"
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    className="w-[var(--radix-select-trigger-width)]"
                >
                    {types?.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                            <div
                                className="flex flex-row "
                            >
                                {t(`business_types.${option.name}`)}
                                {
                                    option.id == value && <Check height={20} width={20} />
                                }
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
