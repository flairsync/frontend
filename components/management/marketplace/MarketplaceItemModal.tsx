import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Upload, Loader2 } from 'lucide-react';
import { MarketplaceItem } from '@/models/MarketplaceItem';
import { useMarketplaceMutations } from '@/features/marketplace/useMarketplace';

interface Props {
    businessId: string;
    item?: MarketplaceItem | null;
    open: boolean;
    onClose: () => void;
}

interface FormState {
    name: string;
    description: string;
    price: string;
    stock: string;
    isActive: boolean;
    discountEnabled: boolean;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: string;
    discountExpiresAt: string;
}

export function MarketplaceItemModal({ businessId, item, open, onClose }: Props) {
    const { t } = useTranslation('management');
    const isEdit = !!item;
    const { createItem, updateItem, uploadImages, removeImage } = useMarketplaceMutations(businessId);

    const [form, setForm] = useState<FormState>({
        name: '',
        description: '',
        price: '',
        stock: '0',
        isActive: true,
        discountEnabled: false,
        discountType: 'PERCENTAGE',
        discountValue: '',
        discountExpiresAt: '',
    });
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [removingUrl, setRemovingUrl] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            if (item) {
                setForm({
                    name: item.name,
                    description: item.description ?? '',
                    price: String(item.price),
                    stock: String(item.stock),
                    isActive: item.isActive,
                    discountEnabled: !!item.discountType,
                    discountType: item.discountType ?? 'PERCENTAGE',
                    discountValue: item.discountValue != null ? String(item.discountValue) : '',
                    discountExpiresAt: item.discountExpiresAt ? item.discountExpiresAt.slice(0, 10) : '',
                });
            } else {
                setForm({
                    name: '', description: '', price: '', stock: '0', isActive: true,
                    discountEnabled: false, discountType: 'PERCENTAGE', discountValue: '', discountExpiresAt: '',
                });
            }
            setPendingFiles([]);
        }
    }, [open, item]);

    const existingImages = item?.images ?? [];
    const totalImageCount = existingImages.length + pendingFiles.length;
    const canAddMore = totalImageCount < 5;

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        const allowed = 5 - totalImageCount;
        setPendingFiles((prev) => [...prev, ...files.slice(0, allowed)]);
        e.target.value = '';
    }

    function removePending(idx: number) {
        setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
    }

    async function handleRemoveExisting(url: string) {
        if (!item) return;
        setRemovingUrl(url);
        await removeImage.mutateAsync({ id: item.id, imageUrl: url });
        setRemovingUrl(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const price = parseFloat(form.price);
        const stock = parseInt(form.stock) || 0;
        if (!form.name.trim() || isNaN(price) || price < 0) return;

        const discountValue = form.discountEnabled ? parseFloat(form.discountValue) : NaN;
        if (form.discountEnabled && (isNaN(discountValue) || discountValue < 0)) return;

        if (isEdit && item) {
            await updateItem.mutateAsync({
                id: item.id,
                data: {
                    name: form.name.trim(),
                    description: form.description.trim() || undefined,
                    price,
                    stock,
                    isActive: form.isActive,
                    discountType: form.discountEnabled ? form.discountType : null,
                    discountValue: form.discountEnabled ? discountValue : null,
                    discountExpiresAt: form.discountEnabled && form.discountExpiresAt ? form.discountExpiresAt : null,
                },
            });
            if (pendingFiles.length > 0) {
                const fd = new FormData();
                pendingFiles.forEach((f) => fd.append('images', f));
                await uploadImages.mutateAsync({ id: item.id, formData: fd });
            }
        } else {
            const fd = new FormData();
            fd.append('name', form.name.trim());
            if (form.description.trim()) fd.append('description', form.description.trim());
            fd.append('price', String(price));
            fd.append('stock', String(stock));
            fd.append('isActive', String(form.isActive));
            if (form.discountEnabled) {
                fd.append('discountType', form.discountType);
                fd.append('discountValue', String(discountValue));
                if (form.discountExpiresAt) fd.append('discountExpiresAt', form.discountExpiresAt);
            }
            pendingFiles.forEach((f) => fd.append('images', f));
            await createItem.mutateAsync(fd);
        }

        onClose();
    }

    const isSaving = createItem.isPending || updateItem.isPending || uploadImages.isPending;

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? t('marketplace_management.item_modal.edit_title') : t('marketplace_management.item_modal.new_title')}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label>{t('marketplace_management.item_modal.name')} *</Label>
                        <Input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder={t('marketplace_management.item_modal.name_placeholder')}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label>{t('marketplace_management.item_modal.description')}</Label>
                        <Textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder={t('marketplace_management.item_modal.description_placeholder')}
                            className="resize-none min-h-[80px]"
                        />
                    </div>

                    {/* Price */}
                    <div className="space-y-1.5">
                        <Label>{t('marketplace_management.item_modal.price')} *</Label>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-end">
                        <div className="space-y-1.5">
                            <Label>{t('marketplace_management.item_modal.stock')}</Label>
                            <Input
                                type="number"
                                min="0"
                                step="1"
                                value={form.stock}
                                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-2 pb-1">
                            <Switch
                                checked={form.isActive}
                                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                            />
                            <Label className="cursor-pointer">{form.isActive ? t('marketplace_management.active') : t('marketplace_management.inactive')}</Label>
                        </div>
                    </div>

                    {/* Discount */}
                    <div className="space-y-3 rounded-lg border border-white/10 p-3">
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={form.discountEnabled}
                                onCheckedChange={(v) => setForm({ ...form, discountEnabled: v })}
                            />
                            <Label className="cursor-pointer">{t('marketplace_management.item_modal.discount_this_item')}</Label>
                        </div>

                        {form.discountEnabled && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label>{t('marketplace_management.item_modal.discount_type')}</Label>
                                    <Select
                                        value={form.discountType}
                                        onValueChange={(v) => setForm({ ...form, discountType: v as 'PERCENTAGE' | 'FIXED' })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PERCENTAGE">{t('marketplace_management.item_modal.percent_off')}</SelectItem>
                                            <SelectItem value="FIXED">{t('marketplace_management.item_modal.amount_off')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>{form.discountType === 'PERCENTAGE' ? t('marketplace_management.item_modal.percent_off') : t('marketplace_management.item_modal.amount_off')}</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max={form.discountType === 'PERCENTAGE' ? 100 : undefined}
                                        step="0.01"
                                        value={form.discountValue}
                                        onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                                        placeholder={form.discountType === 'PERCENTAGE' ? '10' : '5.00'}
                                    />
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <Label>{t('marketplace_management.item_modal.expires_optional')}</Label>
                                    <Input
                                        type="date"
                                        value={form.discountExpiresAt}
                                        onChange={(e) => setForm({ ...form, discountExpiresAt: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Images */}
                    <div className="space-y-2">
                        <Label>{t('marketplace_management.item_modal.images_count', { count: totalImageCount, max: 5 })}</Label>

                        {/* Existing images (edit mode) */}
                        {existingImages.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {existingImages.map((url) => (
                                    <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 group">
                                        <img src={url} alt={t('marketplace_management.item_modal.name')} loading="lazy" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            disabled={removingUrl === url}
                                            onClick={() => handleRemoveExisting(url)}
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            {removingUrl === url
                                                ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                                                : <X className="w-4 h-4 text-white" />
                                            }
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pending files */}
                        {pendingFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {pendingFiles.map((f, idx) => (
                                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-primary/30 group">
                                        <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removePending(idx)}
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {canAddMore && (
                            <>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileRef.current?.click()}
                                    className="gap-2"
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    {t('marketplace_management.item_modal.add_images')}
                                </Button>
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
                            {t('marketplace_management.incoming_orders.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSaving || !form.name.trim() || !form.price}>
                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEdit ? t('marketplace_management.item_modal.save_changes') : t('marketplace_management.create_item')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
