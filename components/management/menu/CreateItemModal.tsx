import React, { useState, useEffect } from 'react';
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
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor,
} from '@/components/ui/combobox';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { X } from 'lucide-react';
import { Allergy } from '@/models/shared/Allergy';
import { BusinessMenuItem } from '@/models/business/menu/BusinessMenuItem';

interface ItemModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (data: {
        name: string;
        description: string;
        price: number;
        allergyIds: string[];
        images: File[];
    }) => void;
    allergies: Allergy[];
    initialData?: BusinessMenuItem;
}

export const ItemModal: React.FC<ItemModalProps> = ({
    open,
    onClose,
    onConfirm,
    allergies,
    initialData,
}) => {
    const anchor = useComboboxAnchor();

    // State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
    const [images, setImages] = useState<File[]>([]);

    // Prefill state when editing
    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description || '');
            setPrice(initialData.price.toString());
            setSelectedAllergies(initialData.allergies?.map((a) => a.id) || []);
            // For images, we cannot prefill File objects, but you can display URLs
            if (initialData.media) {
                const fakeFiles = initialData.media.map((m) => {
                    const file = new File([], m.url); // empty File but with URL reference
                    return file;
                });
                setImages(fakeFiles);
            }
        } else {
            setName('');
            setDescription('');
            setPrice('');
            setSelectedAllergies([]);
            setImages([]);
        }
    }, [initialData, open]);

    // Handlers
    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        //@ts-ignore
        setImages((prev) => [...prev, ...Array.from(e.target.files)]);
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleConfirm = () => {
        if (!name.trim() || !price) return;

        const priceNumber = parseFloat(price);
        if (isNaN(priceNumber) || priceNumber < 0) return;

        onConfirm({
            name,
            description,
            price: priceNumber,
            allergyIds: selectedAllergies,
            images,
        });

        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Item' : 'Create New Item'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="text-sm font-medium">Price</label>
                        <Input
                            type="number"
                            min={0}
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>

                    {/* Allergies */}
                    <div>
                        <label className="text-sm font-medium">Allergies</label>
                        <Combobox
                            multiple
                            autoHighlight
                            items={allergies.map((a) => a.name)}
                            value={selectedAllergies.map(
                                (id) => allergies.find((a) => a.id === id)?.name || ''
                            )}
                            onValueChange={(values: string[]) => {
                                const ids = values
                                    .map((name) => allergies.find((a) => a.name === name)?.id)
                                    .filter(Boolean) as string[];
                                setSelectedAllergies(ids);
                            }}
                        >
                            <ComboboxChips ref={anchor} className="w-full">
                                <ComboboxValue>
                                    {(values) => (
                                        <>
                                            {values.map((v: any) => (
                                                <ComboboxChip key={v}>{v}</ComboboxChip>
                                            ))}
                                            <ComboboxChipsInput />
                                        </>
                                    )}
                                </ComboboxValue>
                            </ComboboxChips>

                            <ComboboxContent anchor={anchor}>
                                <ComboboxEmpty>No allergies found.</ComboboxEmpty>
                                <ComboboxList>
                                    {(item) => (
                                        <ComboboxItem key={item} value={item}>
                                            {item}
                                        </ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                    </div>

                    {/* Images */}
                    <div>
                        <label className="text-sm font-medium">Images</label>
                        <Input type="file" multiple accept="image/*" onChange={handleImagesChange} />
                    </div>

                    {/* Image carousel */}
                    {images.length > 0 && (
                        <PhotoProvider>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {images.map((file, index) => {
                                    // If the file has a real URL (from media), use it, else use object URL
                                    const url = file.size === 0 ? (file as any).name : URL.createObjectURL(file);
                                    return (
                                        <div key={index} className="relative shrink-0">
                                            <PhotoView src={url}>
                                                <img
                                                    src={url}
                                                    className="h-24 w-24 object-cover rounded-lg cursor-pointer border"
                                                />
                                            </PhotoView>

                                            <button
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full p-1"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </PhotoProvider>
                    )}
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm}>{initialData ? 'Save' : 'Create'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
