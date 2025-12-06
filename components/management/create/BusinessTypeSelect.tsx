import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BusinessType } from "@/models/business/BusinessType";

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
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {types?.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                            {option.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
