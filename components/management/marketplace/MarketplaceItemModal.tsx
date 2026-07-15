import React, { useState, useRef, useEffect } from 'react';
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
}

export function MarketplaceItemModal({ businessId, item, open, onClose }: Props) {
    const isEdit = !!item;
    const { createItem, updateItem, uploadImages, removeImage } = useMarketplaceMutations(businessId);

    const [form, setForm] = useState<FormState>({
        name: '',
        description: '',
        price: '',
        stock: '0',
        isActive: true,
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
                });
            } else {
                setForm({ name: '', description: '', price: '', stock: '0', isActive: true });
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

        if (isEdit && item) {
            await updateItem.mutateAsync({
                id: item.id,
                data: {
                    name: form.name.trim(),
                    description: form.description.trim() || undefined,
                    price,
                    stock,
                    isActive: form.isActive,
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
                    <DialogTitle>{isEdit ? 'Edit Item' : 'New Item'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label>Name *</Label>
                        <Input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Item name"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label>Description</Label>
                        <Textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Optional description..."
                            className="resize-none min-h-[80px]"
                        />
                    </div>

                    {/* Price */}
                    <div className="space-y-1.5">
                        <Label>Price *</Label>
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
                            <Label>Stock</Label>
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
                            <Label className="cursor-pointer">{form.isActive ? 'Active' : 'Inactive'}</Label>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="space-y-2">
                        <Label>Images ({totalImageCount}/5)</Label>

                        {/* Existing images (edit mode) */}
                        {existingImages.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {existingImages.map((url) => (
                                    <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 group">
                                        <img src={url} alt="item" loading="lazy" className="w-full h-full object-cover" />
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
                                    Add images
                                </Button>
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving || !form.name.trim() || !form.price}>
                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEdit ? 'Save changes' : 'Create item'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
