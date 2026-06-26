import { useState, useEffect } from "react";
import { stationApi } from "@/features/station/station-api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StationReceiptItem {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    modifiers: { name: string; price: number }[];
    totalPrice: number;
    notes: string | null;
}

interface StationReceiptPayment {
    id: string;
    method: string;
    amount: number;
    tipAmount: number;
    cashTendered: number | null;
    changeGiven: number | null;
    status: string;
}

interface StationReceiptTax {
    name: string;
    rate: number;
    included: boolean;
    amount: number;
}

interface StationReceipt {
    orderId: string;
    type: "dine_in" | "takeaway" | "delivery";
    status: string;
    paymentStatus: string;
    tableName: string | null;
    items: StationReceiptItem[];
    subtotal: number;
    discountAmount: number;
    tax: StationReceiptTax;
    totalAmount: number;
    totalPaid: number;
    totalTip: number;
    payments: StationReceiptPayment[];
    createdAt: string;
    closedAt: string | null;
    taxExempt?: boolean;
}

function fmt(n: number) {
    return `$${Number(n).toFixed(2)}`;
}

function fmtTime(iso: string | null | undefined) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

interface Props {
    orderId: string;
    onClose: () => void;
    onNewOrder?: () => void;
}

export default function StationReceiptView({ orderId, onClose, onNewOrder }: Props) {
    const { t } = useTranslation("pos");
    const [receipt, setReceipt] = useState<StationReceipt | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        stationApi
            .get(`/station/orders/${orderId}/receipt`)
            .then((r) => setReceipt(r.data.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [orderId]);

    function handlePrint() {
        const el = document.getElementById("pos-station-receipt");
        if (!el) return;
        const win = window.open("", "_blank", "width=400,height=700");
        if (!win) return;
        win.document.write(`<html><head><title>${t("station_receipt.print_title")}</title><style>
            body{font-family:monospace;font-size:12px;margin:0;padding:16px;}
            *{box-sizing:border-box;}
            .flex{display:flex;} .jb{justify-content:space-between;}
            .bb{border-bottom:1px solid #ddd;padding-bottom:8px;margin-bottom:8px;}
            .tc{text-align:center;} .b{font-weight:bold;} .sm{font-size:10px;}
        </style></head><body>${el.innerHTML}</body></html>`);
        win.document.close();
        win.focus();
        win.print();
        win.close();
    }

    if (loading) {
        return (
            <div className="p-6 space-y-3 w-80">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    if (!receipt) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm">{t("station_receipt.unavailable")}</p>
                <Button variant="ghost" className="mt-4" onClick={onClose}>{t("station_receipt.actions.close")}</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col max-h-[80vh]">
            <div className="flex-1 overflow-y-auto">
                <div
                    id="pos-station-receipt"
                    className="bg-background text-foreground font-mono text-sm w-full"
                >
                    {/* Header */}
                    <div className="text-center py-4 border-b border-border">
                        <p className="text-base font-bold uppercase tracking-widest">{t("station_receipt.fields.receipt")}</p>
                        <p className="text-xs text-muted-foreground mt-1">{fmtTime(receipt.createdAt)}</p>
                        {receipt.tableName && (
                            <p className="text-xs font-bold mt-1">{receipt.tableName}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
                            {receipt.type.replace("_", " ")}
                        </p>
                    </div>

                    {/* Items */}
                    <div className="px-4 py-3 border-b border-border space-y-2">
                        {receipt.items.map((item) => (
                            <div key={item.id}>
                                <div className="flex justify-between text-xs">
                                    <span className="flex-1 pr-2">
                                        {item.quantity}× {item.name}
                                    </span>
                                    <span>{fmt(item.totalPrice)}</span>
                                </div>
                                {item.modifiers.map((mod, j) => (
                                    <div key={j} className="flex justify-between text-muted-foreground text-[10px] pl-4">
                                        <span>+ {mod.name}</span>
                                        {mod.price > 0 && <span>{fmt(mod.price)}</span>}
                                    </div>
                                ))}
                                {item.notes && (
                                    <p className="text-[10px] text-muted-foreground pl-4 italic">{item.notes}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="px-4 py-3 border-b border-border space-y-1 text-xs">
                        <div className="flex justify-between text-muted-foreground">
                            <span>{t("station_receipt.fields.subtotal")}</span>
                            <span>{fmt(receipt.subtotal)}</span>
                        </div>
                        {receipt.discountAmount > 0 && (
                            <div className="flex justify-between text-primary">
                                <span>{t("station_receipt.fields.discount")}</span>
                                <span>−{fmt(receipt.discountAmount)}</span>
                            </div>
                        )}
                        {receipt.taxExempt ? (
                            <div className="flex justify-between text-muted-foreground">
                                <span>{t("station_receipt.fields.tax_exempt")}</span>
                                <span>{fmt(0)}</span>
                            </div>
                        ) : receipt.tax.rate > 0 && (
                            <div className="flex justify-between text-muted-foreground">
                                <span>
                                    {receipt.tax.name} {receipt.tax.rate}%
                                    {receipt.tax.included && ` ${t("station_receipt.fields.tax_included_suffix")}`}
                                </span>
                                <span>{fmt(receipt.tax.amount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-sm border-t border-border pt-2 mt-1">
                            <span>{t("station_receipt.fields.total")}</span>
                            <span>{fmt(receipt.totalAmount)}</span>
                        </div>
                    </div>

                    {/* Payments */}
                    <div className="px-4 py-3 border-b border-border space-y-1 text-xs">
                        {receipt.payments.map((p) => (
                            <div key={p.id} className="space-y-0.5">
                                <div className="flex justify-between text-muted-foreground">
                                    <span className="capitalize">{p.method}</span>
                                    <span>{fmt(p.amount)}</span>
                                </div>
                                {p.method === "cash" && p.cashTendered !== null && (
                                    <>
                                        <div className="flex justify-between text-muted-foreground pl-3">
                                            <span>{t("station_receipt.fields.tendered")}</span>
                                            <span>{fmt(p.cashTendered)}</span>
                                        </div>
                                        <div className="flex justify-between font-semibold text-primary pl-3">
                                            <span>{t("station_receipt.fields.change")}</span>
                                            <span>{fmt(p.changeGiven ?? 0)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {receipt.totalTip > 0 && (
                            <div className="flex justify-between text-muted-foreground">
                                <span>{t("station_receipt.fields.tip")}</span>
                                <span>{fmt(receipt.totalTip)}</span>
                            </div>
                        )}
                    </div>

                    <div className="text-center py-3 text-[10px] text-muted-foreground">
                        {t("station_receipt.thank_you")}
                    </div>
                </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-border bg-card">
                <Button variant="outline" className="flex-1 gap-2" onClick={handlePrint}>
                    <Printer className="w-4 h-4" />
                    {t("station_receipt.actions.print")}
                </Button>
                {onNewOrder ? (
                    <Button className="flex-1" onClick={onNewOrder}>{t("station_receipt.actions.new_order")}</Button>
                ) : (
                    <Button className="flex-1 gap-2" onClick={onClose}>
                        <X className="w-4 h-4" />
                        {t("station_receipt.actions.close")}
                    </Button>
                )}
            </div>
        </div>
    );
}
