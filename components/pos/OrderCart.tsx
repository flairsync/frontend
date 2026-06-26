import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Minus, Plus, Trash2, CreditCard, Banknote,
    Utensils, Package, MapPin, Send, AlertCircle, ChefHat,
} from "lucide-react";
import { ValidationAlert } from "./ValidationAlert";
import { type CartItem, calcSubtotal, calcTax, getTaxRate } from "@/features/pos/types";
import { formatCurrency } from "@/lib/formatCurrency";
import { useTranslation } from "react-i18next";

export type { CartItem };

interface OrderCartProps {
    items: CartItem[];
    orderMode: "dine-in" | "takeaway";
    selectedTable?: string;
    staffName?: string;
    currency?: string;
    kitchenNotes?: string;
    taxExempt?: boolean;
    canCreateOrder?: boolean;
    canApplyDiscount?: boolean;
    onUpdateQuantity: (id: string, delta: number) => void;
    onRemoveItem: (id: string) => void;
    onClear: () => void;
    onPayment: (method: "cash" | "card") => void;
    onConfirm: () => void;
    onChangeMode: (mode: "dine-in" | "takeaway") => void;
    onChangeTable: () => void;
    onKitchenNotesChange?: (notes: string) => void;
    onTaxExemptChange?: (exempt: boolean) => void;
}

