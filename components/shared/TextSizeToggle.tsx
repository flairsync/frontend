import { ALargeSmall, CheckCircle2 } from "lucide-react";
import { useTextSize, type TextSize } from "./text-size-provider";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const options: { value: TextSize; label: string }[] = [
    { value: "default", label: "Default" },
    { value: "large", label: "Large" },
    { value: "xlarge", label: "Extra Large" },
];

export function TextSizeToggle() {
    const { textSize, setTextSize } = useTextSize();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1.5 px-2 text-foreground/70 hover:text-foreground"
                    aria-label="Select text size"
                >
                    <ALargeSmall className="h-4 w-4 shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                {options.map(({ value, label }) => (
                    <DropdownMenuItem
                        key={value}
                        onClick={() => setTextSize(value)}
                        className="flex items-center gap-2"
                    >
                        {label}
                        {textSize === value && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
