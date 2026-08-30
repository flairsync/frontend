"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ShieldAlert, X } from "lucide-react";
import { navigate } from "vike/client/router";
import { useProfile } from "@/features/profile/useProfile";
import { getCsrfToken } from "@/lib/flairapi";
import { getPasswordBreachDismissedAt, setPasswordBreachDismissedAt } from "@/utils/cookies";

// Bottom-center is deliberately a third position, distinct from
// ClockedInBanner (bottom-right) and BetaModeBanner (bottom-left) — see
// BetaModeBanner's comment for why top placement collides with the fixed
// per-page headers instead. Always rendered expanded (not hover-to-reveal
// like BetaModeBanner) since this is an actionable security warning, not an
// announcement. Dismiss persists in a cookie (not the DB — not worth a
// backend field for a UI preference), keyed to the current passwordBreachedAt
// value so it survives reloads/re-logins but reappears if the password is
// later flagged breached again with a new timestamp.
//
// Reads live via useProfile rather than pageContext.user.passwordBreached:
// this component is mounted globally (LayoutDefault), including on
// prerendered pages like the landing page, where pageContext.user is frozen
// at build time and never reflects the visitor's actual cookie state (see
// useProfile's own comment on `enabled`). The live check is gated on the
// (non-httpOnly) csrf_token cookie rather than being unconditional, so
// anonymous visitors on the landing page don't fire a doomed authenticated
// request on every pageview — that cookie is set/cleared in lockstep with
// the real (httpOnly) session cookies on login/logout.
export default function PasswordBreachBanner() {
  const { t } = useTranslation("common");
  const [dismissedAt, setDismissedAt] = useState(getPasswordBreachDismissedAt);
  const { userProfile } = useProfile({ enabled: getCsrfToken() != null });

  if (
    !userProfile?.passwordBreachedAt ||
    dismissedAt === userProfile.passwordBreachedAt
  ) {
    return null;
  }

  const label = t(
    "password_breach_banner.aria_label",
    "Your password was found in a data breach — click to change it",
  );

  return (
    <div className="fixed inset-x-4 bottom-6 z-40 flex justify-center">
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
        className="flex max-w-full cursor-pointer items-center gap-2 rounded-full bg-red-600 py-3 pl-4 pr-2 text-white shadow-2xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <ShieldAlert className="h-4 w-4 shrink-0" />
        <span className="min-w-0 text-sm font-semibold">
          {t(
            "password_breach_banner.text",
            "Your password was found in a data breach — please change it",
          )}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPasswordBreachDismissedAt(userProfile.passwordBreachedAt!);
            setDismissedAt(userProfile.passwordBreachedAt!);
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
