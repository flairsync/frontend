"use client";

import { useTranslation } from "react-i18next";
import { FlaskConical } from "lucide-react";
import { usePublicPlatformSettings } from "@/features/platform-settings/usePlatformSettings";

// A full-width top/bottom strip would collide with the many per-page fixed
// headers (BusinessManagementHeader, LandingHeader, DinerModeHeader, etc.)
// or the cookie consent banner, so this follows ClockedInBanner's floating
// corner-pill pattern instead — bottom-left, opposite ClockedInBanner's
// bottom-right, so the two never overlap.
export default function BetaModeBanner() {
  const { t } = useTranslation("common");
  const { data } = usePublicPlatformSettings();

  if (!data?.betaModeEnabled) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <div className="flex items-center gap-2 rounded-full shadow-2xl px-4 py-3 text-sm font-semibold text-amber-950 bg-amber-500">
        <FlaskConical className="h-4 w-4 shrink-0" />
        <span>{t("beta_mode.banner_text")}</span>
      </div>
    </div>
  );
}
