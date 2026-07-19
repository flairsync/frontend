"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Minus, ShoppingBag, ChefHat, ChevronLeft } from "lucide-react"
import StaffAddOrderMenu from "./StaffAddOrderMenu"
import { ConfiguredOrderItem } from "./OrderItemConfigModal"

interface StaffAddOrderMobileViewProps {
    categories: any[]
    onSelectItem: (item: any) => void
    currencySymbol?: string

    orderType: "dine_in" | "takeaway" | "delivery"
    setOrderType: (v: "dine_in" | "takeaway" | "delivery") => void
    tables: any[]
    selectedTable: string
    setSelectedTable: (v: string) => void

    kitchenNotes: string
    setKitchenNotes: (v: string) => void
    taxExempt: boolean
    setTaxExempt: (v: boolean) => void

    selectedItems: (ConfiguredOrderItem & { id: string })[]
    onUpdateQuantity: (id: string, delta: number) => void

    totalAmount: number
    onSubmit: () => void
    isSubmitting: boolean
}

export function StaffAddOrderMobileView({
    categories,
    onSelectItem,
    currencySymbol = "$",
    orderType,
    setOrderType,
    tables,
    selectedTable,
    setSelectedTable,
    kitchenNotes,
    setKitchenNotes,
    taxExempt,
    setTaxExempt,
    selectedItems,
    onUpdateQuantity,
    totalAmount,
    onSubmit,
    isSubmitting,
}: StaffAddOrderMobileViewProps) {
    const [step, setStep] = React.useState<"menu" | "review">("menu")
    const itemCount = selectedItems.reduce((a, b) => a + b.quantity, 0)
    const canSubmit = selectedItems.length > 0 && !(orderType === "dine_in" && selectedTable === "none")

    return (
        <div className="flex flex-col h-full w-full">
            {/* Step header */}
            <div className="flex items-center gap-2 px-4 py-3 pr-12 border-b shrink-0 min-h-[52px]">
                {step === "review" && (
                    <button
                        className="flex items-center justify-center -ml-1 h-9 w-9 text-muted-foreground"
                        onClick={() => setStep("menu")}
                        aria-label="Back to menu"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}
                <span className="font-semibold">{step === "menu" ? "Add Items" : "Review Order"}</span>
            </div>

            {/* Step content */}
            {step === "menu" ? (
                <div className="flex-1 overflow-hidden p-4">
                    <StaffAddOrderMenu categories={categories} onSelectItem={onSelectItem} currencySymbol={currencySymbol} />
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="mobile-type" className="text-xs font-semibold uppercase text-muted-foreground">Order Type</Label>
                            <Select value={orderType} onValueChange={(val: any) => setOrderType(val)}>
                                <SelectTrigger id="mobile-type" className="h-11">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dine_in">Dine-in</SelectItem>
                                    <SelectItem value="takeaway">Takeaway</SelectItem>
                                    <SelectItem value="delivery">Delivery</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {orderType === "dine_in" && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label htmlFor="mobile-table" className="text-xs font-semibold uppercase text-muted-foreground">Select Table <span className="text-red-500">*</span></Label>
                                <Select value={selectedTable} onValueChange={setSelectedTable}>
                                    <SelectTrigger id="mobile-table" className="h-11">
                                        <SelectValue placeholder="Choose a table" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- Provide a table --</SelectItem>
                                        {tables.map((table: any) => (
                                            <SelectItem key={table.id} value={table.id}>
                                                {table.name} (Cap: {table.capacity})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                            <ChefHat className="w-3.5 h-3.5" />
                            Kitchen Note / Allergy Info
                        </Label>
                        <Textarea
                            placeholder="e.g. Severe nut allergy at table"
                            value={kitchenNotes}
                            onChange={(e) => setKitchenNotes(e.target.value)}
                            rows={2}
                            className="text-sm resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-between py-1">
                        <Label htmlFor="mobile-tax-exempt" className="text-xs font-semibold uppercase text-muted-foreground">
                            Tax Exempt
                        </Label>
                        <Switch
                            id="mobile-tax-exempt"
                            checked={taxExempt}
                            onCheckedChange={setTaxExempt}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-semibold uppercase text-muted-foreground flex justify-between">
                            <span>Selected Items</span>
                            <span>{itemCount > 0 ? `${itemCount} items` : ""}</span>
                        </Label>

                        {selectedItems.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-8 text-center bg-muted/20">
                                <ShoppingBag className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">No items added yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {selectedItems.map(item => (
                                    <div key={item.id} className="p-3 bg-muted/20 rounded-lg border flex items-center justify-between gap-2">
                                        <div className="flex flex-col flex-1 truncate">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium truncate">{item.name}</span>
                                                {item.variantId && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full shrink-0">Variant</span>}
                                            </div>
                                            {item.modifiers && item.modifiers.length > 0 && (
                                                <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                                                    Mods: {item.modifiers.map(m => m.name).join(", ")}
                                                </span>
                                            )}
                                            {item.notes && (
                                                <span className="text-[10px] text-amber-600 line-clamp-1 mt-0.5 italic">
                                                    Note: {item.notes}
                                                </span>
                                            )}
                                            <span className="text-xs text-muted-foreground mt-0.5">{currencySymbol}{item.price.toFixed(2)} each</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-background border rounded-md p-1 shadow-sm shrink-0">
                                            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-sm hover:bg-muted" onClick={() => onUpdateQuantity(item.id, -1)}>
                                                <Minus className="h-3.5 w-3.5" />
                                            </Button>
                                            <span className="text-sm font-medium w-5 text-center leading-none">{item.quantity}</span>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-sm hover:bg-muted" onClick={() => onUpdateQuantity(item.id, 1)}>
                                                <Plus className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Sticky action bar */}
            <div className="border-t bg-background p-3 shrink-0" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
                {step === "menu" ? (
                    <Button
                        size="lg"
                        className="w-full justify-between"
                        disabled={itemCount === 0}
                        onClick={() => setStep("review")}
                    >
                        <span className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" />
                            View Order
                        </span>
                        <span>{itemCount} · {currencySymbol}{totalAmount.toFixed(2)}</span>
                    </Button>
                ) : (
                    <Button
                        size="lg"
                        className="w-full"
                        onClick={onSubmit}
                        disabled={!canSubmit || isSubmitting}
                    >
                        {isSubmitting ? "Processing..." : `Place Order · ${currencySymbol}${totalAmount.toFixed(2)}`}
                    </Button>
                )}
            </div>
        </div>
    )
}
