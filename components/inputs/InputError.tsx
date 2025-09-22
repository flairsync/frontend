import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputErrorProps {
    message?: string;
    className?: string;
}

export function InputError({ message, className }: InputErrorProps) {
    if (!message) return null;

    return (
        <p
            className={cn(
                "flex items-center gap-2 text-sm text-red-600 mt-1",
                className
            )}
        >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{message}</span>
        </p>
    );
}
