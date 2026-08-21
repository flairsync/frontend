import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hash, Receipt, ShoppingBag, Clock, Link2, Copy, Check, ExternalLink, Download, Loader2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { FiscalInvoice, FiscalInvoiceType, downloadFiscalInvoicePdf } from "@/features/fiscal-invoices/service";

const TYPE_STYLES: Record<FiscalInvoiceType, string> = {
    [FiscalInvoiceType.STANDARD]: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    [FiscalInvoiceType.CORRECTION]: "bg-amber-100 text-amber-700 hover:bg-amber-100",
};

interface FiscalInvoiceDetailsModalProps {
    invoice: FiscalInvoice | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Present only when the id is navigable — renders the id as a link instead of plain text. */
    onViewOrder?: (orderId: string) => void;
    onViewInvoice?: (invoiceId: string) => void;
}

const CopyableId: React.FC<{ value: string; onView?: () => void; viewLabel?: string }> = ({ value, onView, viewLabel }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <div className="flex items-center gap-1.5">
            {onView ? (
                <button
                    type="button"
                    onClick={onView}
                    title={viewLabel ?? "View"}
                    className="font-mono text-xs break-all text-primary hover:underline text-left flex items-center gap-1"
                >
                    {value}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                </button>
            ) : (
                <p className="font-mono text-xs break-all">{value}</p>
            )}
            <button
                type="button"
                onClick={handleCopy}
                title="Copy"
                aria-label="Copy"
                className="text-muted-foreground hover:text-foreground shrink-0"
            >
                {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
            </button>
        </div>
    );
};

export const FiscalInvoiceDetailsModal: React.FC<FiscalInvoiceDetailsModalProps> = ({ invoice, open, onOpenChange, onViewOrder, onViewInvoice }) => {
    const [downloading, setDownloading] = useState(false);

    if (!invoice) return null;

    const handleDownloadPdf = async () => {
        setDownloading(true);
        try {
            await downloadFiscalInvoicePdf(invoice.businessId, invoice);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Badge className={TYPE_STYLES[invoice.type]}>{invoice.type}</Badge>
                        <span className="font-mono font-normal text-muted-foreground text-sm">
                            {invoice.invoiceNumber}
                        </span>
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Full details for this fiscal invoice.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-start gap-2">
                            <Receipt className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">Status</p>
                                <p className="font-medium">{invoice.status}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">Issued</p>
                                {invoice.issuedAt ? (
                                    <>
                                        <p className="font-medium">{format(new Date(invoice.issuedAt), "PPpp")}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(invoice.issuedAt), { addSuffix: true })}
                                        </p>
                                    </>
                                ) : (
                                    <p className="font-medium text-muted-foreground">—</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-start gap-2 sm:col-span-2">
                            <ShoppingBag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-muted-foreground">Order</p>
                                <CopyableId
                                    value={invoice.orderId}
                                    onView={onViewOrder ? () => onViewOrder(invoice.orderId) : undefined}
                                    viewLabel="View order"
                                />
                            </div>
                        </div>
                        {invoice.type === FiscalInvoiceType.CORRECTION && invoice.correctsInvoiceId && (
                            <div className="flex items-start gap-2 sm:col-span-2">
                                <Link2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-muted-foreground">Corrects invoice</p>
                                    <CopyableId
                                        value={invoice.correctsInvoiceId}
                                        onView={onViewInvoice ? () => onViewInvoice(invoice.correctsInvoiceId as string) : undefined}
                                        viewLabel="View original invoice"
                                    />
                                </div>
                            </div>
                        )}
                        {invoice.type === FiscalInvoiceType.STANDARD && invoice.receiptId && (
                            <div className="flex items-start gap-2 sm:col-span-2">
                                <Receipt className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-muted-foreground">Receipt</p>
                                    <CopyableId value={invoice.receiptId} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Hash chain — the legal tamper-evidence record (AEAT VERI*FACTU huella) */}
                    <div className="border-t pt-3 space-y-2.5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Hash chain
                        </p>
                        <div className="flex items-start gap-2">
                            <Hash className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-muted-foreground">Hash</p>
                                <CopyableId value={invoice.hash} />
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <Hash className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-muted-foreground">Previous hash</p>
                                {invoice.previousHash ? (
                                    <CopyableId value={invoice.previousHash} />
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">— (genesis record for this business)</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Recorded {format(new Date(invoice.createdAt), "PPpp")}</span>
                        <span className="font-mono">{invoice.id.slice(0, 8)}…</span>
                    </div>
                </div>

                {invoice.type === FiscalInvoiceType.STANDARD && (
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={downloading}>
                            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            Download PDF
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};
