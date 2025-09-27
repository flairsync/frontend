
import { useState, ChangeEvent } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";

import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

interface GalleryUploaderProps {
    initialGallery?: string[];
    loading?: boolean;
    onSave: (files: File[]) => void;
}

interface SortableItemProps {
    id: string;
    url: string;
    onRemove: () => void;
}

function SortableItem({ id, url, onRemove }: SortableItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="flex items-center justify-between border p-2 rounded"
        >
            <img src={url} alt="Gallery" className="w-16 h-16 object-cover rounded" />
            <span className="truncate">{url}</span>
            <Button variant="destructive" size="sm" onClick={onRemove}>
                Remove
            </Button>
        </div>
    );
}

export default function BusinessBrandingGalleryUpload({
    initialGallery = [],
    loading = false,
    onSave,
}: GalleryUploaderProps) {
    const [gallery, setGallery] = useState<string[]>(initialGallery);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const sensors = useSensors(useSensor(PointerSensor));

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        setSelectedFiles((prev) => [...prev, ...files]);
        const urls = files.map((file) => URL.createObjectURL(file));
        setGallery((prev) => [...prev, ...urls]);
    };

    const handleRemove = (index: number) => {
        setGallery((prev) => prev.filter((_, i) => i !== index));
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (selectedFiles.length > 0) {
            onSave(selectedFiles);
            setSelectedFiles([]);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = gallery.findIndex((url) => url === active.id);
            const newIndex = gallery.findIndex((url) => url === over.id);
            setGallery((items) => arrayMove(items, oldIndex, newIndex));
            setSelectedFiles((files) => arrayMove(files, oldIndex, newIndex));
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardDescription>
                    Upload and organize your restaurant gallery images.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <Input type="file" accept="image/*" multiple onChange={handleFileChange} />
                {gallery.length === 0 && <p>No images added yet.</p>}
                {gallery.length > 0 && (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={gallery} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {gallery.map((url) => (
                                    <SortableItem
                                        key={url}
                                        id={url}
                                        url={url}
                                        onRemove={() => handleRemove(gallery.indexOf(url))}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
                <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={loading || selectedFiles.length === 0}>
                        {loading ? "Saving..." : "Save Gallery"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
