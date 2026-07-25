import { useThemeCatalog } from "@/features/themes/useThemes";
import { ThemeCatalogItem } from "@/features/themes/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ThemesManagerProps {
    businessId: string;
}

const ThemeCard = ({
    theme,
    onApply,
    onPurchase,
    applying,
    purchasing,
}: {
    theme: ThemeCatalogItem;
    onApply: (themeId: string) => void;
    onPurchase: (themeId: string) => void;
    applying: boolean;
    purchasing: boolean;
}) => {
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
            <CardFooter>
                {theme.applied ? (
                    <Button disabled className="w-full" variant="outline">Currently applied</Button>
                ) : theme.owned ? (
                    <Button className="w-full" disabled={applying} onClick={() => onApply(theme.id)}>
                        Apply
                    </Button>
                ) : (
                    <Button
                        className="w-full"
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
                        applying={applyingTheme}
                        purchasing={purchasingTheme}
                    />
                ))}
            </div>
        </div>
    );
}
