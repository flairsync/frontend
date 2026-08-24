import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Monitor, Smartphone, ExternalLink } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeCatalogItem } from "@/features/themes/types";

interface ThemePreviewModalProps {
    theme: ThemeCatalogItem | null;
    businessId: string;
    onOpenChange: (open: boolean) => void;
    onApply: (themeId: string) => void;
    applying: boolean;
    onPurchase: (themeId: string) => void;
    purchasing: boolean;
}

// Iframes the real /business/:id/site route (via the ?theme= preview
// override in pages/business/@id/site/+Page.tsx) so what the owner sees here
// is exactly what customers will see — not a re-implementation. Depends on
// that route staying framable same-origin; if a future CSP/helmet pass adds
// frame-ancestors restrictions, this preview needs an explicit allowance.
export default function ThemePreviewModal({
    theme,
    businessId,
    onOpenChange,
    onApply,
    applying,
    onPurchase,
    purchasing,
}: ThemePreviewModalProps) {
    const { t } = useTranslation("management");
    const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");

    const iframeSrc = useMemo(
        () => (theme ? `/business/${businessId}/site?theme=${encodeURIComponent(theme.key)}` : ""),
        [theme, businessId],
    );

    return (
        <Dialog open={!!theme} onOpenChange={onOpenChange}>
            <DialogContent className="w-[96vw] max-w-[1400px] h-[92vh] p-0 flex flex-col gap-0 sm:rounded-2xl overflow-hidden">
                {theme && (
                    <>
                        <div className="flex items-center justify-between gap-4 border-b px-6 py-3 shrink-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <h2 className="font-semibold truncate">{theme.name}</h2>
                                {theme.category === "premium" && <Badge variant="secondary">{t("themes_manager.premium_badge")}</Badge>}
                            </div>

                            <Tabs value={viewport} onValueChange={(v) => setViewport(v as "desktop" | "mobile")}>
                                <TabsList>
                                    <TabsTrigger value="desktop" className="gap-1.5">
                                        <Monitor size={14} /> {t("themes_manager.preview_modal.desktop")}
                                    </TabsTrigger>
                                    <TabsTrigger value="mobile" className="gap-1.5">
                                        <Smartphone size={14} /> {t("themes_manager.preview_modal.mobile")}
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="flex items-center gap-2 shrink-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(iframeSrc, "_blank")}
                                >
                                    <ExternalLink size={14} /> {t("themes_manager.preview_modal.open_new_tab")}
                                </Button>
                                {theme.applied ? (
                                    <Button size="sm" disabled variant="outline">{t("themes_manager.currently_applied")}</Button>
                                ) : theme.owned ? (
                                    <Button
                                        size="sm"
                                        disabled={applying}
                                        onClick={() => {
                                            onApply(theme.id);
                                            onOpenChange(false);
                                        }}
                                    >
                                        {t("themes_manager.preview_modal.apply_this_theme")}
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        disabled={purchasing}
                                        onClick={() => onPurchase(theme.id)}
                                    >
                                        {t("themes_manager.buy_for", { price: theme.price.toFixed(2), currency: theme.currency })}
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-4 md:p-8">
                            <div
                                className={
                                    viewport === "desktop"
                                        ? "w-full h-full rounded-lg overflow-hidden border shadow-sm bg-background"
                                        : "w-[390px] h-[780px] max-h-full rounded-[2.5rem] border-8 border-foreground/80 shadow-2xl overflow-hidden bg-background"
                                }
                            >
                                <iframe
                                    src={iframeSrc}
                                    title={t("themes_manager.preview_modal.preview_title", { name: theme.name })}
                                    className="w-full h-full border-0"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
