import React from "react";
import { ImageOff } from "lucide-react";

export interface GalleryMasonryProps {
    title?: string;
    columns?: number;
    images?: { url: string }[];
}

const GalleryMasonry: React.FC<GalleryMasonryProps> = ({ title = "Gallery", columns = 3, images = [] }) => {
    const media = Array.isArray(images) ? images : [];
    const colClass = columns >= 4 ? "columns-2 sm:columns-4" : columns === 3 ? "columns-2 sm:columns-3" : "columns-1 sm:columns-2";

    return (
        <section className="space-y-6">
            {title && <h2 className="text-3xl font-bold tracking-tight text-center">{title}</h2>}
            {media.length > 0 ? (
                <div className={`${colClass} gap-4 space-y-4`}>
                    {media.map((m, i) => (
                        <div key={i} className="break-inside-avoid overflow-hidden rounded-2xl bg-muted">
                            <img src={m.url} alt={`${title} ${i + 1}`} className="w-full h-auto object-cover" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground border border-dashed border-border rounded-[2rem]">
                    <ImageOff size={32} className="opacity-40" />
                    <p>No photos uploaded yet.</p>
                </div>
            )}
        </section>
    );
};

export default GalleryMasonry;
