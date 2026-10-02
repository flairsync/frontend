import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Minus } from "lucide-react";
import type { MenuItem, ModifierGroup } from "@/features/pos/types";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";

export interface ConfiguredCartItem {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
    variantId?: string;
    variantName?: string;
    modifiers: { modifierItemId: string; name: string; price: number }[];
    modifierNames: string[];
}

interface ItemConfigModalProps {
    open: boolean;
    onClose: () => void;
    item: MenuItem | null;
    onConfirm: (config: ConfiguredCartItem) => void;
    currency: string;
}

type SelectedModifiers = Record<string, { id: string; name: string; price: number }[]>;

export function ItemConfigModal({ open, onClose, item, onConfirm, currency }: ItemConfigModalProps) {
    const { t } = useTranslation("pos");
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState("");
    const [selectedVariantId, setSelectedVariantId] = useState<string>("none");
    const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifiers>({});

    useEffect(() => {
        if (open) {
            setQuantity(1);
            setNotes("");
            setSelectedVariantId("none");
            setSelectedModifiers({});
        }
    }, [open, item]);

    if (!item) return null;

    const unsatisfiedGroups = item.modifierGroups.filter(
        (group) => group.minSelections > 0 && (selectedModifiers[group.id]?.length ?? 0) < group.minSelections,
    );

    const handleModifierToggle = (group: ModifierGroup, modifierId: string, name: string, price: number, checked: boolean) => {
        setSelectedModifiers((prev) => {
            const current = prev[group.id] || [];
            if (group.selectionMode === "single") {
                return { ...prev, [group.id]: checked ? [{ id: modifierId, name, price }] : [] };
            }
            if (checked) {
                if (group.maxSelections > 0 && current.length >= group.maxSelections) return prev;
                return { ...prev, [group.id]: [...current, { id: modifierId, name, price }] };
            }
            return { ...prev, [group.id]: current.filter((m) => m.id !== modifierId) };
        });
    };

    const selectedVariant = selectedVariantId !== "none" ? item.variants.find((v) => v.id === selectedVariantId) : undefined;
    const basePrice = selectedVariant ? selectedVariant.price : item.basePrice;
    const modifiersTotal = Object.values(selectedModifiers).flat().reduce((sum, m) => sum + m.price, 0);
    const total = (basePrice + modifiersTotal) * quantity;

    const handleConfirm = () => {
        if (unsatisfiedGroups.length > 0) return;

        const flatModifiers = Object.values(selectedModifiers).flat().map((m) => ({
            modifierItemId: m.id,
            name: m.name,
            price: m.price,
        }));

        onConfirm({
            menuItemId: item.id,
            name: item.name,
            price: basePrice,
            quantity,
            notes: notes.trim() || undefined,
            variantId: selectedVariant?.id,
            variantName: selectedVariant?.name,
            modifiers: flatModifiers,
            modifierNames: flatModifiers.map((m) => m.name),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] p-0 flex flex-col overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle className="text-xl font-black uppercase tracking-tight">{item.name}</DialogTitle>
                    <DialogDescription className="line-clamp-2">
                        {item.description || t("item_config_modal.default_description")}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">
                        {item.variants.length > 0 && (
                            <div className="space-y-3">
                                <Label className="text-sm font-black uppercase tracking-tight">
                                    {t("item_config_modal.choose_variant")}
                                </Label>
                                <RadioGroup value={selectedVariantId} onValueChange={setSelectedVariantId} className="space-y-2">
                                    <div
                                        className="flex items-center justify-between border p-3 rounded-xl hover:bg-muted/50 cursor-pointer"
                                        onClick={() => setSelectedVariantId("none")}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="none" id="variant-none" />
                                            <Label htmlFor="variant-none" className="cursor-pointer font-medium">
                                                {t("item_config_modal.base_item")}
                                            </Label>
                                        </div>
                                        <span className="text-sm font-bold">{formatCurrency(item.basePrice, currency)}</span>
                                    </div>
                                    {item.variants.map((variant) => (
                                        <div
                                            key={variant.id}
                                            className="flex items-center justify-between border p-3 rounded-xl hover:bg-muted/50 cursor-pointer"
                                            onClick={() => setSelectedVariantId(variant.id)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <RadioGroupItem value={variant.id} id={`variant-${variant.id}`} />
                                                <Label htmlFor={`variant-${variant.id}`} className="cursor-pointer font-medium">
                                                    {variant.name}
                                                </Label>
                                            </div>
                                            <span className="text-sm font-bold">{formatCurrency(variant.price, currency)}</span>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        )}

                        {item.modifierGroups.map((group) => {
                            const selectedCount = selectedModifiers[group.id]?.length ?? 0;
                            const isRequired = group.minSelections > 0;
                            const isUnsatisfied = isRequired && selectedCount < group.minSelections;

                            return (
                                <div key={group.id} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-black uppercase tracking-tight">
                                            {group.name}
                                            <span className={cn("ml-1.5 font-bold normal-case", isRequired ? "text-destructive" : "text-muted-foreground")}>
                                                {t(isRequired ? "item_config_modal.required" : "item_config_modal.optional")}
                                            </span>
                                        </Label>
                                        {isUnsatisfied && (
                                            <span className="text-xs text-destructive font-bold">
                                                {t("item_config_modal.min_selections_hint", { count: group.minSelections })}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        {group.selectionMode === "single" ? (
                                            <RadioGroup
                                                value={selectedModifiers[group.id]?.[0]?.id ?? "none"}
                                                onValueChange={(val) => {
                                                    if (val === "none") {
                                                        setSelectedModifiers((prev) => ({ ...prev, [group.id]: [] }));
                                                    } else {
                                                        const mod = group.items.find((m) => m.id === val);
                                                        if (mod) handleModifierToggle(group, mod.id, mod.name, mod.price, true);
                                                    }
                                                }}
                                                className="space-y-2"
                                            >
                                                {!isRequired && (
                                                    <div
                                                        className="flex items-center justify-between border p-3 rounded-xl hover:bg-muted/50 cursor-pointer"
                                                        onClick={() => setSelectedModifiers((prev) => ({ ...prev, [group.id]: [] }))}
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <RadioGroupItem value="none" id={`mod-none-${group.id}`} />
                                                            <Label htmlFor={`mod-none-${group.id}`} className="cursor-pointer font-medium">
                                                                {t("item_config_modal.none")}
                                                            </Label>
                                                        </div>
                                                    </div>
                                                )}
                                                {group.items.map((mod) => {
                                                    const isSelected = selectedModifiers[group.id]?.some((m) => m.id === mod.id) ?? false;
                                                    return (
                                                        <div
                                                            key={mod.id}
                                                            className={cn(
                                                                "flex items-center justify-between border p-3 rounded-xl cursor-pointer transition-colors",
                                                                isSelected ? "bg-primary/5 border-primary/30" : "hover:bg-muted/50",
                                                            )}
                                                            onClick={() => handleModifierToggle(group, mod.id, mod.name, mod.price, true)}
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <RadioGroupItem value={mod.id} id={`mod-${mod.id}`} />
                                                                <Label htmlFor={`mod-${mod.id}`} className="cursor-pointer font-medium">
                                                                    {mod.name}
                                                                </Label>
                                                            </div>
                                                            {mod.price > 0 && (
                                                                <span className="text-sm font-bold text-muted-foreground">
                                                                    +{formatCurrency(mod.price, currency)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </RadioGroup>
                                        ) : (
                                            group.items.map((mod) => {
                                                const isSelected = selectedModifiers[group.id]?.some((m) => m.id === mod.id) ?? false;
                                                const isDisabled = !isSelected && group.maxSelections > 0 && selectedCount >= group.maxSelections;
                                                return (
                                                    <div
                                                        key={mod.id}
                                                        className={cn(
                                                            "flex items-center justify-between border p-3 rounded-xl transition-colors",
                                                            isSelected ? "bg-primary/5 border-primary/30" : "hover:bg-muted/50",
                                                            isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                                                        )}
                                                        onClick={() => !isDisabled && handleModifierToggle(group, mod.id, mod.name, mod.price, !isSelected)}
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <Checkbox
                                                                id={`mod-${mod.id}`}
                                                                checked={isSelected}
                                                                disabled={isDisabled}
                                                                onCheckedChange={(checked) => handleModifierToggle(group, mod.id, mod.name, mod.price, checked as boolean)}
                                                            />
                                                            <Label htmlFor={`mod-${mod.id}`} className={cn("cursor-pointer font-medium", isDisabled && "cursor-not-allowed")}>
                                                                {mod.name}
                                                            </Label>
                                                        </div>
                                                        {mod.price > 0 && (
                                                            <span className="text-sm font-bold text-muted-foreground">
                                                                +{formatCurrency(mod.price, currency)}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        <div className="space-y-4 pt-4 border-t">
                            <div className="space-y-2">
                                <Label className="text-sm font-black uppercase tracking-tight">{t("item_config_modal.quantity")}</Label>
                                <div className="flex items-center gap-4">
                                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}>
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="text-xl font-black w-8 text-center">{quantity}</span>
                                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" onClick={() => setQuantity((q) => q + 1)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-black uppercase tracking-tight">{t("item_config_modal.notes_label")}</Label>
                                <Textarea
                                    placeholder={t("item_config_modal.notes_placeholder")}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter
                    className="p-4 border-t bg-muted/10 flex items-center justify-between sm:justify-between flex-row"
                    style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
                >
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{t("item_config_modal.total")}</span>
                        <span className="text-xl font-black">{formatCurrency(total, currency)}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="h-12 font-bold" onClick={onClose}>
                            {t("item_config_modal.cancel")}
                        </Button>
                        <Button className="h-12 font-bold" onClick={handleConfirm} disabled={unsatisfiedGroups.length > 0}>
                            {t("item_config_modal.add_to_order")}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
