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
        <section className="space-y-8">
            {title && <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center">{title}</h2>}
            {media.length > 0 ? (
                <div className={`${colClass} gap-4 space-y-4`}>
                    {media.map((m, i) => (
                        <div
                            key={i}
                            className="group break-inside-avoid overflow-hidden rounded-2xl bg-muted shadow-sm hover:shadow-xl transition-shadow duration-300"
                        >
                            <img
                                src={m.url}
                                alt={`${title} ${i + 1}`}
                                loading="lazy"
                                className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                            />
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

export default GalleryMasonry;
