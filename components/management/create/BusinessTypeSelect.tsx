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

interface BusinessTypeSelectProps {
    value: string;
    types: BusinessType[] | undefined;
    onChange: (newValue: string) => void;
    label?: string;
    placeholder?: string;
    error?: string;
}

export default function BusinessTypeSelect({
    value,
    onChange,
    label = "Business Type",
    types,
    placeholder = "Select a business type...",
    error,
}: BusinessTypeSelectProps) {
    return (
        <div className="flex flex-col space-y-1.5">
            {label && <Label>{label}</Label>}

            <Select value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} >{
                        types?.find(val => val.id == value)?.name
                    }</SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {types?.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                            <div
                                className="flex flex-row "
                            >
                                {option.name}
                                {
                                    option.id == value && <Check height={20} width={20} />
                                }
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
