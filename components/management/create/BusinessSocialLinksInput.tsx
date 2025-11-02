import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Facebook, Instagram, Globe } from "lucide-react";

interface SocialLinks {
    instagram?: string;
    facebook?: string;
    website?: string;
}

interface SocialLinksInputProps {
    values: SocialLinks;
    onChange: (values: SocialLinks) => void;
    className?: string;
}

const BusinessSocialLinksInput: React.FC<SocialLinksInputProps> = ({
    values,
    onChange,
    className,
}) => {
    const handleChange =
        (field: keyof SocialLinks) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                onChange({ ...values, [field]: e.target.value });
            };

    const links = [
        {
            key: "instagram" as const,
            label: "Instagram",
            placeholder: "https://instagram.com/yourpage",
            icon: <Instagram className="h-4 w-4 text-pink-500" />,
        },
        {
            key: "facebook" as const,
            label: "Facebook",
            placeholder: "https://facebook.com/yourpage",
            icon: <Facebook className="h-4 w-4 text-blue-600" />,
        },
        {
            key: "website" as const,
            label: "Website",
            placeholder: "https://yourwebsite.com",
            icon: <Globe className="h-4 w-4 text-gray-500" />,
        },
    ];

    return (
        <div className={cn("space-y-4", className)}>
            <Label className="font-medium text-sm text-gray-700">
                Social Links
            </Label>
            <div className="grid gap-3">
                {links.map((link) => (
                    <div key={link.key} className="space-y-1">
                        <div className="flex items-center gap-2">
                            {link.icon}
                            <Label htmlFor={link.key} className="text-sm font-medium">
                                {link.label}
                            </Label>
                        </div>
                        <Input
                            id={link.key}
                            type="url"
                            placeholder={link.placeholder}
                            value={values[link.key] || ""}
                            onChange={handleChange(link.key)}
                            className="w-full"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BusinessSocialLinksInput;
