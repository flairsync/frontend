import { useTranslation } from "react-i18next";
import { FlaskConical, Hourglass, Mail, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import WebsiteLogo from "@/components/shared/WebsiteLogo";

// Shown in place of the business dashboard for a user whose BetaApplication
// is still PENDING or was REJECTED — replaces the old behavior of letting
// every dashboard sub-page mount and fire its own data fetches, each of
// which would 403 and pop its own "Access Denied" dialog. Mounting this
// instead of `children` means none of those calls ever fire.
export default function BetaPendingScreen({ status }: { status: "PENDING" | "REJECTED" }) {
    const { t } = useTranslation("common");
    const isRejected = status === "REJECTED";

    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-6 py-16">
            <a href="/" className="mb-8">
                <WebsiteLogo />
            </a>
            <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${isRejected ? "bg-destructive/10" : "bg-amber-500/10"}`}>
                {isRejected ? (
                    <Ban className="h-7 w-7 text-destructive" />
                ) : (
                    <Hourglass className="h-7 w-7 text-amber-600" />
                )}
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
                {isRejected ? t("beta_mode.rejected_title") : t("beta_mode.pending_title")}
            </h1>
            <p className="text-muted-foreground max-w-md mb-8">
                {isRejected ? t("beta_mode.rejected_description") : t("beta_mode.pending_description")}
            </p>
            <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => window.location.reload()}>
                    {t("beta_mode.check_again")}
                </Button>
                <a href="/support">
                    <Button variant="outline" className="gap-2">
                        <Mail className="h-4 w-4" />
                        {t("beta_mode.contact_link")}
                    </Button>
                </a>
                <a href="/">
                    <Button>{t("beta_mode.go_home_link")}</Button>
                </a>
            </div>
            <div className="mt-10 flex items-center gap-1.5 text-xs text-muted-foreground/70">
                <FlaskConical className="h-3.5 w-3.5" />
                {t("beta_mode.banner_text")}
            </div>
        </div>
    );
}
