import React from "react";
import { ImageOff } from "lucide-react";

export interface GalleryProps {
    title?: string;
    columns?: number;
    images?: { url: string }[];
}

const Gallery: React.FC<GalleryProps> = ({ title = "Gallery", columns = 3, images = [] }) => {
    const media = Array.isArray(images) ? images : [];

    return (
        <section className="space-y-6">
            {title && <h2 className="text-3xl font-bold tracking-tight text-center">{title}</h2>}
            {media.length > 0 ? (
                <div
                    className="grid gap-4"
                    style={{ gridTemplateColumns: `repeat(${Math.min(Math.max(columns, 1), 4)}, minmax(0, 1fr))` }}
                >
                    {media.map((m, i) => (
                        <div key={i} className="aspect-square overflow-hidden rounded-2xl bg-muted">
                            <img src={m.url} alt={`${title} ${i + 1}`} className="w-full h-full object-cover" />
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

export default Gallery;
