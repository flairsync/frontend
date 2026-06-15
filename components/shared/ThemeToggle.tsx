import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle2 } from "lucide-react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1.5 px-2 text-foreground/70 hover:text-foreground"
                    aria-label="Select theme"
                >
                    <Icon className="h-4 w-4 shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Light
                    {theme === "light" && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark
                    {theme === "dark" && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Auto
                    {theme === "system" && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
