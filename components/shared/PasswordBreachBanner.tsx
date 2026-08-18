"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ShieldAlert, X } from "lucide-react";
import { usePageContext } from "vike-react/usePageContext";
import { navigate } from "vike/client/router";

// Bottom-center is deliberately a third position, distinct from
// ClockedInBanner (bottom-right) and BetaModeBanner (bottom-left) — see
// BetaModeBanner's comment for why top placement collides with the fixed
// per-page headers instead. Always rendered expanded (not hover-to-reveal
// like BetaModeBanner) since this is an actionable security warning, not an
// announcement. Dismiss is per-session only (plain component state) — the
// underlying risk doesn't go away until the password is actually changed,
// so it reappears on the next login/page load rather than being permanently
// silenced.
export default function PasswordBreachBanner() {
  const { t } = useTranslation("common");
  const pageContext = usePageContext();
  const [dismissed, setDismissed] = useState(false);

  if (!pageContext.user?.passwordBreached || dismissed) return null;

  const label = t(
    "password_breach_banner.aria_label",
    "Your password was found in a data breach — click to change it",
  );

  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate("/profile/settings")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate("/profile/settings");
          }
        }}
        aria-label={label}
        title={label}
        className="flex cursor-pointer items-center gap-2 rounded-full bg-red-600 py-3 pl-4 pr-2 text-white shadow-2xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <ShieldAlert className="h-4 w-4 shrink-0" />
        <span className="whitespace-nowrap text-sm font-semibold">
          {t(
            "password_breach_banner.text",
            "Your password was found in a data breach — please change it",
          )}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
          aria-label={t("password_breach_banner.dismiss_aria_label", "Dismiss")}
          className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/20"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
