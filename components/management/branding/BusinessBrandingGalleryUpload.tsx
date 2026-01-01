
import { useState, ChangeEvent } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from 'uuid';

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
    horizontalListSortingStrategy,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { BusinessMedia } from "@/models/business/BusinessMedia";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { GalleryImage } from "@/components/shared/GalleryImage";
import { Blurhash } from "react-blurhash";

interface GalleryUploaderProps {
    businessMedia: BusinessMedia[],
    initialGallery?: string[];
    loading?: boolean;
    onSave: (files: File[]) => void;
}

type GallerySlot = {
    id: string;
    file?: File;
    url?: string;
    blurHash?: string;
    markedForDelete?: boolean;
};



export default function BusinessBrandingGalleryUpload({
    businessMedia,
    initialGallery = [],
    loading = false,
    onSave,
}: GalleryUploaderProps) {
    const MAX_IMAGES = 10;

    // Initialize 10 slots
    const [slots, setSlots] = useState<GallerySlot[]>(() => {
        const filled = businessMedia.map((img) => ({ ...img }));
        const emptyCount = MAX_IMAGES - filled.length;
        return [
            ...filled,
            ...Array.from({ length: emptyCount }, () => ({ id: uuidv4() })),
        ];
    });

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);


    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = slots.findIndex((s) => s.id === active.id);
        const newIndex = slots.findIndex((s) => s.id === over.id);
        setSlots((prev) => arrayMove(prev, oldIndex, newIndex));
    };

    const handleFileChange = (file: File, slotId: string) => {
        const url = URL.createObjectURL(file);
        setSlots((prev) =>
            prev.map((s) =>
                s.id === slotId
                    ? { ...s, file, url, markedForDelete: false }
                    : s
            )
        );
    };

    const handleRemove = (slotId: string) => {
        setSlots((prev) =>
            prev.map((s) =>
                s.id === slotId ? { ...s, file: undefined, url: undefined, markedForDelete: true } : s
            )
        );
    };

    const buildPayload = () => {
        const files = slots.filter((s) => s.file).map((s) => ({ id: s.id, file: s.file! }));
        const order = slots
            .filter((s) => s.url) // remove empty slots
            .map((s, index) => ({ id: s.id, order: index }));
        const deleteIds = slots.filter((s) => s.markedForDelete && !s.file && s.url).map((s) => s.id);

        return { files, order, delete: deleteIds };
    };




    return <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={slots.map((s) => s.id)} strategy={horizontalListSortingStrategy}>
            <div className="flex flex-wrap gap-3 justify-center">
                {slots.map((slot) => (
                    <SortableSlot
                        key={slot.id}
                        slot={slot}
                        onFileChange={handleFileChange}
                        onRemove={handleRemove}
                    />
                ))}
            </div>
        </SortableContext>
        <button className="mt-4 btn-primary" onClick={() => console.log(buildPayload())}>
            Save
        </button>
    </DndContext>


    return (
        <Card>
            <CardHeader>
                <CardDescription>
                    Upload and organize your restaurant gallery images.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {businessMedia?.length === 0 && <p>No images added yet.</p>}


                <PhotoProvider>
                    <div className="
                        flex
                        flex-wrap
                        justify-center
                        gap-3
                        max-w-full
                    ">

                        {Array.from({ length: MAX_IMAGES }).map((_, idx) => (
                            <div
                                key={`placeholder-${idx}`}
                                className="w-32 h-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400"
                            >
                                +
                            </div>
                        ))}
                        {businessMedia?.map((val) => (
                            <GalleryImage
                                key={val.id}
                                url={val.url}
                                blurHash={val.blurHash}
                            />
                        ))}
                    </div>
                </PhotoProvider>


                {/*  {gallery.length > 0 && (
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
                )} */}
                <div className="flex gap-2">
                    <Button disabled={loading || selectedFiles.length === 0}>
                        {loading ? "Saving..." : "Save Gallery"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}


function SortableSlot({
    slot,
    onFileChange,
    onRemove,
}: {
    slot: GallerySlot;
    onFileChange: (file: File, slotId: string) => void;
    onRemove: (slotId: string) => void;
}) {
    const { setNodeRef, attributes, listeners, transform, transition } = useSortable({ id: slot.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative w-32 h-32 border rounded overflow-hidden flex items-center justify-center cursor-grab"
        >
            {slot.url ? (
                <>
                    {slot.blurHash && !slot.file && (
                        <Blurhash
                            hash={slot.blurHash}
                            width="100%"
                            height="100%"
                            resolutionX={32}
                            resolutionY={32}
                            punch={1}
                            className="absolute inset-0"
                        />
                    )}
                    <img src={slot.url} className="w-full h-full object-cover" />
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(slot.id);
                        }}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-red-600"
                    >
                        🗑
                    </button>
                </>
            ) : (
                <label className=" flex flex-col items-center justify-center cursor-pointer text-gray-400">
                    <span className="text-2xl">+</span>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onFileChange(file, slot.id);
                        }}
                    />
                </label>
            )}
        </div>
    );
}
