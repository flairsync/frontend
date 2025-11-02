import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PricingSelectorProps {
    value: string | null;
    onChange: (value: string) => void;
}

const pricingOptions = [
    { label: "$", description: "Budget" },
    { label: "$$", description: "Moderate" },
    { label: "$$$", description: "Expensive" },
    { label: "$$$$", description: "Luxury" },
];

const BusinessPricingSelector: React.FC<PricingSelectorProps> = ({ value, onChange }) => {
    return (
        <div className="space-y-2 w-full">
            <label className="font-medium text-sm text-gray-700">Pricing</label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                {pricingOptions.map((option) => {
                    const selected = value === option.label;

                    return (
                        <Button
                            key={option.label}
                            type="button"
                            variant={selected ? "default" : "outline"}
                            className={cn(
                                "flex flex-col items-center justify-center w-full py-7 text-sm transition-all hover:cursor-pointer",
                                selected && "ring-2 ring-primary ring-offset-1"
                            )}
                            onClick={() => onChange(option.label)}
                        >
                            <span className="text-base font-semibold">{option.label}</span>
                            <span className="text-xs ">{option.description}</span>
                        </Button>
                    );
                })}
            </div>
        </div>
    );
};

export default BusinessPricingSelector;
