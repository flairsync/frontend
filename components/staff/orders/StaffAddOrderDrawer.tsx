"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import StaffAddOrderMenu from "./StaffAddOrderMenu"
import { useBusinessMenus } from "@/features/business/menu/useBusinessMenus"
import { useFloors } from "@/features/floor-plan/useFloorPlan"
import { useOrders } from "@/features/orders/useOrders"
import { Plus, Minus, Trash2, ShoppingBag, UtensilsCrossed } from "lucide-react"

interface AddOrderDrawerProps {
    businessId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function StaffAddOrderDrawer({ businessId, open, onOpenChange }: AddOrderDrawerProps) {
    const { businessAllCategories } = useBusinessMenus(businessId)
    const { floors } = useFloors(businessId)
    const { createOrder, isCreatingOrder } = useOrders(businessId)

    const [orderType, setOrderType] = React.useState<"dine_in" | "takeaway" | "delivery">("dine_in")
    const [selectedTable, setSelectedTable] = React.useState<string>("none")

    // items state includes menuItemId and quantity
    const [selectedItems, setSelectedItems] = React.useState<{ menuItemId: string; name: string; price: number; quantity: number }[]>([])

    // Flat tables list from floors
    const tables = React.useMemo(() => {
        return floors?.flatMap((f: any) => f.tables || []) || []
    }, [floors])

    const handleSelectItem = (menuItem: any) => {
        setSelectedItems(prev => {
            const existing = prev.find(i => i.menuItemId === menuItem.id)
            if (existing) {
                return prev.map(i => i.menuItemId === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i)
            }
            return [...prev, { menuItemId: menuItem.id, name: menuItem.name, price: Number(menuItem.price || 0), quantity: 1 }]
        })
    }

    const handleUpdateQuantity = (menuItemId: string, delta: number) => {
        setSelectedItems(prev => {
            return prev.map(i => {
                if (i.menuItemId === menuItemId) {
                    return { ...i, quantity: Math.max(0, i.quantity + delta) }
                }
                return i
            }).filter(i => i.quantity > 0)
        })
    }

    const handleRemoveItem = (menuItemId: string) => {
        setSelectedItems(prev => prev.filter(i => i.menuItemId !== menuItemId))
    }

    const resetForm = () => {
        setOrderType("dine_in")
        setSelectedTable("none")
        setSelectedItems([])
    }

    const handleSubmit = () => {
        if (selectedItems.length === 0) {
            toast.error("Please add at least one item to the order")
            return
        }

        if (orderType === "dine_in" && (!selectedTable || selectedTable === "none")) {
            toast.error("Please select a table for Dine-in orders")
            return
        }

        createOrder({
            type: orderType,
            tableId: orderType === "dine_in" ? selectedTable : undefined,
            items: selectedItems.map(i => ({
                menuItemId: i.menuItemId,
                quantity: i.quantity
            }))
        }, {
            onSuccess: () => {
                toast.success("Order created successfully")
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
            <DialogContent className="max-w-5xl p-0 overflow-hidden bg-background h-[90vh] md:h-[80vh] flex flex-col md:flex-row gap-0">

                {/* Left Side: Menu Selection */}
                <div className="flex-1 flex flex-col h-1/2 md:h-full bg-muted/10">
                    <DialogHeader className="p-6 pb-2 text-left">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <UtensilsCrossed className="w-5 h-5 text-primary" />
                            Create New Order
                        </DialogTitle>
                        <DialogDescription>
                            Browse the menu and select items for this order.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-6 pb-6">
                        <StaffAddOrderMenu
                            categories={businessAllCategories || []}
                            onSelectItem={handleSelectItem}
                        />
                    </div>
                </div>

                {/* Right Side: Order Summary & Configuration */}
                <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col border-t md:border-t-0 md:border-l bg-background h-1/2 md:h-full">
                    <div className="p-6 border-b flex items-center justify-between bg-muted/5">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" />
                            Order Details
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Order Configuration */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="type" className="text-xs font-semibold uppercase text-muted-foreground">Order Type</Label>
                                <Select value={orderType} onValueChange={(val: any) => setOrderType(val)}>
                                    <SelectTrigger id="type" className="h-10">
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
                                    <Label htmlFor="table" className="text-xs font-semibold uppercase text-muted-foreground">Select Table <span className="text-red-500">*</span></Label>
                                    <Select value={selectedTable} onValueChange={setSelectedTable}>
                                        <SelectTrigger id="table" className="h-10">
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

                        {/* Selected Items List */}
                        <div className="space-y-3">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground flex justify-between">
                                <span>Selected Items</span>
                                <span>{selectedItems.length > 0 ? `${selectedItems.reduce((a, b) => a + b.quantity, 0)} items` : ""}</span>
                            </Label>

                            {selectedItems.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-8 text-center bg-muted/20">
                                    <ShoppingBag className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">No items added yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {selectedItems.map(item => (
                                        <div key={item.menuItemId} className="p-3 bg-muted/20 rounded-lg border flex items-center justify-between group">
                                            <div className="flex flex-col flex-1 truncate pr-3">
                                                <span className="text-sm font-medium truncate">{item.name}</span>
                                                <span className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-background border rounded-md p-1 shadow-sm">
                                                <Button size="icon" variant="ghost" className="h-6 w-6 rounded-sm hover:bg-muted" onClick={() => handleUpdateQuantity(item.menuItemId, -1)}>
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="text-sm font-medium w-5 text-center leading-none">{item.quantity}</span>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 rounded-sm hover:bg-muted" onClick={() => handleUpdateQuantity(item.menuItemId, 1)}>
                                                    <Plus className="h-3 w-3" />
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
                            <span className="text-base text-muted-foreground">Subtotal</span>
                            <span className="text-2xl font-bold tracking-tight">${totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="flex-[2]"
                                onClick={handleSubmit}
                                disabled={selectedItems.length === 0 || (orderType === "dine_in" && selectedTable === "none") || isCreatingOrder}
                            >
                                {isCreatingOrder ? "Processing..." : "Place Order"}
                            </Button>
                        </div>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}
