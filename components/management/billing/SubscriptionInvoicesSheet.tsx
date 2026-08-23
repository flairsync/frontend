import React from "react";
import { useTranslation } from "react-i18next";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Loader2, CreditCard } from "lucide-react";
import { useSubscriptionInvoices } from "@/features/subscriptions/useSubscriptionInvoices";
import { InvoiceStatus, InvoiceBillingReason } from "@/models/SubscriptionInvoice";
import { cn } from "@/lib/utils";
import { Subscription } from "@/models/Subscription";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface SubscriptionInvoicesSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subscription: Subscription | null;
}

const statusColors: Record<string, string> = {
    [InvoiceStatus.PAID]: "bg-green-100 text-green-800 border-green-200",
    [InvoiceStatus.PENDING]: "bg-amber-100 text-amber-800 border-amber-200",
    [InvoiceStatus.VOID]: "bg-zinc-100 text-zinc-600 border-zinc-200",
    [InvoiceStatus.REFUNDED]: "bg-blue-100 text-blue-800 border-blue-200",
    [InvoiceStatus.PARTIAL_REFUND]: "bg-purple-100 text-purple-800 border-purple-200",
};

function getBillingReasonTooltip(t: (key: string) => string, reason: string): string {
    switch (reason) {
        case InvoiceBillingReason.INITIAL: return t("subscription_invoices_sheet.billing_reason_tooltips.initial");
        case InvoiceBillingReason.RENEWAL: return t("subscription_invoices_sheet.billing_reason_tooltips.renewal");
        case InvoiceBillingReason.UPDATED: return t("subscription_invoices_sheet.billing_reason_tooltips.updated");
        default: return reason;
    }
}

function getBillingReasonLabel(t: (key: string) => string, reason: string): string {
    switch (reason) {
        case InvoiceBillingReason.INITIAL: return t("subscription_invoices_sheet.billing_reason_labels.initial");
        case InvoiceBillingReason.RENEWAL: return t("subscription_invoices_sheet.billing_reason_labels.renewal");
        case InvoiceBillingReason.UPDATED: return t("subscription_invoices_sheet.billing_reason_labels.updated");
        default: return reason;
    }
}

function getInvoiceStatusLabel(t: (key: string) => string, status: string): string {
    switch (status) {
        case InvoiceStatus.PAID: return t("subscription_invoices_sheet.status_labels.paid");
        case InvoiceStatus.PENDING: return t("subscription_invoices_sheet.status_labels.pending");
        case InvoiceStatus.VOID: return t("subscription_invoices_sheet.status_labels.void");
        case InvoiceStatus.REFUNDED: return t("subscription_invoices_sheet.status_labels.refunded");
        case InvoiceStatus.PARTIAL_REFUND: return t("subscription_invoices_sheet.status_labels.partial_refund");
        default: return status;
    }
}

export function SubscriptionInvoicesSheet({
    open,
    onOpenChange,
    subscription,
}: SubscriptionInvoicesSheetProps) {
    const { t } = useTranslation("management");
    const { invoices, loadingInvoices, downloadInvoice } =
        useSubscriptionInvoices(subscription?.id);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="sm:max-w-lg w-full overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        {t("subscription_invoices_sheet.title")}
                    </SheetTitle>
                    <SheetDescription>
                        {subscription?.pack?.name
                            ? t("subscription_invoices_sheet.description_for_plan", { name: subscription.pack.name, type: subscription.pack.pricingType })
                            : t("subscription_invoices_sheet.description_generic")}
                    </SheetDescription>
                </SheetHeader>

                <div className="px-4 pb-6 mt-2">
                    {/* Subscription info summary */}
                    {subscription && (
                        <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 mb-6">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-zinc-500 text-xs font-medium">{t("subscription_invoices_sheet.plan")}</p>
                                    <p className="font-semibold text-zinc-900">
                                        {subscription.pack?.name || "—"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-zinc-500 text-xs font-medium">{t("subscription_invoices_sheet.price")}</p>
                                    <p className="font-semibold text-zinc-900">
                                        {subscription.pack?.price} {subscription.pack?.currency}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-zinc-500 text-xs font-medium">{t("subscription_invoices_sheet.started")}</p>
                                    <p className="font-semibold text-zinc-900">
                                        {subscription.getStartDate() || "—"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-zinc-500 text-xs font-medium">{t("subscription_invoices_sheet.renews")}</p>
                                    <p className="font-semibold text-zinc-900">
                                        {subscription.getRenewalDate() || "—"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading state */}
                    {loadingInvoices && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                            <span className="ml-2 text-zinc-500 text-sm">{t("subscription_invoices_sheet.loading")}</span>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loadingInvoices && invoices.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-zinc-100 p-3 rounded-full mb-3">
                                <FileText className="h-6 w-6 text-zinc-400" />
                            </div>
                            <p className="text-zinc-500 text-sm font-medium">{t("subscription_invoices_sheet.empty")}</p>
                            <p className="text-zinc-400 text-xs mt-1">
                                {t("subscription_invoices_sheet.empty_hint")}
                            </p>
                        </div>
                    )}

                    {/* Invoices table */}
                    {!loadingInvoices && invoices.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("subscription_invoices_sheet.col_date")}</TableHead>
                                    <TableHead>{t("subscription_invoices_sheet.col_type")}</TableHead>
                                    <TableHead>{t("subscription_invoices_sheet.col_amount")}</TableHead>
                                    <TableHead>{t("subscription_invoices_sheet.col_status")}</TableHead>
                                    <TableHead className="text-right">{t("subscription_invoices_sheet.col_action")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="text-sm">
                                            {invoice.getCreatedDate()}
                                        </TableCell>
                                        <TableCell>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="text-sm text-zinc-700 cursor-help border-b border-dashed border-zinc-400">
                                                            {getBillingReasonLabel(t, invoice.billingReason)}
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                        <p>{getBillingReasonTooltip(t, invoice.billingReason)}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                        <TableCell className="font-medium text-sm">
                                            {invoice.getFormattedTotal()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-xs font-medium",
                                                    statusColors[invoice.status] || "bg-zinc-100 text-zinc-600"
                                                )}
                                            >
                                                {getInvoiceStatusLabel(t, invoice.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {invoice.canDownload() ? (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 text-blue-600 hover:text-blue-700"
                                                    onClick={() => {
                                                        if (invoice.invoiceUrl) {
                                                            window.open(invoice.invoiceUrl, "_blank");
                                                        } else {
                                                            downloadInvoice(invoice.id);
                                                        }
                                                    }}
                                                >
                                                    <Download className="h-4 w-4 mr-1" />
                                                    {t("subscription_invoices_sheet.pdf")}
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-zinc-400">—</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    {/* Payment method hint */}
                    {!loadingInvoices && invoices.length > 0 && invoices[0]?.cardBrand && (
                        <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400 border-t border-zinc-100 pt-4">
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>
                                {t("subscription_invoices_sheet.paid_with", { brand: invoices[0].cardBrand, last4: invoices[0].cardLastFour })}
                            </span>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
