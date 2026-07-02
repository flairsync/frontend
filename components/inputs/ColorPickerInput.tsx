import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ColorPickerInputProps {
    label: string;
    value: string;
    onChange: (hex: string) => void;
    className?: string;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function ColorPickerInput({ label, value, onChange, className }: ColorPickerInputProps) {
    return (
        <div className={cn("space-y-2", className)}>
            <Label>{label}</Label>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={HEX_RE.test(value) ? value : "#000000"}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-10 w-10 shrink-0 cursor-pointer rounded-md border border-input bg-background p-1"
                />
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#000000"
                    className="font-mono"
                />
            </div>
        </div>
    );
}
