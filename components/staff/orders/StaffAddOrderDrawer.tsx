"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import StaffAddOrderMenu from "./StaffAddOrderMenu"
import { StaffAddOrderMobileView } from "./StaffAddOrderMobileView"
import { useBusinessMenus } from "@/features/business/menu/useBusinessMenus"
import { useFloors } from "@/features/floor-plan/useFloorPlan"
import { useOrders } from "@/features/orders/useOrders"
import { useBusinessBasicDetails } from "@/features/business/useBusinessBasicDetails"
import { getCurrencySymbol } from "@/utils/currency"
import { useIsMobile } from "@/hooks/use-mobile"
import { Plus, Minus, Trash2, ShoppingBag, UtensilsCrossed, ChefHat } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { OrderItemConfigModal, ConfiguredOrderItem } from "./OrderItemConfigModal"

interface AddOrderDrawerProps {
    businessId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function StaffAddOrderDrawer({ businessId, open, onOpenChange }: AddOrderDrawerProps) {
    const { t } = useTranslation("management")
    const isMobile = useIsMobile()
    const { businessAllCategories } = useBusinessMenus(businessId)
    const { floors } = useFloors(businessId, true)
    const { createOrder, isCreatingOrder } = useOrders(businessId)
    const { businessBasicDetails } = useBusinessBasicDetails(businessId)
    const currencySymbol = getCurrencySymbol(businessBasicDetails?.currency)

    const [orderType, setOrderType] = React.useState<"dine_in" | "takeaway" | "delivery">("dine_in")
    const [selectedTable, setSelectedTable] = React.useState<string>("none")
    const [kitchenNotes, setKitchenNotes] = React.useState("")
    const [taxExempt, setTaxExempt] = React.useState(false)

    // items state includes an internal id, menuItemId, quantity, variants, modifiers
    const [selectedItems, setSelectedItems] = React.useState<(ConfiguredOrderItem & { id: string })[]>([])

    // Config modal state
    const [configModalOpen, setConfigModalOpen] = React.useState(false)
    const [selectedConfigItem, setSelectedConfigItem] = React.useState<any>(null)

    // Flat tables list from floors, sorted by table number
    const tables = React.useMemo(() => {
        const all = floors?.flatMap((f: any) => f.tables || []) || []
        return all.sort((a: any, b: any) => {
            const numA = parseInt(a.name.replace(/\D/g, ""), 10)
            const numB = parseInt(b.name.replace(/\D/g, ""), 10)
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB
            return a.name.localeCompare(b.name)
        })
    }, [floors])

    const handleSelectItem = (menuItem: any) => {
        if ((menuItem.variants && menuItem.variants.length > 0) || (menuItem.modifierGroups && menuItem.modifierGroups.length > 0)) {
            setSelectedConfigItem(menuItem)
            setConfigModalOpen(true)
            return
        }

        setSelectedItems(prev => {
            const existing = prev.find(i => i.menuItemId === menuItem.id && !i.variantId && (!i.modifiers || i.modifiers.length === 0))
            if (existing) {
                return prev.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i)
            }
            return [...prev, { id: Date.now().toString(), menuItemId: menuItem.id, name: menuItem.name, price: Number(menuItem.price || 0), quantity: 1 }]
        })
    }

    const handleSaveConfig = (config: ConfiguredOrderItem) => {
        setSelectedItems(prev => {
            // Compare if exact config exists to increment
            const existingIndex = prev.findIndex(i =>
                i.menuItemId === config.menuItemId &&
                i.variantId === config.variantId &&
                JSON.stringify(i.modifiers || []) === JSON.stringify(config.modifiers || []) &&
                i.notes === config.notes
            )

            if (existingIndex >= 0) {
                const updated = [...prev]
                updated[existingIndex].quantity += config.quantity
                return updated
            }

            return [...prev, { ...config, id: Date.now().toString() + Math.random().toString(36).substring(7) }]
        })
        setConfigModalOpen(false)
        setSelectedConfigItem(null)
    }

    const handleUpdateQuantity = (id: string, delta: number) => {
        setSelectedItems(prev => {
            return prev.map(i => {
                if (i.id === id) {
                    return { ...i, quantity: Math.max(0, i.quantity + delta) }
                }
                return i
            }).filter(i => i.quantity > 0)
        })
    }

    const handleRemoveItem = (id: string) => {
        setSelectedItems(prev => prev.filter(i => i.id !== id))
    }

    const resetForm = () => {
        setOrderType("dine_in")
        setSelectedTable("none")
        setSelectedItems([])
        setKitchenNotes("")
        setTaxExempt(false)
    }

