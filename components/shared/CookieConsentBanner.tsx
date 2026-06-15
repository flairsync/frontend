"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Cookie, Settings2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { getCookieConsent, setCookieConsent, type CookieConsent } from "@/utils/cookies";

type Prefs = Omit<CookieConsent, "necessary">;

const defaultPrefs: Prefs = {
  functional: false,
  analytics: false,
  marketing: false,
};

export default function CookieConsentBanner() {
  const { t } = useTranslation("common");
  const [visible, setVisible] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);

  useEffect(() => {
    if (getCookieConsent() === null) {
      setVisible(true);
    }
  }, []);

  const save = (consent: CookieConsent) => {
    setCookieConsent(consent);
    setVisible(false);
    setSheetOpen(false);
  };

  const acceptAll = () =>
    save({ necessary: true, functional: true, analytics: true, marketing: true });

  const rejectAll = () =>
    save({ necessary: true, functional: false, analytics: false, marketing: false });

  const saveCustom = () =>
    save({ necessary: true, ...prefs });

  if (!visible) return null;

  return (
    <>
      {/* Bottom banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
        <div className="container mx-auto max-w-6xl px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Cookie className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-sm text-muted-foreground flex-1">
            {t("cookies.banner_text")}{" "}
            <a href="/gdpr" className="underline text-foreground hover:text-primary transition-colors">
              {t("cookies.learn_more")}
            </a>
            .
          </p>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSheetOpen(true)}
              className="text-muted-foreground"
            >
              <Settings2 className="h-4 w-4 mr-1.5" />
              {t("cookies.manage")}
            </Button>
            <Button variant="outline" size="sm" onClick={rejectAll}>
              <X className="h-4 w-4 mr-1.5" />
              {t("cookies.reject_all")}
            </Button>
            <Button size="sm" onClick={acceptAll}>
              <Check className="h-4 w-4 mr-1.5" />
              {t("cookies.accept_all")}
            </Button>
          </div>
        </div>
      </div>

      {/* Preferences sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md overflow-y-auto rounded-l-3xl top-3 bottom-3 h-auto border-l-0 shadow-2xl"
        >
          <SheetHeader className="px-7 pt-7 pb-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-primary/10 rounded-xl p-2.5">
                <Cookie className="h-5 w-5 text-primary" />
              </div>
              <SheetTitle className="text-lg">
                {t("cookies.preferences_title")}
              </SheetTitle>
            </div>
            <SheetDescription className="text-sm leading-relaxed">
              {t("cookies.preferences_description")}
            </SheetDescription>
          </SheetHeader>

          <div className="px-7 space-y-3">
            <ConsentRow
              label={t("cookies.categories.necessary.label")}
              description={t("cookies.categories.necessary.description")}
              badge={t("cookies.always_active")}
              checked={true}
              disabled
            />
            <ConsentRow
              label={t("cookies.categories.functional.label")}
              description={t("cookies.categories.functional.description")}
              checked={prefs.functional}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, functional: v }))}
            />
            <ConsentRow
              label={t("cookies.categories.analytics.label")}
              description={t("cookies.categories.analytics.description")}
              checked={prefs.analytics}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
            />
            <ConsentRow
              label={t("cookies.categories.marketing.label")}
              description={t("cookies.categories.marketing.description")}
              checked={prefs.marketing}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
            />
          </div>

          <div className="px-7 pb-7 flex flex-col gap-2 mt-6 pt-5 border-t border-border">
            <Button onClick={saveCustom} className="w-full rounded-xl h-11">
              {t("cookies.save_preferences")}
            </Button>
            <Button variant="outline" onClick={rejectAll} className="w-full rounded-xl h-11">
              {t("cookies.reject_all")}
            </Button>
            <Button variant="ghost" onClick={acceptAll} className="w-full rounded-xl h-11 text-muted-foreground">
              {t("cookies.accept_all")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function ConsentRow({
  label,
  description,
  badge,
  checked,
  disabled,
  onCheckedChange,
}: {
  label: string;
  description: string;
  badge?: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-4 bg-muted/40 rounded-2xl px-4 py-4">
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold">{label}</span>
          {badge && (
            <Badge variant="secondary" className="text-xs rounded-full">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className="shrink-0 mt-0.5"
      />
    </div>
  );
}
