import React, { useRef, useEffect, useState } from 'react';
import { ExplorePostData } from './data';
import { ExploreInteractions } from './ExploreInteractions';
import { MapPin } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

interface ExplorePostProps {
    post: ExplorePostData;
    isActive: boolean; // Tells if this post is currently in view
}

export const ExplorePost: React.FC<ExplorePostProps> = ({ post, isActive }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [emblaRef] = useEmblaCarousel({ loop: true });

    // Handle video playback
    useEffect(() => {
        if (post.type === 'video' && videoRef.current) {
            if (isActive) {
                videoRef.current.play().catch(e => console.error("Video play failed", e));
            } else {
                videoRef.current.pause();
                videoRef.current.currentTime = 0; // Reset video
            }
        }
    }, [isActive, post.type]);

    const renderMedia = () => {
        if (post.type === 'video') {
            return (
                <video
                    ref={videoRef}
                    src={post.mediaUrls[0]}
                    className="w-full h-full object-cover object-center"
                    loop
                    muted // Muted by default to allow auto-play safely
                    playsInline
                />
            );
        }

        if (post.type === 'image') {
            return (
                <img
                    src={post.mediaUrls[0]}
                    alt={post.title}
                    className="w-full h-full object-cover object-center"
                />
            );
        }

        if (post.type === 'carousel') {
            return (
                <div className="w-full h-full overflow-hidden" ref={emblaRef}>
                    <div className="flex h-full">
                        {post.mediaUrls.map((url, i) => (
                            <div className="relative flex-[0_0_100%] h-full" key={i}>
                                <img
                                    src={url}
                                    alt={`${post.title} ${i + 1}`}
                                    className="w-full h-full object-cover object-center block"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="relative w-full h-[calc(100vh-80px)] sm:h-[calc(100vh-100px)] snap-start snap-always bg-background flex items-center justify-center overflow-hidden shrink-0 group">

            {/* Media Background */}
            {renderMedia()}

            {/* Dark Gradient Overlay for better text readability */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

            {/* Interactions Overlay (Right side) */}
            <ExploreInteractions post={post} />

            {/* Info Overlay (Bottom left) */}
            <div className="absolute bottom-6 left-4 right-20 z-10 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 w-max">
                        <span className="text-white font-bold text-sm tracking-wide">{post.businessName}</span>
                    </div>
                    <div className="bg-primary/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-primary/20">
                        <MapPin size={12} className="text-primary-foreground" />
                        <span className="text-primary-foreground text-xs font-semibold">{post.distance}</span>
                    </div>
                </div>

                <div>
                    <h3 className="text-white text-xl font-bold leading-tight mb-2 drop-shadow-md">
                        {post.title}
                    </h3>
                    <p className="text-white/90 text-sm font-medium leading-snug line-clamp-3 w-5/6 drop-shadow-sm">
                        {post.description}
                    </p>
                </div>
            </div>
        </div>
    );
};
