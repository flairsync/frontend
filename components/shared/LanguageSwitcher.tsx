import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Import SVGs (place them in /src/assets/flags/)
import EnFlag from "@/assets/flags/gb.svg";
import FrFlag from "@/assets/flags/fr.svg";
import EsFlag from "@/assets/flags/es.svg";
import CatFlag from "@/assets/flags/ad.svg";
import { useTranslation } from "react-i18next";



const languages = [
    { code: "en", label: "English", flag: EnFlag },
    { code: "fr", label: "Français", flag: FrFlag },
    { code: "es", label: "Español", flag: EsFlag },
    { code: "cat", label: "Catalan", flag: CatFlag },
];


export function LanguageSwitcher() {
    const [currentLang, setCurrentLang] = useState("en");
    const {
        i18n
    } = useTranslation();
    useEffect(() => {
        i18n.on("languageChanged", (lng) => {
            setCurrentLang(lng);
        })
    }, []);

    const handleSelect = (code: string) => {
        i18n.changeLanguage(code);
    };

    const current = languages.find((l) => l.code === currentLang);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {current && (
                        <img src={current.flag} alt={current.label} className="w-5 h-5" />
                    )}
                    <span>{current?.label}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleSelect(lang.code)}
                        className="flex items-center gap-2"
                    >
                        <img src={lang.flag} alt={lang.label} className="w-5 h-5" />
                        {lang.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
