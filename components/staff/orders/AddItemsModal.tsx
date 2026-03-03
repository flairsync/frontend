"use client"

import React, { useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Plus, Minus, Search, Trash2 } from "lucide-react";
import { useBusinessMenus } from "@/features/business/menu/useBusinessMenus";
import { useOrders } from "@/features/orders/useOrders";
import { OrderItemConfigModal, ConfiguredOrderItem } from "./OrderItemConfigModal";

interface AddItemsModalProps {
    businessId: string;
    orderId: string | null;
    open: boolean;
    onClose: () => void;
}

export function AddItemsModal({ businessId, orderId, open, onClose }: AddItemsModalProps) {
    const { businessAllCategories } = useBusinessMenus(businessId);
    const { addItemsToOrder, isAddingItems } = useOrders(businessId);

    const [search, setSearch] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
    const [selectedItems, setSelectedItems] = useState<(ConfiguredOrderItem & { id: string })[]>([]);

    // Config modal state
    const [configModalOpen, setConfigModalOpen] = useState(false);
    const [selectedConfigItem, setSelectedConfigItem] = useState<any>(null);

    const filteredCategories = useMemo(() => {
        if (!businessAllCategories) return [];
        let catsToFilter = businessAllCategories;
        if (selectedCategoryId !== "all") {
            catsToFilter = businessAllCategories.filter(c => c.id === selectedCategoryId);
        }

        if (!search.trim()) return catsToFilter;
        const lower = search.toLowerCase();

        return catsToFilter.map(cat => {
            const fItems = cat.items.filter((item: any) =>
                item.name.toLowerCase().includes(lower) ||
                (item.description && item.description.toLowerCase().includes(lower))
            );
            return { ...cat, items: fItems };
        }).filter(cat => cat.items.length > 0);
    }, [businessAllCategories, search, selectedCategoryId]);

    React.useEffect(() => {
        if (selectedCategoryId && selectedCategoryId !== "all") {
            const el = document.getElementById(`category-${selectedCategoryId}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [selectedCategoryId]);

    const handleQuantityChange = (item: any, delta: number) => {
        if (delta > 0 && ((item.variants && item.variants.length > 0) || (item.modifierGroups && item.modifierGroups.length > 0))) {
            setSelectedConfigItem(item);
            setConfigModalOpen(true);
            return;
        }

        setSelectedItems(prev => {
            if (delta > 0) {
                const existingIndex = prev.findIndex(i => i.menuItemId === item.id && !i.variantId && (!i.modifiers || i.modifiers.length === 0));
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex].quantity += delta;
                    return updated;
                }
                return [...prev, { id: Date.now().toString(), menuItemId: item.id, name: item.name, price: Number(item.price || 0), quantity: delta }];
            } else {
                // Determine which one to remove (prefer simple ones, then last added)
                const indices = prev.map((val, idx) => val.menuItemId === item.id ? idx : -1).filter(idx => idx !== -1);
                if (indices.length > 0) {
                    const targetIndex = indices[indices.length - 1]; // Remove last one added
                    const updated = [...prev];
                    updated[targetIndex].quantity += delta;
                    if (updated[targetIndex].quantity <= 0) {
                        updated.splice(targetIndex, 1);
                    }
                    return updated;
                }
            }
            return prev;
        });
    };

    const handleSaveConfig = (config: ConfiguredOrderItem) => {
        setSelectedItems(prev => {
            const existingIndex = prev.findIndex(i =>
                i.menuItemId === config.menuItemId &&
                i.variantId === config.variantId &&
                JSON.stringify(i.modifiers || []) === JSON.stringify(config.modifiers || []) &&
                i.notes === config.notes
            );

            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex].quantity += config.quantity;
                return updated;
            }
            return [...prev, { ...config, id: Date.now().toString() + Math.random().toString(36).substring(7) }];
        });
        setConfigModalOpen(false);
        setSelectedConfigItem(null);
    };

    const handleRemoveCartItem = (id: string) => {
        setSelectedItems(prev => prev.filter(i => i.id !== id));
    };

    const handleUpdateCartQuantity = (id: string, delta: number) => {
        setSelectedItems(prev => prev.map(i => {
            if (i.id === id) {
                return { ...i, quantity: Math.max(0, i.quantity + delta) };
            }
            return i;
        }).filter(i => i.quantity > 0));
    };

    const getQuantity = (menuItemId: string) => {
        const item = selectedItems.find(i => i.menuItemId === menuItemId);
        return item ? item.quantity : 0;
    };

    const handleSave = () => {
        if (!orderId || selectedItems.length === 0) return;
        addItemsToOrder(
            { orderId, data: { items: selectedItems } },
            {
                onSuccess: () => {
                    setSelectedItems([]);
                    setSearch("");
                    onClose();
                }
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Add Items to Order</DialogTitle>
                    <DialogDescription>
                        Select items to add to order <span className="font-mono text-xs">{orderId?.substring(0, 8)}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search menu items..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        {businessAllCategories && businessAllCategories.length > 0 && (
                            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {businessAllCategories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <ScrollArea className="flex-1 pr-4 -mr-4 h-[400px]">
                        {selectedItems.length > 0 && (
                            <div className="mb-6 space-y-2">
                                <h3 className="text-xs font-semibold uppercase text-muted-foreground">Selected Items</h3>
                                <div className="space-y-2">
                                    {selectedItems.map(item => (
                                        <div key={item.id} className="p-3 bg-muted/20 rounded-lg border flex items-center justify-between group">
                                            <div className="flex flex-col flex-1 truncate pr-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium truncate">{item.name}</span>
                                                    {item.variantId && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Variant Selected</span>}
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
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-background border rounded-md p-1 shadow-sm">
                                                <Button size="icon" variant="ghost" className="h-6 w-6 rounded-sm hover:bg-muted" onClick={() => handleUpdateCartQuantity(item.id, -1)}>
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="text-sm font-medium w-5 text-center leading-none">{item.quantity}</span>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 rounded-sm hover:bg-muted" onClick={() => handleUpdateCartQuantity(item.id, 1)}>
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {filteredCategories.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No items found.</p>
                        ) : (
                            <div className="space-y-4">
                                {filteredCategories.map(category => (
                                    <div key={category.id} id={`category-${category.id}`} className="space-y-2">
                                        <h3 className="font-semibold text-sm text-gray-700 sticky top-0 bg-background/95 backdrop-blur py-1 z-10 border-b">{category.name}</h3>
                                        <div className="space-y-2">
                                            {category.items.map((item: any) => {
                                                const quantity = getQuantity(item.id);
                                                return (
                                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                                        <div className="flex flex-col flex-1">
                                                            <span className="font-medium text-sm">{item.name}</span>
                                                            <span className="text-xs text-muted-foreground">${Number(item.price || 0).toFixed(2)}</span>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            {quantity > 0 ? (
                                                                <>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-8 w-8 rounded-full"
                                                                        onClick={() => handleQuantityChange(item, -1)}
                                                                    >
                                                                        <Minus className="h-3 w-3" />
                                                                    </Button>
                                                                    <span className="w-4 text-center text-sm font-medium">{quantity}</span>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-8 w-8 rounded-full"
                                                                        onClick={() => handleQuantityChange(item, 1)}
                                                                    >
                                                                        <Plus className="h-3 w-3" />
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className="h-8 rounded-full px-4"
                                                                    onClick={() => handleQuantityChange(item, 1)}
                                                                >
                                                                    Add
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <DialogFooter className="pt-2 border-t mt-auto">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleSave}
                        disabled={selectedItems.length === 0 || isAddingItems}
                    >
                        {isAddingItems ? "Adding..." : `Add ${selectedItems.length} items`}
                    </Button>
                </DialogFooter>
            </DialogContent>
            <OrderItemConfigModal
                open={configModalOpen}
                onClose={() => {
                    setConfigModalOpen(false);
                    setSelectedConfigItem(null);
                }}
                item={selectedConfigItem}
                onSave={handleSaveConfig}
            />
        </Dialog>
    );
}
