import React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PricingSelectorProps {
    value: string | null;
    onChange: (value: string) => void;
}

const pricingOptions = [
    { label: "$", descriptionKey: "create_business_page.step2.pricing_budget" },
    { label: "$$", descriptionKey: "create_business_page.step2.pricing_moderate" },
    { label: "$$$", descriptionKey: "create_business_page.step2.pricing_expensive" },
    { label: "$$$$", descriptionKey: "create_business_page.step2.pricing_luxury" },
];

const BusinessPricingSelector: React.FC<PricingSelectorProps> = ({ value, onChange }) => {
    const { t } = useTranslation("management");
    return (
        // P1-13 (QA round 4, 2026-11-19): the wizard's own outer label
        // (create_business_page.step2.pricing_label, "Pricing Range") already labels this —
        // this component's own inner label duplicated it ("Pricing Range" / "Pricing").
        <div className="space-y-2 w-full">
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
                            <span className="text-xs ">{t(option.descriptionKey)}</span>
                        </Button>
                    );
                })}
            </div>
        </div>
    );
};

export default BusinessPricingSelector;