    const handleSubmit = () => {
        if (selectedItems.length === 0) {
            toast.error(t("staff_add_order.errors.no_items"))
            return
        }

        if (orderType === "dine_in" && (!selectedTable || selectedTable === "none")) {
            toast.error(t("staff_add_order.errors.no_table"))
            return
        }

        createOrder({
            type: orderType,
            tableId: orderType === "dine_in" ? selectedTable : undefined,
            items: selectedItems.map(i => ({
                menuItemId: i.menuItemId,
                quantity: i.quantity,
                variantId: i.variantId,
                modifiers: i.modifiers?.map(m => ({ modifierItemId: m.modifierItemId })),
                notes: i.notes
            })),
            kitchenNotes: kitchenNotes.trim() || undefined,
            taxExempt: taxExempt || undefined,
        }, {
            onSuccess: () => {
                toast.success(t("staff_add_order.toasts.created"))
                resetForm()
                onOpenChange(false)
            }
        })
    }

    const totalAmount = React.useMemo(() => {
        return selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    }, [selectedItems])

    return (
        <Dialog open={open} onOpenChange={(o) => {
            if (!o) resetForm()
            onOpenChange(o)
        }}>
            {isMobile ? (
                <DialogContent
                    className="max-w-none w-screen h-[100dvh] rounded-none top-0 left-0 translate-x-0 translate-y-0 p-0 gap-0 overflow-hidden flex flex-col"
                    onPointerDownOutside={(e) => {
                        if ((e.target as HTMLElement | null)?.closest("[data-radix-popper-content-wrapper]")) {
                            e.preventDefault()
                        }
                    }}
                >
                    <DialogTitle className="sr-only">{t("staff_add_order.title")}</DialogTitle>
                    <DialogDescription className="sr-only">{t("staff_add_order.description")}</DialogDescription>
                    <StaffAddOrderMobileView
                        categories={businessAllCategories || []}
                        onSelectItem={handleSelectItem}
                        currencySymbol={currencySymbol}
                        orderType={orderType}
                        setOrderType={setOrderType}
                        tables={tables}
                        selectedTable={selectedTable}
                        setSelectedTable={setSelectedTable}
                        kitchenNotes={kitchenNotes}
                        setKitchenNotes={setKitchenNotes}
                        taxExempt={taxExempt}
                        setTaxExempt={setTaxExempt}
                        selectedItems={selectedItems}
                        onUpdateQuantity={handleUpdateQuantity}
                        totalAmount={totalAmount}
                        onSubmit={handleSubmit}
                        isSubmitting={isCreatingOrder}
                    />
                </DialogContent>
            ) : (
                <DialogContent
                    className="max-w-5xl p-0 overflow-hidden bg-background h-[90vh] md:h-[80vh] flex flex-col md:flex-row gap-0"
                    onPointerDownOutside={(e) => {
                        if ((e.target as HTMLElement | null)?.closest("[data-radix-popper-content-wrapper]")) {
                            e.preventDefault()
                        }
                    }}
                >

                    {/* Left Side: Menu Selection */}
                    <div className="flex-1 flex flex-col h-1/2 md:h-full bg-muted/10">
                        <DialogHeader className="p-6 pb-2 text-left">
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <UtensilsCrossed className="w-5 h-5 text-primary" />
                                {t("staff_add_order.title")}
                            </DialogTitle>
                            <DialogDescription>
                                {t("staff_add_order.description")}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto px-6 pb-6">
                            <StaffAddOrderMenu
                                categories={businessAllCategories || []}
                                onSelectItem={handleSelectItem}
                                currencySymbol={currencySymbol}
                            />
                        </div>
                    </div>

                    {/* Right Side: Order Summary & Configuration */}
                    <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col border-t md:border-t-0 md:border-l bg-background h-1/2 md:h-full">
                        <div className="p-6 border-b flex items-center justify-between bg-muted/5">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4" />
                                {t("staff_add_order.order_details_heading")}
                            </h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Order Configuration */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type" className="text-xs font-semibold uppercase text-muted-foreground">{t("staff_add_order.order_type_label")}</Label>
                                    <Select value={orderType} onValueChange={(val: any) => setOrderType(val)}>
                                        <SelectTrigger id="type" className="h-10">
                                            <SelectValue placeholder={t("staff_add_order.order_type_placeholder")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="dine_in">{t("staff_add_order.dine_in")}</SelectItem>
                                            <SelectItem value="takeaway">{t("staff_add_order.takeaway")}</SelectItem>
                                            <SelectItem value="delivery">{t("staff_add_order.delivery")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {orderType === "dine_in" && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Label htmlFor="table" className="text-xs font-semibold uppercase text-muted-foreground">{t("staff_add_order.select_table_label")} <span className="text-red-500">*</span></Label>
                                        <Select value={selectedTable} onValueChange={setSelectedTable}>
                                            <SelectTrigger id="table" className="h-10">
                                                <SelectValue placeholder={t("staff_add_order.choose_table_placeholder")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">{t("staff_add_order.provide_table_option")}</SelectItem>
                                                {tables.map((table: any) => (
                                                    <SelectItem key={table.id} value={table.id}>
                                                        {t("staff_add_order.table_option", { name: table.name, capacity: table.capacity })}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            {/* Kitchen Notes */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                    <ChefHat className="w-3.5 h-3.5" />
                                    {t("staff_add_order.kitchen_note_label")}
                                </Label>
                                <Textarea
                                    placeholder={t("staff_add_order.kitchen_note_placeholder")}
                                    value={kitchenNotes}
                                    onChange={(e) => setKitchenNotes(e.target.value)}
                                    rows={2}
                                    className="text-sm resize-none"
                                />
                            </div>

                            {/* Tax Exempt */}
                            <div className="flex items-center justify-between py-1">
                                <Label htmlFor="staff-tax-exempt" className="text-xs font-semibold uppercase text-muted-foreground">
                                    {t("staff_add_order.tax_exempt_label")}
                                </Label>
                                <Switch
                                    id="staff-tax-exempt"
                                    checked={taxExempt}
                                    onCheckedChange={setTaxExempt}
                                />
                            </div>

                            {/* Selected Items List */}
                            <div className="space-y-3">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground flex justify-between">
                                    <span>{t("staff_add_order.selected_items_label")}</span>
                                    <span>{selectedItems.length > 0 ? t("staff_add_order.items_count", { count: selectedItems.reduce((a, b) => a + b.quantity, 0) }) : ""}</span>
                                </Label>

                                {selectedItems.length === 0 ? (
                                    <div className="rounded-lg border border-dashed p-8 text-center bg-muted/20">
                                        <ShoppingBag className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">{t("staff_add_order.empty_items")}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedItems.map(item => (
                                            <div key={item.id} className="p-3 bg-muted/20 rounded-lg border flex items-center justify-between group">
                                                <div className="flex flex-col flex-1 truncate pr-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium truncate">{item.name}</span>
                                                        {item.variantId && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{t("staff_add_order.variant_selected")}</span>}
                                                    </div>
                                                    {item.modifiers && item.modifiers.length > 0 && (
                                                        <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                                                            {t("staff_add_order.mods_prefix", { list: item.modifiers.map(m => m.name).join(", ") })}
                                                        </span>
                                                    )}
                                                    {item.notes && (
                                                        <span className="text-[10px] text-amber-600 line-clamp-1 mt-0.5 italic">
                                                            {t("staff_add_order.note_prefix", { note: item.notes })}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-muted-foreground mt-0.5">{t("staff_add_order.price_each", { price: `${currencySymbol}${item.price.toFixed(2)}` })}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-background border rounded-md p-1 shadow-sm">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-sm hover:bg-muted active:bg-muted" onClick={() => handleUpdateQuantity(item.id, -1)}>
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <span className="text-sm font-medium w-5 text-center leading-none">{item.quantity}</span>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-sm hover:bg-muted active:bg-muted" onClick={() => handleUpdateQuantity(item.id, 1)}>
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer / Summary */}
                        <div className="p-6 border-t bg-muted/5">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-base text-muted-foreground">{t("staff_add_order.subtotal")}</span>
                                <span className="text-2xl font-bold tracking-tight">{currencySymbol}{totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                                    {t("staff_add_order.cancel")}
                                </Button>
                                <Button
                                    className="flex-[2]"
                                    onClick={handleSubmit}
                                    disabled={selectedItems.length === 0 || (orderType === "dine_in" && selectedTable === "none") || isCreatingOrder}
                                >
                                    {isCreatingOrder ? t("staff_add_order.processing") : t("staff_add_order.place_order")}
                                </Button>
                            </div>
                        </div>
                    </div>

                </DialogContent>
            )}

            <OrderItemConfigModal
                open={configModalOpen}
                onClose={() => {
                    setConfigModalOpen(false)
                    setSelectedConfigItem(null)
                }}
                item={selectedConfigItem}
                onSave={handleSaveConfig}
                currencySymbol={currencySymbol}
            />
        </Dialog>
    )
}
