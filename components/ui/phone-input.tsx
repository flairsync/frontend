"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import * as RPNI from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { type Country, getCountryCallingCode } from "react-phone-number-input";

type PhoneInputProps = React.ComponentProps<"input"> & {
    value?: string;
    onChange?: (value: string) => void;
    defaultCountry?: Country;
};

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
    ({ className, value, onChange, defaultCountry = "TN", ...props }, ref) => {
        return (
            <RPNI.default
                ref={ref as any}
                international
                withCountryCallingCode
                defaultCountry={defaultCountry}
                value={value}
                onChange={(val) => onChange?.(val || "")}
                inputComponent={InputComponent}
                smartCaret={false}
                className={cn("flex", className)}
                flagComponent={FlagComponent as any}
                countrySelectComponent={CountrySelect as any}
                {...(props as any)}
            />
        );
    }
);
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<
    HTMLInputElement,
    React.ComponentProps<"input">
>(({ className, ...props }, ref) => (
    <Input
        className={cn("rounded-e-lg rounded-s-none", className)}
        {...props}
        ref={ref}
    />
));
InputComponent.displayName = "InputComponent";

type CountrySelectOption = { label: string; value: Country };

type CountrySelectProps = {
    disabled?: boolean;
    value: Country;
    onChange: (value: Country) => void;
    options: CountrySelectOption[];
};

const CountrySelect = ({
    disabled,
    value,
    onChange,
    options,
}: CountrySelectProps) => {
    const handleSelect = React.useCallback(
        (country: Country) => {
            onChange(country);
        },
        [onChange]
    );

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant={"outline"}
                    className={cn("flex gap-1 rounded-e-none rounded-s-lg px-3")}
                    disabled={disabled}
                >
                    <FlagComponent country={value} countryName={value} />
                    <ChevronsUpDown
                        className={cn(
                            "-mr-2 h-4 w-4 opacity-50",
                            disabled ? "hidden" : "opacity-100"
                        )}
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 shadow-2xl rounded-2xl border-none">
                <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandList className="max-h-none overflow-visible">
                        <div
                            className="h-72 overflow-y-auto overscroll-contain px-1"
                            onWheel={(e) => e.stopPropagation()}
                        >
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                                {options
                                    .filter((x) => x.value)
                                    .map((option) => (
                                        <CommandItem
                                            className="gap-2"
                                            key={option.value}
                                            onSelect={() => handleSelect(option.value)}
                                        >
                                            <FlagComponent
                                                country={option.value}
                                                countryName={option.label}
                                            />
                                            <span className="flex-1 text-sm">{option.label}</span>
                                            {option.value && (
                                                <span className="text-foreground/50 text-sm">
                                                    +{getCountryCallingCode(option.value)}
                                                </span>
                                            )}
                                            <Check
                                                className={cn(
                                                    "ml-auto h-4 w-4",
                                                    option.value === value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                            </CommandGroup>
                        </div>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

const FlagComponent = ({ country, countryName }: { country: Country; countryName: string }) => {
    const Flag = flags[country];

    return (
        <span className="bg-foreground/20 flex h-4 w-6 overflow-hidden rounded-sm">
            {Flag && <Flag title={countryName} />}
        </span>
    );
};
FlagComponent.displayName = "FlagComponent";

export { PhoneInput };
