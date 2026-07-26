import { useState } from "react";
import { Eye } from "lucide-react";
import { useThemeCatalog } from "@/features/themes/useThemes";
import { ThemeCatalogItem } from "@/features/themes/types";
import { THEME_REGISTRY } from "@/features/themes/registry";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ThemePreviewModal from "./ThemePreviewModal";

interface ThemesManagerProps {
    businessId: string;
}

const ThemeCard = ({
    theme,
    onApply,
    onPurchase,
    onPreview,
    applying,
    purchasing,
}: {
    theme: ThemeCatalogItem;
    onApply: (themeId: string) => void;
    onPurchase: (themeId: string) => void;
    onPreview: (theme: ThemeCatalogItem) => void;
    applying: boolean;
    purchasing: boolean;
}) => {
    // Only themes with a real coded design get a preview — otherwise the
    // iframe would silently render DefaultTheme's bare fallback and mislead
    // the owner into thinking that's the actual theme.
    const hasRealDesign = theme.key in THEME_REGISTRY;

    return (
        <Card className="overflow-hidden">
            <div className="aspect-video bg-muted flex items-center justify-center">
                {theme.previewImageUrl ? (
                    <img src={theme.previewImageUrl} alt={theme.name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-muted-foreground text-sm">No preview</span>
                )}
            </div>
            <CardHeader>
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{theme.name}</CardTitle>
                    {theme.category === "premium" && <Badge variant="secondary">Premium</Badge>}
                    {theme.applied && <Badge>Applied</Badge>}
                </div>
            </CardHeader>
            <CardContent>
                {theme.description && (
                    <p className="text-sm text-muted-foreground">{theme.description}</p>
                )}
            </CardContent>
            <CardFooter className="gap-2">
                {hasRealDesign && (
                    <Button variant="outline" size="icon" onClick={() => onPreview(theme)} aria-label="Preview theme">
                        <Eye />
                    </Button>
                )}
                {theme.applied ? (
                    <Button disabled className="flex-1" variant="outline">Currently applied</Button>
                ) : theme.owned ? (
                    <Button className="flex-1" disabled={applying} onClick={() => onApply(theme.id)}>
                        Apply
                    </Button>
                ) : (
                    <Button
                        className="flex-1"
                        variant="secondary"
                        disabled={purchasing}
                        onClick={() => onPurchase(theme.id)}
                    >
                        Buy for {theme.price.toFixed(2)} {theme.currency}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

export default function ThemesManager({ businessId }: ThemesManagerProps) {
    const {
        themes,
        fetchingThemes,
        themesLoadError,
        applyTheme,
        applyingTheme,
        purchaseTheme,
        purchasingTheme,
    } = useThemeCatalog(businessId);
    const [previewTheme, setPreviewTheme] = useState<ThemeCatalogItem | null>(null);

    if (fetchingThemes) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (themesLoadError) {
        return <p className="text-sm text-destructive">Could not load the theme catalog.</p>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Theme</h1>
                <p className="text-muted-foreground">
                    Choose the premade theme used for your public site.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {themes.map((theme) => (
                    <ThemeCard
                        key={theme.id}
                        theme={theme}
                        onApply={applyTheme}
                        onPurchase={purchaseTheme}
                        onPreview={setPreviewTheme}
                        applying={applyingTheme}
                        purchasing={purchasingTheme}
                    />
                ))}
            </div>

            <ThemePreviewModal
                theme={previewTheme}
                businessId={businessId}
                onOpenChange={(open) => !open && setPreviewTheme(null)}
                onApply={applyTheme}
                applying={applyingTheme}
                onPurchase={purchaseTheme}
                purchasing={purchasingTheme}
            />
        </div>
    );
}
