import React, { useState, useMemo } from 'react';
import { Minus, Plus, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { BusinessMenuItem } from '@/models/business/menu/BusinessMenuItem';
import { useDinerModeStore, CartItem } from '@/features/diner-mode/DinerModeStore';

interface DinerMenuItemSheetProps {
    item: BusinessMenuItem | null;
    onClose: () => void;
}

export default function DinerMenuItemSheet({ item, onClose }: DinerMenuItemSheetProps) {
    const { t } = useTranslation('diner');
    const { addToCart } = useDinerModeStore();

    const [quantity, setQuantity] = useState(1);
    const [selectedVariantId, setSelectedVariantId] = useState<string>('');
    const [selectedModifiers, setSelectedModifiers] = useState<Record<string, Set<string>>>({});
    const [notes, setNotes] = useState('');

    const hasVariants = (item?.variants?.length ?? 0) > 0;
    const hasModifiers = (item?.modifierGroups?.length ?? 0) > 0;

    const selectedVariant = useMemo(
        () => item?.variants?.find((v) => v.id === selectedVariantId) ?? null,
        [item, selectedVariantId]
    );

    const basePrice = selectedVariant ? selectedVariant.price : (item?.price ?? 0);
    const modifierTotal = useMemo(() => {
        let total = 0;
        Object.values(selectedModifiers).forEach((modSet) => {
            modSet.forEach((modId) => {
                item?.modifierGroups?.forEach((group) => {
                    const found = group.items.find((i) => i.id === modId);
                    if (found) total += found.price;
                });
            });
        });
        return total;
    }, [selectedModifiers, item]);

    const unitPrice = basePrice + modifierTotal;
    const lineTotal = unitPrice * quantity;

    const handleToggleModifier = (groupId: string, modId: string, mode: 'single' | 'multiple') => {
        setSelectedModifiers((prev) => {
            const groupSet = new Set(prev[groupId] ?? []);
            if (mode === 'single') {
                return { ...prev, [groupId]: new Set([modId]) };
            }
            if (groupSet.has(modId)) {
                groupSet.delete(modId);
            } else {
                groupSet.add(modId);
            }
            return { ...prev, [groupId]: groupSet };
        });
    };

    const handleAdd = () => {
        if (!item) return;

        const flatModifiers: CartItem['modifiers'] = [];
        Object.entries(selectedModifiers).forEach(([, modSet]) => {
            modSet.forEach((modId) => {
                item.modifierGroups?.forEach((group) => {
                    const found = group.items.find((i) => i.id === modId);
                    if (found) flatModifiers.push({ modifierItemId: found.id, name: found.name, price: found.price });
                });
            });
        });

        const cartItem: CartItem = {
            menuItemId: item.id,
            name: item.name,
            basePrice: item.price,
            quantity,
            variantId: selectedVariant?.id,
            variantName: selectedVariant?.name,
            modifiers: flatModifiers,
            notes,
            lineTotal,
        };

        addToCart(cartItem);
        onClose();

        setQuantity(1);
        setSelectedVariantId('');
        setSelectedModifiers({});
        setNotes('');
    };

    return (
        <Sheet open={!!item} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[90dvh] overflow-y-auto pb-safe">
                {item && (
                    <>
                        <SheetHeader className="text-left pb-2">
                            <SheetTitle className="text-xl">{item.name}</SheetTitle>
                            {item.description && (
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            )}
                            {item.allergies && item.allergies.length > 0 && (
                                <p className="text-xs text-amber-600 flex items-start gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                    <span>{t('menu_tab.contains_allergens')}: {item.allergies.map((a) => a.name).join(', ')}</span>
                                </p>
                            )}
                            {item.isBundle && item.bundleComponentDetails && item.bundleComponentDetails.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    {t('menu_tab.includes_label')}: {item.bundleComponentDetails.map((c) => `${c.name} ×${c.quantity}`).join(', ')}
                                </p>
                            )}
                            <p className="text-base font-semibold text-primary">
                                ${item.price.toFixed(2)}
                            </p>
                        </SheetHeader>

                        <div className="space-y-5 mt-4">
                            {hasVariants && (
                                <div>
                                    <p className="text-sm font-semibold mb-2">{t('menu_item_sheet.choose_variant')}</p>
                                    <RadioGroup
                                        value={selectedVariantId}
                                        onValueChange={setSelectedVariantId}
                                        className="space-y-2"
                                    >
                                        {item.variants!.map((v) => (
                                            <div key={v.id} className="flex items-center justify-between rounded-xl border px-3 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <RadioGroupItem value={v.id} id={`variant-${v.id}`} />
                                                    <Label htmlFor={`variant-${v.id}`} className="cursor-pointer font-normal">
                                                        {v.name}
                                                    </Label>
                                                </div>
                                                <span className="text-sm text-muted-foreground">${v.price.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            )}

                            {hasModifiers && item.modifierGroups!.map((group) => (
                                <div key={group.id}>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-semibold">{group.name}</p>
                                        <span className="text-xs text-muted-foreground capitalize">
                                            {group.selectionMode === 'single'
                                                ? t('menu_item_sheet.choose_one')
                                                : t('menu_item_sheet.choose_up_to', { count: group.maxSelections })}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {group.items.map((mod) => {
                                            const isSelected = selectedModifiers[group.id]?.has(mod.id) ?? false;
                                            return (
                                                <div
                                                    key={mod.id}
                                                    className="flex items-center justify-between rounded-xl border px-3 py-2.5"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {group.selectionMode === 'single' ? (
                                                            <RadioGroup
                                                                value={selectedModifiers[group.id] ? [...selectedModifiers[group.id]][0] ?? '' : ''}
                                                                onValueChange={(val) => handleToggleModifier(group.id, val, 'single')}
                                                            >
                                                                <RadioGroupItem value={mod.id} id={`mod-${mod.id}`} />
                                                            </RadioGroup>
                                                        ) : (
                                                            <Checkbox
                                                                id={`mod-${mod.id}`}
                                                                checked={isSelected}
                                                                onCheckedChange={() => handleToggleModifier(group.id, mod.id, 'multiple')}
                                                            />
                                                        )}
                                                        <Label htmlFor={`mod-${mod.id}`} className="cursor-pointer font-normal">
                                                            {mod.name}
                                                        </Label>
                                                    </div>
                                                    {mod.price > 0 && (
                                                        <span className="text-sm text-muted-foreground">+${mod.price.toFixed(2)}</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            <div>
                                <p className="text-sm font-semibold mb-2">{t('menu_item_sheet.special_instructions')}</p>
                                <Textarea
                                    placeholder={t('menu_item_sheet.special_instructions_placeholder')}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="rounded-xl resize-none text-sm"
                                    rows={2}
                                />
                            </div>
                        </div>

                        <Separator className="my-5" />

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 border rounded-full px-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full h-8 w-8"
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                >
                                    <Minus className="w-3 h-3" />
                                </Button>
                                <span className="text-sm font-semibold w-6 text-center">{quantity}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full h-8 w-8"
                                    onClick={() => setQuantity((q) => q + 1)}
                                >
                                    <Plus className="w-3 h-3" />
                                </Button>
                            </div>

                            <Button
                                className="flex-1 rounded-full font-semibold"
                                onClick={handleAdd}
                                disabled={hasVariants && !selectedVariantId}
                            >
                                {t('menu_item_sheet.add_to_order', { price: lineTotal.toFixed(2) })}
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
