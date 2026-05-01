import { useQuery } from "@tanstack/react-query";
import { getReceiptApiCall, ReceiptData } from "@/features/orders/service";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
    businessId: string;
    orderId: string;
    onClose: () => void;
    onNewOrder?: () => void;
}

function fmt(amount: number) {
    return `$${amount.toFixed(2)}`;
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

export default function ReceiptView({ businessId, orderId, onClose, onNewOrder }: Props) {
    const { data: receipt, isLoading } = useQuery({
        queryKey: ["receipt", orderId],
        queryFn: () => getReceiptApiCall(businessId, orderId),
    });

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

    return (
        <div className="flex flex-col max-h-[80vh]">
            {/* Scrollable receipt content */}
            <div className="flex-1 overflow-y-auto">
                <div
                    id="pos-receipt-content"
                    className="bg-background text-foreground font-mono text-sm w-full"
                >
                    {/* Business header */}
                    <div className="text-center py-4 border-b border-border">
                        <h1 className="text-base font-bold">{receipt.business.name}</h1>
                        {receipt.business.address && (
                            <p className="text-muted-foreground text-xs mt-1">
                                {receipt.business.address}
                            </p>
                        )}
                        {receipt.business.phone && (
                            <p className="text-muted-foreground text-xs">{receipt.business.phone}</p>
                        )}
                    </div>

                    {/* Order info */}
                    <div className="px-4 py-3 border-b border-border space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                            <span>Receipt</span>
                            <span className="font-semibold text-foreground">{receipt.receiptNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Date</span>
                            <span>{fmtDate(receipt.issuedAt)}</span>
                        </div>
                        {receipt.order.tableNumber && (
                            <div className="flex justify-between">
                                <span>Table</span>
                                <span>{receipt.order.tableNumber}</span>
                            </div>
                        )}
                        {receipt.order.waiterName && (
                            <div className="flex justify-between">
                                <span>Server</span>
                                <span>{receipt.order.waiterName}</span>
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
                        {receipt.taxLines.map((tax, i) => (
                            <div key={i} className="flex justify-between text-muted-foreground">
                                <span>
                                    {tax.name} ({tax.rate}%{tax.isInclusive ? " incl." : ""})
                                </span>
                                <span>{fmt(tax.amount)}</span>
                            </div>
                        ))}
                        {receipt.discountAmount > 0 && (
                            <div className="flex justify-between text-primary">
                                <span>{receipt.discountLabel ?? "Discount"}</span>
                                <span>−{fmt(receipt.discountAmount)}</span>
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
                            <div key={i} className="flex justify-between text-muted-foreground">
                                <span className="capitalize">{p.method}</span>
                                <span>{fmt(p.amount)}</span>
                            </div>
                        ))}
                        {receipt.totalTip > 0 && (
                            <div className="flex justify-between text-muted-foreground">
                                <span>Tip</span>
                                <span>{fmt(receipt.totalTip)}</span>
                            </div>
                        )}
                        {receipt.changeDue > 0 && (
                            <div className="flex justify-between font-semibold text-primary">
                                <span>Change Due</span>
                                <span>{fmt(receipt.changeDue)}</span>
                            </div>
                        )}
                        {receipt.balanceDue > 0 && (
                            <div className="flex justify-between font-semibold text-destructive">
                                <span>Balance Due</span>
                                <span>{fmt(receipt.balanceDue)}</span>
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
