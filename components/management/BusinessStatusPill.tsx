import React from "react";
import { Check } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type BusinessStatusValue = "auto" | "open" | "closed";

const STATUS_CHOICES: { value: BusinessStatusValue; label: string }[] = [
    { value: "auto", label: "Auto (follow hours)" },
    { value: "open", label: "Force open" },
    { value: "closed", label: "Force closed" },
];

type Props = {
    status?: BusinessStatusValue;
    isOpen?: boolean;
    canEdit: boolean;
    onChange?: (status: BusinessStatusValue) => void;
    saving?: boolean;
};

const BusinessStatusPill = ({ status, isOpen, canEdit, onChange, saving }: Props) => {
    const pill = (
        <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium transition-colors ${isOpen
                ? "bg-green-500/10 text-green-600 border-green-500/20"
                : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                } ${canEdit ? "hover:opacity-80 cursor-pointer" : ""}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-green-500" : "bg-rose-500"}`} />
            {isOpen ? "Open" : "Closed"}
        </span>
    );

    if (!canEdit) return pill;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={saving}>
                <button type="button">{pill}</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                {STATUS_CHOICES.map((choice) => (
                    <DropdownMenuItem
                        key={choice.value}
                        onClick={() => onChange?.(choice.value)}
                        className="justify-between"
                    >
                        {choice.label}
                        {status === choice.value && <Check className="w-4 h-4" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default BusinessStatusPill;
