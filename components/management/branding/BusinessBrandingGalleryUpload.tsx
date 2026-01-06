
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
    onSave: (files: GallerySaveType) => void;
}

type GallerySlot = {
    id: string;
    file?: File;
    url?: string;
    blurHash?: string;
    markedForDelete?: boolean;
};

type GallerySaveType = {
    files: File[];
    order: {
        id: string;
        order: number;
    }[];
    delete: string[];
}


export default function BusinessBrandingGalleryUpload({
    businessMedia,
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
                s.id === slotId
                    ? { ...s, markedForDelete: !s.markedForDelete }
                    : s
            )
        );
    };

    const buildPayload = () => {
        const files = slots.filter((s) => s.file).map((s) => {
            if (s.file) {
                const renamedFile = new File([s.file], s.id, { type: s.file.type });
                return renamedFile
            }
        }).filter(val => val != undefined);
        const order = slots
            .filter((s) => s.url) // remove empty slots
            .map((s, index) => ({ id: s.id, order: index }));
        const deleteIds = slots.filter((s) => s.markedForDelete && !s.file && s.url).map((s) => s.id);
        const payload = { files, order, delete: deleteIds };
        onSave(payload);
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
                        markedForDeleting={slot.markedForDelete || false}
                    />
                ))}
            </div>
        </SortableContext>
        <Button className="mt-4 btn-primary" onClick={() => {
            buildPayload()
        }}>
            Save
        </Button>
    </DndContext>

}


function SortableSlot({
    slot,
    onFileChange,
    onRemove,
    markedForDeleting
}: {
    slot: GallerySlot;
    onFileChange: (file: File, slotId: string) => void;
    onRemove: (slotId: string) => void;
    markedForDeleting: boolean
}) {
    const { setNodeRef, attributes, listeners, transform, transition } = useSortable({ id: slot.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative w-32 h-32 border rounded overflow-hidden flex items-center justify-center"
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

                    <img src={slot.url} className="w-full h-full object-cover pointer-events-none" />

                    {/* 🟦 DRAG HANDLE */}
                    <div
                        {...attributes}
                        {...listeners}
                        className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded cursor-grab"
                    >
                        Drag
                    </div>

                    {/* 🗑 DELETE BUTTON */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(slot.id);
                        }}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-red-600"
                    >
                        {slot.markedForDelete ? "↩️" : "🗑"}
                    </button>
                </>
            ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer text-gray-400">
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

            {slot.markedForDelete && (
                <div className="absolute inset-0 z-40 pointer-events-none">
                    {/* Dark layer */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Stripes */}
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(
                    45deg,
                    rgba(255,255,255,0.25),
                    rgba(255,255,255,0.25) 10px,
                    transparent 10px,
                    transparent 20px
                    )]" />

                    {/* Label */}
                    <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
                        Marked for deletion
                    </div>
                </div>
            )}
        </div>
    );
}
