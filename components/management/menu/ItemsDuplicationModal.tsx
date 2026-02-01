import { useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import { Card } from "@/components/ui/card";
import { BusinessMenuItem } from "@/models/business/menu/BusinessMenuItem";
import { ImageIcon } from "lucide-react"; // icon for media toggle

type SelectedItemWithOptions = BusinessMenuItem & {
    useMedia: boolean;
};

type ItemsDuplicationModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    items: BusinessMenuItem[];
    onConfirm: (items: {
        id: string,
        useMedia: boolean
    }[]) => void;
};

export function ItemsDuplicationModal({
    open,
    onOpenChange,
    items,
    onConfirm,
}: ItemsDuplicationModalProps) {
    const [selectedItems, setSelectedItems] = useState<SelectedItemWithOptions[]>([]);
    const [activeItem, setActiveItem] = useState<SelectedItemWithOptions | null>(null);

    const availableItems = useMemo(
        () =>
            items.filter((item) => !selectedItems.some((i) => i.id === item.id)),
        [items, selectedItems]
    );

    const addItem = (item: BusinessMenuItem) => {
        const newItem: SelectedItemWithOptions = { ...item, useMedia: true };
        setSelectedItems((prev) => [...prev, newItem]);
        setActiveItem(newItem);
    };

    const removeItem = (id: string) => {
        setSelectedItems((prev) => prev.filter((i) => i.id !== id));
        if (activeItem?.id === id) setActiveItem(null);
    };

    const toggleUseMedia = (id: string) => {
        setSelectedItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, useMedia: !item.useMedia } : item
            )
        );
        if (activeItem?.id === id) {
            setActiveItem((prev) => prev && { ...prev, useMedia: !prev.useMedia });
        }
    };

    const handleConfirm = () => {
        onConfirm(selectedItems.map(val => {
            return {
                id: val.id,
                useMedia: val.useMedia
            }
        }));
        setSelectedItems([]);
        setActiveItem(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle>Duplicate items into category</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-6 h-[600px] md:h-[420px]">
                    {/* LEFT SIDE */}
                    <div className="flex flex-col gap-4 h-[300px] md:h-full">
                        <Command className="border rounded-lg h-1/2 md:h-auto flex-1 flex flex-col min-h-0">
                            <CommandInput placeholder="Search items..." />
                            <CommandEmpty>No items found.</CommandEmpty>
                            <CommandGroup className="flex-1 overflow-auto">
                                <div className="h-full">
                                    {availableItems.map((item) => (
                                        <CommandItem
                                            key={item.id}
                                            value={item.name}
                                            onSelect={() => addItem(item)}
                                        >
                                            {item.name}
                                        </CommandItem>
                                    ))}
                                </div>
                            </CommandGroup>
                        </Command>

                        <div className="flex-1 border rounded-lg p-2 h-1/2 md:h-auto overflow-hidden">
                            <ScrollArea className="h-full">
                                <div className="space-y-2">
                                    {selectedItems.map((item) => (
                                        <Card
                                            key={item.id}
                                            onClick={() => setActiveItem(item)}
                                            className={`p-3 cursor-pointer flex justify-between items-center ${activeItem?.id === item.id
                                                ? "border-primary"
                                                : ""
                                                }`}
                                        >
                                            <span className="font-medium">{item.name}</span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeItem(item.id);
                                                }}
                                            >
                                                ✕
                                            </Button>
                                        </Card>
                                    ))}
                                    {selectedItems.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-6">
                                            Selected items will appear here
                                        </p>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="border rounded-lg p-4 flex flex-col justify-between h-[200px] md:h-full overflow-y-auto">
                        {activeItem ? (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        {activeItem.name}
                                    </h3>
                                    <div className="text-sm text-muted-foreground">
                                        {activeItem.description || "No description"}
                                    </div>
                                    <div className="text-base font-medium">
                                        Price: {activeItem.price}
                                    </div>
                                </div>

                                {/* Media toggle */}
                                <div
                                    className="flex items-center gap-2 cursor-pointer select-none"
                                    onClick={() => toggleUseMedia(activeItem.id)}
                                >
                                    <div
                                        className={`relative w-12 h-6 transition-all duration-300 rounded-full ${activeItem.useMedia
                                            ? "bg-green-500"
                                            : "bg-gray-300"
                                            }`}
                                    >
                                        <div
                                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${activeItem.useMedia ? "translate-x-6" : ""
                                                }`}
                                        />
                                    </div>
                                    <ImageIcon
                                        className={`w-5 h-5 transition-transform ${activeItem.useMedia ? "rotate-12 text-green-600" : "text-gray-400"
                                            }`}
                                    />
                                    <span className="font-medium text-sm">
                                        {activeItem.useMedia
                                            ? "Reuse media from original item"
                                            : "No media"}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                                Select an item to see its details
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        disabled={selectedItems.length === 0}
                        onClick={handleConfirm}
                    >
                        Duplicate {selectedItems.length} item(s)
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
