"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlaskConical, UserCheck, Gift, Wrench, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePublicPlatformSettings } from "@/features/platform-settings/usePlatformSettings";

// A full-width top/bottom strip would collide with the many per-page fixed
// headers (BusinessManagementHeader, LandingHeader, DinerModeHeader, etc.)
// or the cookie consent banner, so this follows ClockedInBanner's floating
// corner-pill pattern instead — bottom-left, opposite ClockedInBanner's
// bottom-right, so the two never overlap. Collapsed to just the icon at
// rest; hovering grows it into a labelled pill (pure CSS, no layout shift
// for siblings since it's position:fixed); clicking opens the details modal
// regardless of hover state, so it still works on touch devices.
export default function BetaModeBanner() {
  const { t } = useTranslation("common");
  const { data } = usePublicPlatformSettings();
  const [open, setOpen] = useState(false);

  if (!data?.betaModeEnabled) return null;

  const points = [
    { icon: UserCheck, title: t("beta_mode.modal_point_approval_title"), text: t("beta_mode.modal_point_approval_text") },
    { icon: Gift, title: t("beta_mode.modal_point_free_title"), text: t("beta_mode.modal_point_free_text") },
    { icon: Wrench, title: t("beta_mode.modal_point_changing_title"), text: t("beta_mode.modal_point_changing_text") },
    { icon: Mail, title: t("beta_mode.modal_point_transition_title"), text: t("beta_mode.modal_point_transition_text") },
  ];

  return (
    <>
      <div className="fixed bottom-6 left-6 z-40">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("beta_mode.banner_aria_label")}
          title={t("beta_mode.banner_aria_label")}
          className="group flex items-center gap-0 overflow-hidden rounded-full bg-amber-500 py-3 pl-3 pr-3 text-amber-950 shadow-2xl transition-[padding] duration-300 ease-out hover:gap-2 hover:pr-4"
        >
          <FlaskConical className="h-4 w-4 shrink-0" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-300 ease-out group-hover:max-w-xs group-hover:opacity-100">
            {t("beta_mode.banner_text")}
          </span>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="mx-auto sm:mx-0 mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
              <FlaskConical className="h-5 w-5 text-amber-500" />
            </div>
            <DialogTitle>{t("beta_mode.modal_title")}</DialogTitle>
            <DialogDescription>{t("beta_mode.modal_description")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {points.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                  <Icon className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={() => setOpen(false)} className="w-full sm:w-auto">
              {t("beta_mode.modal_close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
