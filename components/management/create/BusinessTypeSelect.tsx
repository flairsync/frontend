import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface BusinessTypeSelectProps {
    value: string;
    onChange: (newValue: string) => void;
    label?: string;
    options?: string[];
    placeholder?: string;
    error?: string;
}

export default function BusinessTypeSelect({
    value,
    onChange,
    label = "Business Type",
    options = [
        "Restaurant",
        "Coffee Shop",
        "Other",
    ],
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
                    {options.map((option) => (
                        <SelectItem key={option} value={option}>
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
