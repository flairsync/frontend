import { ALargeSmall, CheckCircle2 } from "lucide-react";
import { useTextSize, type TextSize } from "./text-size-provider";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

const options: { value: TextSize; labelKey: string }[] = [
    { value: "default", labelKey: "text_size_toggle.default" },
    { value: "large", labelKey: "text_size_toggle.large" },
    { value: "xlarge", labelKey: "text_size_toggle.xlarge" },
];

export function TextSizeToggle() {
    const { textSize, setTextSize } = useTextSize();
    const { t } = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1.5 px-2 text-foreground/70 hover:text-foreground"
                    aria-label={t('text_size_toggle.select')}
                >
                    <ALargeSmall className="h-4 w-4 shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                {options.map(({ value, labelKey }) => (
                    <DropdownMenuItem
                        key={value}
                        onClick={() => setTextSize(value)}
                        className="flex items-center gap-2"
                    >
                        {t(labelKey)}
                        {textSize === value && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
