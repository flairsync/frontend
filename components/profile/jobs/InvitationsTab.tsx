import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Building2, Check, Loader2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMyInvitations } from "@/features/business/invitations/useMyInvitations";
import { cn } from "@/lib/utils";

// ─── Shared ───────────────────────────────────────────────────────────────────

const INVITATION_STATUS_CLASSES: Record<string, string> = {
  PENDING:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  ACCEPTED:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  DECLINED:  "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  EXPIRED:   "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  CANCELLED: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

// ─── Invitations tab ──────────────────────────────────────────────────────────

export const InvitationsTab = () => {
  const { t } = useTranslation("profile");
  const { invitations, loadingInvitations, acceptInvitation, accepting, declineInvitation, declining } =
    useMyInvitations();

  const isBusy = accepting || declining;

  if (loadingInvitations) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground">{t("my_jobs.invitations.loading")}</p>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center border-2 border-dashed border-border rounded-2xl p-12">
        <Building2 className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-base font-semibold mb-1">{t("my_jobs.invitations.empty_title")}</p>
        <p className="text-sm text-muted-foreground">
          {t("my_jobs.invitations.empty_description")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {invitations.map((inv) => {
        const badgeClass = INVITATION_STATUS_CLASSES[inv.status] ?? INVITATION_STATUS_CLASSES.EXPIRED;
        const statusLabel = t(`my_jobs.invitations.status.${inv.status}`, { defaultValue: t("my_jobs.invitations.status.EXPIRED") });
        const isExpired = inv.status === "EXPIRED" || new Date(inv.expiresAt) < new Date();
        const canAct = inv.status === "PENDING" && !isExpired;

        return (
          <div
            key={inv.id}
            className={cn(
              "rounded-xl border p-4",
              canAct
                ? "border-indigo-200 bg-indigo-50/40 dark:border-indigo-800 dark:bg-indigo-950/20"
                : "border-border bg-card"
            )}
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 border border-border shrink-0">
                <AvatarImage src={inv.business?.logo} alt={inv.business?.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                  {inv.business?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-semibold text-sm">{inv.business?.name ?? t("my_jobs.invitations.business_fallback")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("my_jobs.invitations.invited_to_join")}
                    </p>
                  </div>
                  <span className={cn("text-xs font-medium px-2 py-1 rounded-full shrink-0", badgeClass)}>
                    {statusLabel}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  {canAct
                    ? t("my_jobs.invitations.expires_on", { date: format(new Date(inv.expiresAt), "MMM d, yyyy") })
                    : inv.acceptedAt
                    ? t("my_jobs.invitations.accepted_on", { date: format(new Date(inv.acceptedAt), "MMM d, yyyy") })
                    : inv.declinedAt
                    ? t("my_jobs.invitations.declined_on", { date: format(new Date(inv.declinedAt), "MMM d, yyyy") })
                    : t("my_jobs.invitations.sent_on", { date: format(new Date(inv.createdAt), "MMM d, yyyy") })}
                </p>

                {canAct && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => acceptInvitation(inv.token)}
                      disabled={isBusy}
                    >
                      {accepting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                      {t("my_jobs.invitations.accept")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                      onClick={() => declineInvitation(inv.token)}
                      disabled={isBusy}
                    >
                      {declining ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                      {t("my_jobs.invitations.decline")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
