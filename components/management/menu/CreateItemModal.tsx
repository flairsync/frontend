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
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor,
} from '@/components/ui/combobox';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { X, Info, Check, ChevronsUpDown } from 'lucide-react';
import { Allergy } from '@/models/shared/Allergy';
import { BusinessMenuItem } from '@/models/business/menu/BusinessMenuItem';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandInput,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import { useInventory } from '@/features/inventory/useInventory';
import { useInventoryUnits } from '@/features/inventory/useInventoryUnits';
interface ItemModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (data: {
        name: string;
        description: string;
        price: number;
        allergyIds: string[];
        images: File[];
        trackingMode?: 'NONE' | 'DIRECT_ITEM';
        inventoryItemId?: string;
        createInventoryItem?: boolean;
        inventoryUnit?: string;
        quantityPerSale?: number;
    }) => void;
    allergies: Allergy[];
    initialData?: BusinessMenuItem;
    availableItems?: BusinessMenuItem[]; // items to select from for copying
    businessId: string;
}

export const ItemModal: React.FC<ItemModalProps> = ({
    open,
    onClose,
    onConfirm,
    allergies,
    initialData,
    availableItems,
    businessId
}) => {
    const anchor = useComboboxAnchor();

    // State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
    const [images, setImages] = useState<File[]>([]);
    const [selectedCopyItemId, setSelectedCopyItemId] = useState<string | null>(null);

    // Tracking state
    const [trackingMode, setTrackingMode] = useState<'NONE' | 'DIRECT_ITEM'>('NONE');
    const [inventoryItemId, setInventoryItemId] = useState<string | null>(null);
    const [createInventoryItem, setCreateInventoryItem] = useState(false);
    const [inventoryUnitSystem, setInventoryUnitSystem] = useState<string>('metric');
    const [inventoryUnit, setInventoryUnit] = useState<string>('');
    const [quantityPerSale, setQuantityPerSale] = useState<string>('1');

    const {
        inventoryItems,
        fetchingInventoryItems,
    } = useInventory(businessId);

    const {
        inventoryUnits,
        fetchingInventoryUnits
    } = useInventoryUnits(inventoryUnitSystem);

    const { t } = useTranslation();

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
            setTrackingMode('NONE');
            setInventoryItemId(null);
            setCreateInventoryItem(false);
            setInventoryUnit('');
            setQuantityPerSale('1');
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
            trackingMode,
            inventoryItemId: inventoryItemId || undefined,
            createInventoryItem,
            inventoryUnit: createInventoryItem ? inventoryUnit : undefined,
            quantityPerSale: trackingMode === 'DIRECT_ITEM' ? parseFloat(quantityPerSale) : undefined,
        });

        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle>{initialData ? t('item_modal.edit_title') : t('item_modal.create_title')}</DialogTitle>


                </DialogHeader>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">
                        {t('item_modal.copy_label')}
                    </label>
                    <p className="text-xs text-muted-foreground">
                        {t('item_modal.copy_hint')}
                    </p>
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                            {selectedCopyItemId
                                ? availableItems?.find(i => i.id === selectedCopyItemId)?.name
                                : t('shared.actions.search')}
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-full p-0" align="start">
                        <Command>
                            <CommandInput placeholder="Search items..." />
                            <CommandEmpty>No items found.</CommandEmpty>

                            <CommandGroup>
                                {availableItems?.map((item) => (
                                    <CommandItem
                                        key={item.id}
                                        value={item.name}
                                        onSelect={() => {
                                            setSelectedCopyItemId(item.id);
                                            setName(item.name);
                                            setDescription(item.description || "");
                                            setPrice(item.price.toString());
                                            setSelectedAllergies(item.allergies?.map(a => a.id) || []);

                                            if (item.media) {
                                                setImages(item.media.map(m => new File([], m.url)));
                                            }
                                        }}
                                    >
                                        <Check
                                            className={`mr-2 h-4 w-4 ${selectedCopyItemId === item.id ? "opacity-100" : "opacity-0"
                                                }`}
                                        />
                                        {item.name} — {item.price}€
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>

                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="text-sm font-medium">{t('item_modal.name')}</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm font-medium">{t('item_modal.description')}</label>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="text-sm font-medium">{t('item_modal.price')}</label>
                        <Input
                            type="number"
                            min={0}
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>

                    {/* Allergies */}
                    <div>
                        <label className="text-sm font-medium">{t('item_modal.allergies')}</label>
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
                        <label className="text-sm font-medium">{t('item_modal.images')}</label>
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

                    {/* Tracking Section */}
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">{t('item_modal.tracking.label')}</label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">{t('item_modal.tracking.tooltip')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        <Select
                            value={trackingMode}
                            onValueChange={(val: any) => setTrackingMode(val)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{t('item_modal.tracking.none')}</span>
                                        <span className="text-xs text-muted-foreground">{t('item_modal.tracking.none_desc')}</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="DIRECT_ITEM">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{t('item_modal.tracking.direct')}</span>
                                        <span className="text-xs text-muted-foreground">{t('item_modal.tracking.direct_desc')}</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {trackingMode === 'DIRECT_ITEM' && (
                            <div className="space-y-4 pl-4 border-l-2 border-muted animate-in fade-in slide-in-from-left-2">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="create-new-inventory" className="text-sm font-medium cursor-pointer">
                                            {t('item_modal.tracking.create_new')}
                                        </Label>
                                        <Switch
                                            id="create-new-inventory"
                                            checked={createInventoryItem}
                                            onCheckedChange={setCreateInventoryItem}
                                        />
                                    </div>

                                    {!createInventoryItem ? (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{t('item_modal.tracking.link_existing')}</label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className="w-full justify-between"
                                                        disabled={fetchingInventoryItems}
                                                    >
                                                        {inventoryItemId
                                                            ? inventoryItems?.find((item: any) => item.id === inventoryItemId)?.name
                                                            : fetchingInventoryItems ? "Loading..." : t('shared.actions.search')}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0">
                                                    <Command>
                                                        <CommandInput placeholder={t('shared.actions.search')} />
                                                        <CommandEmpty>No items found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {inventoryItems?.map((item: any) => (
                                                                <CommandItem
                                                                    key={item.id}
                                                                    value={item.name}
                                                                    onSelect={() => {
                                                                        setInventoryItemId(item.id);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={`mr-2 h-4 w-4 ${inventoryItemId === item.id ? "opacity-100" : "opacity-0"
                                                                            }`}
                                                                    />
                                                                    {item.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 animate-in fade-in zoom-in-95">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Unit System</label>
                                                <Select value={inventoryUnitSystem} onValueChange={(val) => {
                                                    setInventoryUnitSystem(val);
                                                    setInventoryUnit(''); // Reset selected unit when system changes
                                                }}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-60 overflow-y-auto">
                                                        <SelectItem value="metric">Metric</SelectItem>
                                                        <SelectItem value="imperial">Imperial</SelectItem>
                                                        <SelectItem value="other">Other (Count/Pieces)</SelectItem>
                                                        <SelectItem value="all">All Systems</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">{t('item_modal.tracking.unit')}</label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className="w-full justify-between font-normal"
                                                            disabled={fetchingInventoryUnits}
                                                        >
                                                            {inventoryUnit
                                                                ? inventoryUnits?.find((u: any) => u.id.toString() === inventoryUnit)?.name
                                                                : fetchingInventoryUnits ? "Loading..." : t('item_modal.tracking.unit_placeholder')}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-full p-0">
                                                        <Command>
                                                            <CommandInput placeholder={t('shared.actions.search')} />
                                                            <CommandEmpty>No units found.</CommandEmpty>
                                                            <CommandList className="max-h-60 overflow-y-auto">
                                                                <CommandGroup>
                                                                    {inventoryUnits?.map((unit: any) => (
                                                                        <CommandItem
                                                                            key={unit.id}
                                                                            value={unit.name}
                                                                            onSelect={() => {
                                                                                setInventoryUnit(unit.id.toString());
                                                                            }}
                                                                        >
                                                                            <Check
                                                                                className={`mr-2 h-4 w-4 ${inventoryUnit === unit.id.toString() ? "opacity-100" : "opacity-0"
                                                                                    }`}
                                                                            />
                                                                            {unit.name} ({unit.code})
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t('item_modal.tracking.quantity_per_sale')}</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={quantityPerSale}
                                            onChange={(e) => setQuantityPerSale(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {t('item_modal.tracking.quantity_hint')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose}>
                        {t('shared.actions.cancel')}
                    </Button>
                    <Button onClick={handleConfirm}>
                        {initialData ? t('shared.actions.save') : t('shared.actions.add')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
};
