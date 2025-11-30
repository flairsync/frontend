import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { MapPinOff } from "lucide-react";

interface LocationPlaceholderCardProps {
    title?: string;
    description?: string;
}

export function LocationPlaceholderCard({
    title = "Location Required",
    description = "Please select a country or enable location to show the map.",
}: LocationPlaceholderCardProps) {
    return (
        <Card className="h-80 w-full flex items-center justify-center text-center border-dashed">
            <CardHeader>
                <div className="flex flex-col items-center gap-3">
                    <MapPinOff className="h-10 w-10 text-gray-500" />
                    <h2 className="text-lg font-semibold">{title}</h2>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
