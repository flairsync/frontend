import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Banknote, CreditCard, Delete, Tag, Split, Receipt } from "lucide-react";
import DiscountPanel from "./DiscountPanel";
import SplitBillPanel from "./SplitBillPanel";
import ReceiptView from "./ReceiptView";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    method: "cash" | "card" | null;
    businessId?: string;
    orderId?: string;
    orderItems?: Array<{ id: string; nameSnapshot: string; totalPrice: number }>;
}

const QUICK_AMOUNTS = [5, 10, 20, 50, 100];

type Step = "confirm" | "success";
type Panel = "none" | "discount" | "split";

export function PaymentModal({
    isOpen,
    onClose,
    total,
    method,
    businessId,
    orderId,
    orderItems = [],
}: PaymentModalProps) {
    const [step, setStep] = useState<Step>("confirm");
    const [cashInput, setCashInput] = useState("");
    const [activePanel, setActivePanel] = useState<Panel>("none");
    const [discountAmount, setDiscountAmount] = useState(0);
    const [showReceipt, setShowReceipt] = useState(false);

    const effectiveTotal = total - discountAmount;

    useEffect(() => {
        if (isOpen) {
            setStep("confirm");
            setCashInput("");
            setActivePanel("none");
            setDiscountAmount(0);
            setShowReceipt(false);
        }
    }, [isOpen]);

    const cashGiven = parseFloat(cashInput) || 0;
    const change = cashGiven - effectiveTotal;
    const isValidCash = method === "card" || cashGiven >= effectiveTotal;

    const handleKeypad = (val: string) => {
        if (val === "DEL") {
            setCashInput((prev) => prev.slice(0, -1));
        } else if (val === "." && cashInput.includes(".")) {
            return;
        } else if (cashInput.split(".")[1]?.length >= 2) {
            return;
        } else {
            setCashInput((prev) => prev + val);
        }
    };

    function togglePanel(panel: Panel) {
        setActivePanel((prev) => (prev === panel ? "none" : panel));
    }

    // Receipt shown after payment success (only if orderId is real)
    if (showReceipt && businessId && orderId) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-sm p-0 overflow-hidden">
                    <ReceiptView
                        businessId={businessId}
                        orderId={orderId}
                        onClose={onClose}
                        onNewOrder={onClose}
                    />
                </DialogContent>
            </Dialog>
        );
    }

    if (step === "success") {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="flex flex-col items-center gap-4 pt-4">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-12 w-12 text-primary" />
                        </div>
                        <DialogTitle className="text-2xl font-black text-center">
                            Payment Complete
                        </DialogTitle>
                        <p className="text-muted-foreground text-sm text-center">
                            Processed via {method === "cash" ? "Cash" : "Card"}
                        </p>
                    </DialogHeader>

                    <div className="bg-muted/30 p-5 rounded-2xl border border-border space-y-3 mx-2 my-2">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground text-sm">Total Charged</span>
                            <span className="text-xl font-black">${effectiveTotal.toFixed(2)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground text-sm">Discount</span>
                                <span className="font-bold text-primary">
                                    −${discountAmount.toFixed(2)}
                                </span>
                            </div>
                        )}
                        {method === "cash" && cashGiven > 0 && (
                            <>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground text-sm">
                                        Cash Received
                                    </span>
                                    <span className="font-bold">${cashGiven.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-border pt-3">
                                    <span className="text-muted-foreground text-sm font-black uppercase tracking-wider">
                                        Change Due
                                    </span>
                                    <span className="text-2xl font-black text-primary">
                                        ${change.toFixed(2)}
                                    </span>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between items-center border-t border-border pt-3">
                            <span className="text-muted-foreground text-sm">Transaction ID</span>
                            <span className="font-mono text-xs text-muted-foreground">
                                #PX-{Math.random().toString(36).slice(2, 8).toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3 p-2">
                        {businessId && orderId ? (
                            <Button
                                variant="outline"
                                className="flex-1 gap-2 h-12"
                                onClick={() => setShowReceipt(true)}
                            >
                                <Receipt className="h-4 w-4" />
                                View Receipt
                            </Button>
                        ) : null}
                        <Button className="flex-1 gap-2 h-12 font-black" onClick={onClose}>
                            New Order
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm p-0 overflow-hidden">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-border">
                    <div className="flex items-center gap-3 mb-1">
                        <div
                            className={`p-2 rounded-xl ${
                                method === "cash"
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : "bg-primary/10 text-primary"
                            }`}
                        >
                            {method === "cash" ? (
                                <Banknote className="w-5 h-5" />
                            ) : (
                                <CreditCard className="w-5 h-5" />
                            )}
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-black">
                                {method === "cash" ? "Cash Payment" : "Card Payment"}
                            </DialogTitle>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                Settle Order
                            </p>
                        </div>
                    </div>
                </div>

                {/* Total Due */}
                <div className="px-6 py-4 bg-muted/20 flex items-baseline justify-between border-b border-border">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        Total Due
                    </span>
                    <div className="text-right">
                        <span className="text-4xl font-black text-primary">
                            ${effectiveTotal.toFixed(2)}
                        </span>
                        {discountAmount > 0 && (
                            <p className="text-xs text-muted-foreground line-through">
                                ${total.toFixed(2)}
                            </p>
                        )}
                    </div>
                </div>

                {/* Discount / Split toggles */}
                {businessId && orderId && (
                    <div className="flex gap-2 px-4 pt-3">
                        <button
                            onClick={() => togglePanel("discount")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                activePanel === "discount"
                                    ? "bg-primary/10 border-primary/30 text-primary"
                                    : "bg-muted border-border text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Tag className="w-3 h-3" />
                            Discount
                        </button>
                        <button
                            onClick={() => togglePanel("split")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                activePanel === "split"
                                    ? "bg-primary/10 border-primary/30 text-primary"
                                    : "bg-muted border-border text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Split className="w-3 h-3" />
                            Split Bill
                        </button>
                    </div>
                )}

                {/* Discount panel */}
                {activePanel === "discount" && businessId && orderId && (
                    <div className="px-4 pt-2">
                        <DiscountPanel
                            businessId={businessId}
                            orderId={orderId}
                            currentDiscount={discountAmount}
                            onApplied={(updated) => {
                                setDiscountAmount(Number(updated.discountAmount) || 0);
                                setActivePanel("none");
                            }}
                            onRemoved={() => {
                                setDiscountAmount(0);
                            }}
                        />
                    </div>
                )}

                {/* Split bill panel */}
                {activePanel === "split" && businessId && orderId && (
                    <div className="px-4 pt-2 max-h-72 overflow-y-auto">
                        <SplitBillPanel
                            businessId={businessId}
                            orderId={orderId}
                            orderTotal={effectiveTotal}
                            orderItems={orderItems}
                            onAllPaid={() => {
                                setStep("success");
                                setActivePanel("none");
                            }}
                        />
                    </div>
                )}

                {/* Cash input — only when no panel open */}
                {activePanel === "none" && method === "cash" && (
                    <div className="p-4 space-y-3">
                        <div className="bg-muted/30 rounded-2xl p-4 border border-border text-center">
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">
                                Cash Tendered
                            </p>
                            <p className="text-3xl font-black font-mono">
                                ${cashInput || "0.00"}
                            </p>
                            {cashInput && (
                                <p
                                    className={`text-sm font-black mt-1 ${
                                        change >= 0 ? "text-primary" : "text-destructive"
                                    }`}
                                >
                                    {change >= 0
                                        ? `Change: $${change.toFixed(2)}`
                                        : `Short by $${Math.abs(change).toFixed(2)}`}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-5 gap-1.5">
                            {QUICK_AMOUNTS.map((amt) => (
                                <button
                                    key={amt}
                                    onClick={() => setCashInput(amt.toFixed(2))}
                                    className="py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-black transition-colors active:scale-95"
                                >
                                    ${amt}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-1.5">
                            {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "DEL"].map(
                                (k) => (
                                    <button
                                        key={k}
                                        onClick={() => handleKeypad(k)}
                                        className={`h-12 rounded-xl font-black text-sm transition-all active:scale-95 flex items-center justify-center ${
                                            k === "DEL"
                                                ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                                : "bg-muted hover:bg-muted/80"
                                        }`}
                                    >
                                        {k === "DEL" ? <Delete className="w-4 h-4" /> : k}
                                    </button>
                                ),
                            )}
                        </div>
                    </div>
                )}

                {/* Card — no panel open */}
                {activePanel === "none" && method === "card" && (
                    <div className="p-6 flex flex-col items-center gap-4">
                        <div className="w-24 h-24 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                            <CreditCard className="w-10 h-10 text-primary" />
                        </div>
                        <p className="text-muted-foreground text-sm text-center">
                            Present card or tap device to terminal
                        </p>
                    </div>
                )}

                {activePanel === "none" && (
                    <div className="px-4 pb-4">
                        <Button
                            onClick={() => setStep("success")}
                            disabled={!isValidCash}
                            className="w-full h-14 font-black text-sm rounded-2xl gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            CONFIRM PAYMENT
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
