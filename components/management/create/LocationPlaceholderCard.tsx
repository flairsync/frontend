import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { MapPinOff } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LocationPlaceholderCardProps {
    title?: string;
    description?: string;
}

export function LocationPlaceholderCard({
    title,
    description,
}: LocationPlaceholderCardProps) {
    const { t } = useTranslation("management");
    title ??= t("create_business_page.step3.location_required_title");
    description ??= t("create_business_page.step3.location_required_description");
    return (
        <Card className="h-80 w-full flex items-center justify-center text-center border-dashed">
            <CardHeader>
                <div className="flex flex-col items-center gap-3">
                    <MapPinOff className="h-10 w-10 text-muted-foreground" />
                    <h2 className="text-lg font-semibold">{title}</h2>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
