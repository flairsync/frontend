import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Minus } from "lucide-react";
import { BusinessMenuItem } from "@/models/business/menu/BusinessMenuItem";
import { MenuItemModifierGroup } from "@/models/business/menu/MenuItemModifierGroup";

export interface ConfiguredOrderItem {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
    variantId?: string;
    modifiers?: { modifierItemId: string; name: string; price: number }[];
}

interface OrderItemConfigModalProps {
    open: boolean;
    onClose: () => void;
    item: BusinessMenuItem | null;
    initialConfig?: Partial<ConfiguredOrderItem>;
    onSave: (config: ConfiguredOrderItem) => void;
}

export const OrderItemConfigModal: React.FC<OrderItemConfigModalProps> = ({ open, onClose, item, initialConfig, onSave }) => {
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState("");
    const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
    const [selectedModifiers, setSelectedModifiers] = useState<Record<string, { id: string, name: string, price: number }[]>>({});

    useEffect(() => {
        if (open && item) {
            setQuantity(initialConfig?.quantity || 1);
            setNotes(initialConfig?.notes || "");

            // Auto-select initial variant or none
            if (initialConfig?.variantId) {
                setSelectedVariantId(initialConfig.variantId);
            } else {
                setSelectedVariantId("none");
            }

            // Set initial modifiers
            if (initialConfig?.modifiers && item.modifierGroups) {
                const initialMods: Record<string, any[]> = {};
                item.modifierGroups.forEach(group => {
                    initialMods[group.id] = initialConfig.modifiers!.filter(m =>
                        group.items.some(gi => gi.id === m.modifierItemId)
                    ).map(m => ({ id: m.modifierItemId, name: m.name, price: m.price }));
                });
                setSelectedModifiers(initialMods);
            } else {
                setSelectedModifiers({});
            }
        }
    }, [open, item, initialConfig]);

    if (!item) return null;

    const handleModifierToggle = (group: MenuItemModifierGroup, modifier: any, checked: boolean) => {
        setSelectedModifiers(prev => {
            const currentGroupSelections = prev[group.id] || [];
            if (group.selectionMode === 'single') {
                return { ...prev, [group.id]: checked ? [{ id: modifier.id, name: modifier.name, price: modifier.price }] : [] };
            } else {
                if (checked) {
                    if (group.maxSelections > 0 && currentGroupSelections.length >= group.maxSelections) {
                        return prev; // Reached max
                    }
                    return { ...prev, [group.id]: [...currentGroupSelections, { id: modifier.id, name: modifier.name, price: modifier.price }] };
                } else {
                    return { ...prev, [group.id]: currentGroupSelections.filter(m => m.id !== modifier.id) };
                }
            }
        });
    };

    const calculateTotal = () => {
        let base = Number(item.price || 0);
        if (selectedVariantId && selectedVariantId !== "none" && item.variants) {
            const variant = item.variants.find(v => v.id === selectedVariantId);
            if (variant) base = Number(variant.price || 0);
        }

        let modsTotal = 0;
        Object.values(selectedModifiers).forEach(arr => {
            arr.forEach(m => modsTotal += Number(m.price || 0));
        });

        return (base + modsTotal) * quantity;
    };

    const handleSave = () => {
        const allSelectedMods = Object.values(selectedModifiers).flat().map(m => ({
            modifierItemId: m.id,
            name: m.name,
            price: m.price
        }));

        let basePrice = Number(item.price || 0);
        const finalVariantId = selectedVariantId === "none" ? undefined : selectedVariantId;

        if (finalVariantId && item.variants) {
            const variant = item.variants.find(v => v.id === finalVariantId);
            if (variant) basePrice = Number(variant.price || 0);
        }

        onSave({
            menuItemId: item.id,
            name: item.name,
            price: basePrice,
            quantity,
            notes,
            variantId: finalVariantId,
            modifiers: allSelectedMods
        });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle>Configure - {item.name}</DialogTitle>
                    <DialogDescription className="line-clamp-2">
                        {item.description || "Customize your item"}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">

                        {/* Variants */}
                        {item.variants && item.variants.length > 0 && (
                            <div className="space-y-3">
                                <Label className="text-base font-semibold">Choose Size/Variant <span className="text-muted-foreground ml-1 font-normal text-sm">(Optional)</span></Label>
                                <RadioGroup value={selectedVariantId} onValueChange={setSelectedVariantId} className="space-y-2">
                                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-md hover:bg-muted/50">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="none" id={`variant-none`} />
                                            <Label htmlFor={`variant-none`} className="cursor-pointer">None (Base Item)</Label>
                                        </div>
                                    </div>
                                    {item.variants.map(variant => (
                                        <div key={variant.id} className="flex items-center justify-between space-x-2 border p-3 rounded-md hover:bg-muted/50">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value={variant.id} id={`variant-${variant.id}`} />
                                                <Label htmlFor={`variant-${variant.id}`} className="cursor-pointer">{variant.name}</Label>
                                            </div>
                                            <span className="text-sm font-medium">${Number(variant.price).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        )}

                        {/* Modifiers */}
                        {item.modifierGroups?.sort((a, b) => a.order - b.order).map(group => {
                            const selectedCount = (selectedModifiers[group.id] || []).length;
                            const isSingle = group.selectionMode === 'single';

                            return (
                                <div key={group.id} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-base font-semibold">
                                            {group.name}
                                            <span className="text-muted-foreground ml-1 font-normal text-sm">(Optional)</span>
                                        </Label>
                                    </div>

                                    <div className="space-y-2">
                                        {isSingle ? (
                                            <RadioGroup
                                                value={(selectedModifiers[group.id] || []).length > 0 ? selectedModifiers[group.id][0].id : "none"}
                                                onValueChange={(val) => {
                                                    if (val === "none") {
                                                        setSelectedModifiers(prev => ({ ...prev, [group.id]: [] }));
                                                    } else {
                                                        const mod = group.items.find((m: any) => m.id === val);
                                                        if (mod) handleModifierToggle(group, mod, true);
                                                    }
                                                }}
                                                className="space-y-2"
                                            >
                                                <div className="flex items-center justify-between space-x-2 border p-3 rounded-md transition-colors hover:bg-muted/50">
                                                    <div className="flex items-center space-x-3">
                                                        <RadioGroupItem value="none" id={`mod-none-${group.id}`} />
                                                        <Label htmlFor={`mod-none-${group.id}`} className="cursor-pointer">None</Label>
                                                    </div>
                                                </div>
                                                {group.items.map(mod => {
                                                    const isSelected = (selectedModifiers[group.id] || []).some(m => m.id === mod.id);
                                                    return (
                                                        <div key={mod.id} className={`flex items-center justify-between space-x-2 border p-3 rounded-md transition-colors ${isSelected ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'}`}>
                                                            <div className="flex items-center space-x-3">
                                                                <RadioGroupItem value={mod.id} id={`mod-${mod.id}`} />
                                                                <Label htmlFor={`mod-${mod.id}`} className="cursor-pointer">
                                                                    {mod.name}
                                                                </Label>
                                                            </div>
                                                            {Number(mod.price) > 0 && (
                                                                <span className="text-sm font-medium text-muted-foreground">+${Number(mod.price).toFixed(2)}</span>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </RadioGroup>
                                        ) : (
                                            group.items.map(mod => {
                                                const isSelected = (selectedModifiers[group.id] || []).some(m => m.id === mod.id);
                                                const isDisabled = !isSelected && group.maxSelections > 0 && selectedCount >= group.maxSelections;

                                                return (
                                                    <div key={mod.id} className={`flex items-center justify-between space-x-2 border p-3 rounded-md transition-colors ${isSelected ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                        <div className="flex items-center space-x-3">
                                                            <Checkbox
                                                                id={`mod-${mod.id}`}
                                                                checked={isSelected}
                                                                disabled={isDisabled}
                                                                onCheckedChange={(checked) => handleModifierToggle(group, mod, checked as boolean)}
                                                            />
                                                            <Label htmlFor={`mod-${mod.id}`} className={`cursor-pointer ${isDisabled ? 'cursor-not-allowed' : ''}`}>
                                                                {mod.name}
                                                            </Label>
                                                        </div>
                                                        {Number(mod.price) > 0 && (
                                                            <span className="text-sm font-medium text-muted-foreground">+${Number(mod.price).toFixed(2)}</span>
                                                        )}
                                                    </div>
                                                )
                                            })
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                        {/* Quantity & Notes */}
                        <div className="space-y-4 pt-4 border-t">
                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setQuantity(quantity + 1)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                {quantity > 1 && item.modifierGroups && item.modifierGroups.length > 0 && (
                                    <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                                        Modifiers will apply to all {quantity} items. You can add items separately if you need different variations.
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Special Notes / Requests</Label>
                                <Textarea
                                    placeholder="e.g. No onions, extra spicy..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>

                    </div>
                </ScrollArea>

                <DialogFooter className="p-4 border-t bg-muted/10 flex items-center justify-between sm:justify-between flex-row">
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground font-medium">Total</span>
                        <span className="text-xl font-bold">${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSave}>
                            {initialConfig ? "Save Changes" : "Add to Order"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
