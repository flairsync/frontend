import React from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { normalizeUrl } from "@/utils/url-utils";
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
    const { t } = useTranslation("management");
    const handleChange =
        (field: keyof SocialLinks) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                onChange({ ...values, [field]: e.target.value });
            };

    // P1-8 (QA round 6, 2026-11-20): "www.example.com" is accepted, but https:// was never
    // actually prepended anywhere the person could see — only at submit time, and only for
    // facebook/instagram (see useBusinessOps.ts), not website at all. Normalizing on blur
    // gives immediate visual feedback for all three fields; mapBusinessFormToCreateBusinessDto
    // still normalizes again before submit as a backstop (e.g. a submit that doesn't blur
    // the field first).
    const handleBlur =
        (field: keyof SocialLinks) =>
            (e: React.FocusEvent<HTMLInputElement>) => {
                const normalized = normalizeUrl(e.target.value);
                if (normalized !== values[field]) {
                    onChange({ ...values, [field]: normalized ?? "" });
                }
            };

    const links = [
        {
            key: "instagram" as const,
            label: "Instagram",
            placeholder: "instagram.com/yourpage",
            icon: <Instagram className="h-4 w-4 text-pink-500" />,
        },
        {
            key: "facebook" as const,
            label: "Facebook",
            placeholder: "facebook.com/yourpage",
            icon: <Facebook className="h-4 w-4 text-blue-600" />,
        },
        {
            key: "website" as const,
            label: t("create_business_page.step4.website_label"),
            placeholder: "yourwebsite.com",
            icon: <Globe className="h-4 w-4 text-muted-foreground" />,
        },
    ];

    // P1-13 (QA round 4, 2026-11-19): the wizard's own outer label
    // (create_business_page.step4.social_links_label, "Social Links (Optional)") already
    // labels this — this component's own inner "Social Links" heading duplicated it.
    return (
        <div className={cn("space-y-4", className)}>
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
                            type="text"
                            placeholder={link.placeholder}
                            value={values[link.key] || ""}
                            onChange={handleChange(link.key)}
                            onBlur={handleBlur(link.key)}
                            className="w-full"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BusinessSocialLinksInput;
