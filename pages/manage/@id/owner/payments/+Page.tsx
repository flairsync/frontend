import React from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Loader2, ExternalLink, Info } from "lucide-react";
import { usePaymentAccount, useOnboardPaymentAccount, PAYMENT_PROVIDER_NOT_CONFIGURED } from "@/features/payments/usePayments";
import { usePermissions } from "@/features/auth/usePermissions";
import type { PaymentAccountStatus } from "@/features/payments/service";

function StatusBadge({ status }: { status: PaymentAccountStatus | "not_connected" }) {
    const { t } = useTranslation("management");
    const variant = status === "active" ? "default" : status === "pending" ? "secondary" : "destructive";
    return <Badge variant={variant}>{t(`payments_page.status.${status}`)}</Badge>;
}

const PaymentsPage: React.FC = () => {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const { hasPermission } = usePermissions(businessId);
    const canManage = hasPermission("BUSINESS_SETTINGS", "update");

    const { paymentAccount, fetchingPaymentAccount } = usePaymentAccount(businessId);
    const onboard = useOnboardPaymentAccount(businessId);

    const notConfigured = (onboard.error as any)?.response?.data?.code === PAYMENT_PROVIDER_NOT_CONFIGURED;

    const status: PaymentAccountStatus | "not_connected" = paymentAccount?.status ?? "not_connected";

    const handleConnect = () => {
        onboard.mutate(typeof window !== "undefined" ? window.location.href : undefined);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("payments_page.title")}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t("payments_page.subtitle")}</p>
            </div>

            <Separator />

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            {t("payments_page.monei_card_title")}
                        </CardTitle>
                        {!fetchingPaymentAccount && <StatusBadge status={status} />}
                    </div>
                    <CardDescription>{t("payments_page.monei_card_description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fetchingPaymentAccount && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" /> {t("payments_page.loading")}
                        </div>
                    )}

                    {!fetchingPaymentAccount && status === "active" && (
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">{t("payments_page.active_description")}</p>
                            {paymentAccount?.externalAccountId && (
                                <p className="text-xs text-muted-foreground font-mono">
                                    {t("payments_page.account_id")}: {paymentAccount.externalAccountId}
                                </p>
                            )}
                        </div>
                    )}

                    {!fetchingPaymentAccount && status === "pending" && (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">{t("payments_page.pending_description")}</p>
                            {paymentAccount?.onboardingUrl && (
                                <Button variant="outline" className="gap-2" asChild>
                                    <a href={paymentAccount.onboardingUrl} target="_blank" rel="noreferrer">
                                        <ExternalLink className="h-4 w-4" />
                                        {t("payments_page.continue_setup")}
                                    </a>
                                </Button>
                            )}
                        </div>
                    )}

                    {!fetchingPaymentAccount && status === "rejected" && (
                        <Alert variant="destructive">
                            <AlertDescription>{t("payments_page.rejected_description")}</AlertDescription>
                        </Alert>
                    )}

                    {!fetchingPaymentAccount && status === "not_connected" && (
                        <p className="text-sm text-muted-foreground">{t("payments_page.not_connected_description")}</p>
                    )}

                    {notConfigured && (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>{t("payments_page.not_configured_notice")}</AlertDescription>
                        </Alert>
                    )}

                    {canManage && status !== "active" && (
                        <Button className="gap-2" disabled={onboard.isPending} onClick={handleConnect}>
                            {onboard.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            {status === "pending" ? t("payments_page.refresh_link") : t("payments_page.connect_button")}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentsPage;
