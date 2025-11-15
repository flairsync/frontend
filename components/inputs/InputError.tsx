import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface InputErrorProps {
    message?: string;
    className?: string;
}

export function InputError({ message, className }: InputErrorProps) {
    const { t } = useTranslation();
    if (!message) return null;

    return (
        <p
            className={cn(
                "flex items-center gap-2 text-sm text-red-600 mt-1",
                className
            )}
        >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{t(message)}</span>
        </p>
    );
}
