import React from "react";
import { ImageOff } from "lucide-react";

export interface GalleryGridProps {
    title?: string;
    columns?: number;
    images?: { url: string }[];
}

const GalleryGrid: React.FC<GalleryGridProps> = ({ title = "Gallery", columns = 3, images = [] }) => {
    const media = Array.isArray(images) ? images : [];
    const gridClass = columns >= 4 ? "grid-cols-2 sm:grid-cols-4" : columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2";

    return (
        <section className="space-y-8">
            {title && <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center">{title}</h2>}
            {media.length > 0 ? (
                <div className={`grid ${gridClass} gap-4`}>
                    {media.map((m, i) => (
                        <div
                            key={i}
                            className="group relative aspect-square overflow-hidden rounded-2xl bg-muted shadow-sm hover:shadow-xl transition-shadow duration-300"
                        >
                            <img
                                src={m.url}
                                alt={`${title} ${i + 1}`}
                                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 flex flex-col items-center gap-2 text-muted-foreground border border-dashed border-border rounded-[2rem]">
                    <ImageOff size={32} className="opacity-40" />
                    <p>No photos uploaded yet.</p>
                </div>
            )}
        </section>
    );
};

export default GalleryGrid;
