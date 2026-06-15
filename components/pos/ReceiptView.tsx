import { useQuery } from "@tanstack/react-query";
import { getReceiptApiCall, printReceiptApiCall, ReceiptData } from "@/features/orders/service";
import { Button } from "@/components/ui/button";
import { Download, Printer, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useBusinessBasicDetails } from "@/features/business/useBusinessBasicDetails";
import { formatCurrency } from "@/lib/formatCurrency";
import { useState } from "react";

interface Props {
    businessId: string;
    orderId: string;
    onClose: () => void;
    onNewOrder?: () => void;
}

function fmtDate(iso: string | null | undefined) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function ReceiptView({ businessId, orderId, onClose, onNewOrder }: Props) {
    const { data: receipt, isLoading } = useQuery({
        queryKey: ["receipt", orderId],
        queryFn: () => getReceiptApiCall(businessId, orderId),
    });
    const { businessBasicDetails } = useBusinessBasicDetails(businessId);
    const currency = businessBasicDetails?.currency ?? "USD";
    const fmt = (amount: number) => formatCurrency(amount, currency);
    const [isPrintingPdf, setIsPrintingPdf] = useState(false);

    if (isLoading) {
        return (
            <div className="p-6 space-y-3 w-80">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    if (!receipt) return null;

    async function handleDownloadPdf() {
        setIsPrintingPdf(true);
        try {
            const blob = await printReceiptApiCall(businessId, orderId);
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
        } catch {
            // silently ignore — browser may block popup or request may fail
        } finally {
            setIsPrintingPdf(false);
        }
    }

    function handlePrint() {
        const el = document.getElementById("pos-receipt-content");
        if (!el) return;
        const win = window.open("", "_blank", "width=400,height=700");
        if (!win) return;
        win.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: monospace; font-size: 12px; margin: 0; padding: 16px; }
            * { box-sizing: border-box; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .border-b { border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 8px; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .text-sm { font-size: 11px; }
            .text-xs { font-size: 10px; }
            .py-2 { padding: 4px 0; }
          </style>
        </head>
        <body>${el.innerHTML}</body>
      </html>
    `);
        win.document.close();
        win.focus();
        win.print();
        win.close();
    }

    const balanceDue = Math.max(0, receipt.totalAmount - receipt.totalPaid);

    return (
        <div className="flex flex-col max-h-[80vh]">
            {/* Scrollable receipt content */}
            <div className="flex-1 overflow-y-auto">
                <div
                    id="pos-receipt-content"
                    className="bg-background text-foreground font-mono text-sm w-full"
                >
                    {/* Order info */}
                    <div className="px-4 py-3 border-b border-border space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                            <span>Receipt</span>
                            <span className="font-semibold text-foreground">{receipt.receiptNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Date</span>
                            <span>{fmtDate(receipt.generatedAt)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Type</span>
                            <span className="capitalize">{receipt.type.replace("_", " ")}</span>
                        </div>
                        {receipt.tableName && (
                            <div className="flex justify-between">
                                <span>Table</span>
                                <span>{receipt.tableName}</span>
                            </div>
                        )}
                    </div>

                    {/* Items */}
                    <div className="px-4 py-3 border-b border-border space-y-2">
                        {receipt.items.map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between">
                                    <span className="flex-1 pr-2">
                                        {item.quantity}× {item.name}
                                        {item.variantName && (
                                            <span className="text-muted-foreground"> ({item.variantName})</span>
                                        )}
                                    </span>
                                    <span>{fmt(item.totalPrice)}</span>
                                </div>
                                {item.modifiers.map((mod, j) => (
                                    <div
                                        key={j}
                                        className="flex justify-between text-muted-foreground text-xs pl-4"
                                    >
                                        <span>+ {mod.name}</span>
                                        {mod.price > 0 && <span>{fmt(mod.price)}</span>}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="px-4 py-3 border-b border-border space-y-1 text-xs">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span>{fmt(receipt.subtotal)}</span>
                        </div>
                        {receipt.discountAmount > 0 && (
                            <div className="flex justify-between text-primary">
                                <span>Discount</span>
                                <span>−{fmt(receipt.discountAmount)}</span>
                            </div>
                        )}
                        {receipt.tax.rate > 0 && receipt.tax.amount > 0 && (
                            <div className="flex justify-between text-muted-foreground">
                                <span>
                                    {receipt.tax.name} {receipt.tax.rate}%
                                    {receipt.tax.included && " incl."}
                                </span>
                                <span>{fmt(receipt.tax.amount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-sm border-t border-border pt-2 mt-1">
                            <span>Total</span>
                            <span>{fmt(receipt.totalAmount)}</span>
                        </div>
                    </div>

                    {/* Payments */}
                    <div className="px-4 py-3 border-b border-border space-y-1 text-xs">
                        {receipt.payments.map((p, i) => (
                            <div key={i} className="space-y-0.5">
                                <div className="flex justify-between text-muted-foreground">
                                    <span className="capitalize">{p.method}</span>
                                    <span>{fmt(p.amount)}</span>
                                </div>
                                {p.method === "cash" && p.cashTendered !== null && (
                                    <>
                                        <div className="flex justify-between text-muted-foreground pl-3">
                                            <span>Tendered</span>
                                            <span>{fmt(p.cashTendered)}</span>
                                        </div>
                                        <div className="flex justify-between font-semibold text-primary pl-3">
                                            <span>Change</span>
                                            <span>{fmt(p.changeGiven ?? 0)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {receipt.totalTip > 0 && (
                            <div className="flex justify-between text-muted-foreground">
                                <span>Tip</span>
                                <span>{fmt(receipt.totalTip)}</span>
                            </div>
                        )}
                        {balanceDue > 0 && (
                            <div className="flex justify-between font-semibold text-destructive">
                                <span>Balance Due</span>
                                <span>{fmt(balanceDue)}</span>
                            </div>
                        )}
                    </div>

                    <div className="text-center py-3 text-xs text-muted-foreground">
                        Thank you for dining with us!
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 p-4 border-t border-border bg-card">
                <Button variant="outline" className="flex-1 gap-2" onClick={handlePrint}>
                    <Printer className="w-4 h-4" />
                    Print
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={handleDownloadPdf} disabled={isPrintingPdf}>
                    <Download className="w-4 h-4" />
                    PDF
                </Button>
                {onNewOrder ? (
                    <Button className="flex-1" onClick={onNewOrder}>
                        New Order
                    </Button>
                ) : (
                    <Button className="flex-1 gap-2" onClick={onClose}>
                        <X className="w-4 h-4" />
                        Close
                    </Button>
                )}
            </div>
        </div>
    );
}
