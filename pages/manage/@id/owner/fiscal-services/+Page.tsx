import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Download, FileSpreadsheet, Loader2, Receipt, FileCheck2 } from "lucide-react";
import { useFiscalPeriodSummary, useIssueFullInvoice } from "@/features/fiscal-services/useFiscalServices";
import { getFiscalPeriodSummaryExportUrl } from "@/features/fiscal-services/service";
import { getFiscalInvoicesExportUrl } from "@/features/fiscal-invoices/service";
import { usePermissions } from "@/features/auth/usePermissions";

function StatTile({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-xl font-semibold mt-1">{value}</div>
        </div>
    );
}

const FiscalServicesPage: React.FC = () => {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const { hasPermission } = usePermissions(businessId);
    const canIssueFullInvoice = hasPermission("BUSINESS_SETTINGS", "update");

    // Period summary / declaration
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const periodReady = !!from && !!to;
    const { data: summary, isLoading: summaryLoading, isFetching: summaryFetching } = useFiscalPeriodSummary(businessId, from, to);

    const handleExportSummary = () => {
        if (!periodReady) return;
        const url = getFiscalPeriodSummaryExportUrl(businessId, from, to);
        const a = document.createElement("a");
        a.href = url;
        a.click();
    };

    const handleExportRegister = () => {
        const url = getFiscalInvoicesExportUrl(businessId);
        const a = document.createElement("a");
        a.href = url;
        a.click();
    };

    // Issue full invoice
    const issueFullInvoice = useIssueFullInvoice(businessId);
    const [orderId, setOrderId] = useState("");
    const [recipientName, setRecipientName] = useState("");
    const [recipientTaxId, setRecipientTaxId] = useState("");
    const [recipientAddress, setRecipientAddress] = useState("");

    const fullInvoiceValid = !!orderId && !!recipientName && !!recipientTaxId && !!recipientAddress;

    const handleIssueFullInvoice = () => {
        if (!fullInvoiceValid) return;
        issueFullInvoice.mutate(
            { orderId, data: { recipientName, recipientTaxId, recipientAddress } },
            {
                onSuccess: () => {
                    setOrderId("");
                    setRecipientName("");
                    setRecipientTaxId("");
                    setRecipientAddress("");
                },
            },
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("fiscal_services_page.title")}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {t("fiscal_services_page.subtitle")}
                </p>
            </div>

            <Separator />

            {/* Period summary / declaration */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        {t("fiscal_services_page.period_summary")}
                    </CardTitle>
                    <CardDescription>
                        {t("fiscal_services_page.period_summary_description")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="fs-from">{t("fiscal_services_page.from")}</Label>
                            <Input id="fs-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="fs-to">{t("fiscal_services_page.to")}</Label>
                            <Input id="fs-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
                        </div>
                        <Button variant="outline" className="gap-2" disabled={!periodReady} onClick={handleExportSummary}>
                            <Download className="h-4 w-4" />
                            {t("fiscal_services_page.export_csv")}
                        </Button>
                    </div>

                    {!periodReady && (
                        <p className="text-sm text-muted-foreground">{t("fiscal_services_page.pick_dates_hint")}</p>
                    )}

                    {periodReady && (summaryLoading || summaryFetching) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" /> {t("fiscal_services_page.loading_summary")}
                        </div>
                    )}

                    {periodReady && summary && !summaryLoading && (
                        <>
                            {summary.unamountedCount > 0 && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        {t("fiscal_services_page.unamounted_warning", { count: summary.unamountedCount })}
                                    </AlertDescription>
                                </Alert>
                            )}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                <StatTile label={t("fiscal_services_page.standard_invoices")} value={summary.invoiceCount} />
                                <StatTile label={t("fiscal_services_page.corrections")} value={summary.correctionCount} />
                                <StatTile label={t("fiscal_services_page.unamounted_excluded")} value={summary.unamountedCount} />
                                <StatTile label={t("fiscal_services_page.taxable_base")} value={summary.totalTaxableBase} />
                                <StatTile label={t("fiscal_services_page.tax_collected")} value={summary.totalTaxAmount} />
                                <StatTile label={t("fiscal_services_page.total_amount")} value={summary.totalAmount} />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Fiscal invoice register */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        {t("fiscal_services_page.fiscal_invoice_register")}
                    </CardTitle>
                    <CardDescription>
                        {t("fiscal_services_page.fiscal_invoice_register_description")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <Button variant="outline" className="gap-2" onClick={handleExportRegister}>
                        <Download className="h-4 w-4" />
                        {t("fiscal_services_page.export_full_register_csv")}
                    </Button>
                    <Button variant="ghost" asChild>
                        <a href={`/manage/${businessId}/owner/fiscal-invoices`}>{t("fiscal_services_page.view_register")}</a>
                    </Button>
                </CardContent>
            </Card>

            {/* Issue full invoice */}
            {canIssueFullInvoice && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileCheck2 className="h-5 w-5" />
                            {t("fiscal_services_page.issue_full_invoice")}
                        </CardTitle>
                        <CardDescription>
                            {t("fiscal_services_page.issue_full_invoice_description")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-1.5 max-w-md">
                            <Label htmlFor="fs-order-id">{t("fiscal_services_page.order_id")}</Label>
                            <Input id="fs-order-id" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder={t("fiscal_services_page.order_id_placeholder")} />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="fs-recipient-name">{t("fiscal_services_page.recipient_name")}</Label>
                                <Input id="fs-recipient-name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} maxLength={200} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="fs-recipient-tax-id">{t("fiscal_services_page.recipient_tax_id")}</Label>
                                <Input id="fs-recipient-tax-id" value={recipientTaxId} onChange={(e) => setRecipientTaxId(e.target.value)} maxLength={20} />
                            </div>
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <Label htmlFor="fs-recipient-address">{t("fiscal_services_page.recipient_address")}</Label>
                                <Input id="fs-recipient-address" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} maxLength={300} />
                            </div>
                        </div>
                        <Button
                            className="gap-2"
                            disabled={!fullInvoiceValid || issueFullInvoice.isPending}
                            onClick={handleIssueFullInvoice}
                        >
                            {issueFullInvoice.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            {t("fiscal_services_page.issue_full_invoice")}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default FiscalServicesPage;