export function OrderCart({
    items,
    orderMode,
    selectedTable,
    staffName,
    currency = "USD",
    kitchenNotes = "",
    taxExempt = false,
    canCreateOrder = true,
    canApplyDiscount = true,
    onUpdateQuantity,
    onRemoveItem,
    onClear,
    onPayment,
    onConfirm,
    onChangeMode,
    onChangeTable,
    onKitchenNotesChange,
    onTaxExemptChange,
}: OrderCartProps) {
    const { t } = useTranslation("pos");
    const subtotal = calcSubtotal(items);
    const taxRate = getTaxRate();
    const tax = taxExempt ? 0 : calcTax(subtotal);
    const total = subtotal + tax;

    const isDineInMissingTable = orderMode === "dine-in" && !selectedTable;
    const isCartEmpty = items.length === 0;

    const getMainAction = () => {
        if (isCartEmpty)
            return {
                label: t("order_cart.actions.cart_empty"),
                disabled: true,
                icon: <AlertCircle className="w-4 h-4" />,
            };
        if (isDineInMissingTable)
            return {
                label: t("order_cart.actions.select_table"),
                disabled: false,
                icon: <MapPin className="w-4 h-4" />,
                highlight: true,
            };
        return {
            label: t("order_cart.actions.confirm_and_send"),
            disabled: false,
            icon: <Send className="w-4 h-4" />,
        };
    };

    const action = getMainAction();

    return (
        <div className="flex flex-col h-full bg-card border-l border-border overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-border space-y-5 bg-card/50">
                <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                        <h2 className="text-xl font-black tracking-tight">{t("order_cart.header.active_order")}</h2>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            {staffName ? t("order_cart.header.operator", { name: staffName }) : t("order_cart.header.no_staff_logged_in")}
                        </p>
                    </div>
                    {!isCartEmpty && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClear}
                            className="text-destructive hover:bg-destructive/10 h-8 font-black text-[10px] uppercase tracking-widest"
                        >
                            {t("order_cart.header.discard")}
                        </Button>
                    )}
                </div>

                {/* Mode selector */}
                <div className="grid grid-cols-2 bg-background p-1.5 rounded-2xl border border-border">
                    <button
                        onClick={() => onChangeMode("dine-in")}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            orderMode === "dine-in"
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Utensils className="w-3.5 h-3.5" />
                        {t("order_cart.mode.dine_in")}
                    </button>
                    <button
                        onClick={() => onChangeMode("takeaway")}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            orderMode === "takeaway"
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Package className="w-3.5 h-3.5" />
                        {t("order_cart.mode.takeaway")}
                    </button>
                </div>

                {/* Table selector */}
                {orderMode === "dine-in" && (
                    <div
                        onClick={onChangeTable}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                            selectedTable
                                ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                                : "bg-destructive/5 border-destructive/20 hover:bg-destructive/10 border-dashed animate-pulse"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`p-2 rounded-xl ${
                                    selectedTable
                                        ? "bg-primary/15 text-primary"
                                        : "bg-destructive/15 text-destructive"
                                }`}
                            >
                                <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[9px] uppercase font-black text-muted-foreground tracking-tighter">
                                    {t("order_cart.table.location")}
                                </p>
                                <p
                                    className={`text-sm font-black ${
                                        selectedTable
                                            ? "text-primary"
                                            : "text-destructive italic underline decoration-wavy underline-offset-4"
                                    }`}
                                >
                                    {selectedTable || t("order_cart.table.assign_a_table")}
                                </p>
                            </div>
                        </div>
                        {selectedTable && (
                            <span className="text-[10px] font-black text-primary/60 uppercase">
                                {t("order_cart.table.change")}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Cart items */}
            <ScrollArea className="flex-1 p-6">
                {isCartEmpty ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 border border-border">
                            <Package className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest">
                            {t("order_cart.empty.title")}
                        </p>
                        <p className="text-[10px] mt-1 italic">{t("order_cart.empty.description")}</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between items-start gap-4 p-3 rounded-2xl bg-background/50 border border-border hover:border-primary/20 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-xs uppercase tracking-tight truncate">
                                        {item.name}
                                        {item.variantName && (
                                            <span className="font-normal normal-case text-muted-foreground ml-1">
                                                ({item.variantName})
                                            </span>
                                        )}
                                    </h4>
                                    {item.modifierNames.length > 0 && (
                                        <p className="text-[10px] text-muted-foreground truncate">
                                            + {item.modifierNames.join(", ")}
                                        </p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground font-bold mt-0.5">
                                        {t("order_cart.item.price_per_unit", { price: formatCurrency(item.price, currency) })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 bg-muted rounded-lg hover:bg-muted/80 active:scale-90"
                                        onClick={() => onUpdateQuantity(item.id, -1)}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-5 text-center font-black text-xs text-primary">
                                        {item.quantity}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 bg-muted rounded-lg hover:bg-muted/80 active:scale-90"
                                        onClick={() => onUpdateQuantity(item.id, 1)}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10 ml-1"
                                        onClick={() => onRemoveItem(item.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            {/* Kitchen notes + tax-exempt */}
            {!isCartEmpty && (
                <div className="px-6 pb-3 space-y-3">
                    <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                            <ChefHat className="w-3 h-3" />
                            {t("order_cart.kitchen_note.label")}
                        </Label>
                        <Textarea
                            placeholder={t("order_cart.kitchen_note.placeholder")}
                            value={kitchenNotes}
                            onChange={(e) => onKitchenNotesChange?.(e.target.value)}
                            rows={2}
                            className="text-xs resize-none bg-background/50"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="tax-exempt-toggle" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                            {t("order_cart.tax_exempt")}
                        </Label>
                        <Switch
                            id="tax-exempt-toggle"
                            checked={taxExempt}
                            onCheckedChange={onTaxExemptChange}
                        />
                    </div>
                </div>
            )}

            {/* Validation hint */}
            <div className="px-6 py-2">
                <ValidationAlert
                    type={isDineInMissingTable ? "error" : "info"}
                    message={
                        isDineInMissingTable
                            ? t("order_cart.validation.table_required")
                            : t("order_cart.validation.ready_for_kitchen")
                    }
                    isVisible={!isCartEmpty}
                />
            </div>

            {/* Totals + payment */}
            <div className="p-6 bg-background space-y-5 border-t border-border">
                <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <span>{t("order_cart.totals.subtotal")}</span>
                        <span>{formatCurrency(subtotal, currency)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <span>
                            {taxExempt
                                ? t("order_cart.totals.tax_exempt")
                                : taxRate > 0
                                ? t("order_cart.totals.tax_with_rate", { rate: (taxRate * 100).toFixed(0) })
                                : t("order_cart.totals.tax")}
                        </span>
                        <span>{formatCurrency(tax, currency)}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-2">
                        <span className="text-sm font-black uppercase tracking-tighter">
                            {t("order_cart.totals.total_amount")}
                        </span>
                        <span className="text-3xl font-black text-primary">
                            {formatCurrency(total, currency)}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                    {canCreateOrder && (
                        <Button
                            onClick={action.highlight ? onChangeTable : onConfirm}
                            disabled={action.disabled}
                            className={`w-full h-16 font-black text-sm gap-3 rounded-2xl shadow-xl transition-all active:scale-[0.98] ${
                                action.highlight
                                    ? "bg-amber-500 hover:bg-amber-600 text-amber-950 animate-pulse"
                                    : ""
                            }`}
                        >
                            {action.icon}
                            {action.label.toUpperCase()}
                        </Button>
                    )}

                    {canCreateOrder && (
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="h-14 flex flex-col items-center justify-center gap-1 font-black hover:bg-muted rounded-2xl active:scale-95 transition-all text-[9px] tracking-widest"
                                disabled={isCartEmpty || isDineInMissingTable}
                                onClick={() => onPayment("cash")}
                            >
                                <Banknote className="h-4 w-4 text-muted-foreground" />
                                {t("order_cart.payment.cash_settle")}
                            </Button>
                            <Button
                                variant="outline"
                                className="h-14 flex flex-col items-center justify-center gap-1 font-black hover:bg-muted rounded-2xl active:scale-95 transition-all text-[9px] tracking-widest"
                                disabled={isCartEmpty || isDineInMissingTable}
                                onClick={() => onPayment("card")}
                            >
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                {t("order_cart.payment.card_settle")}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
