import React, { useState, useEffect, useRef } from 'react';
import { ExplorePostData, generateMockExplorePosts } from './data';
import { ExplorePost } from './ExplorePost';
import { Loader2 } from 'lucide-react';

export const ExploreFeed: React.FC = () => {
    const [posts, setPosts] = useState<ExplorePostData[]>([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activePostIndex, setActivePostIndex] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        const initialPosts = generateMockExplorePosts(0);
        setPosts(initialPosts);
        setLoading(false);
    }, []);

    // Infinite Scroll & Auto-Play Intersection Observer
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Find which index this is
                        const index = Number(entry.target.getAttribute('data-index'));
                        setActivePostIndex(index);

                        // If we reached the second to last post, load more
                        if (index >= posts.length - 2 && !loading) {
                            setLoading(true);
                            setPage((prevPage) => {
                                const nextPage = prevPage + 1;
                                // Add intentional small delay to simulate network
                                setTimeout(() => {
                                    setPosts((prev) => [...prev, ...generateMockExplorePosts(nextPage)]);
                                    setLoading(false);
                                }, 500);
                                return nextPage;
                            });
                        }
                    }
                });
            },
            {
                root: containerRef.current,
                threshold: 0.6, // Trigger when 60% of the post is visible
            }
        );

        const postElements = containerRef.current.querySelectorAll('.explore-post');
        postElements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [posts.length, loading]);

    if (posts.length === 0 && loading) {
        return (
            <div className="w-full h-[calc(100vh-80px)] flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-background sm:rounded-3xl sm:border sm:border-border/40 sm:shadow-2xl overflow-hidden relative">
            <div
                ref={containerRef}
                className="w-full h-[calc(100vh-80px)] sm:h-[calc(100vh-100px)] overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>

                {posts.map((post, index) => (
                    <div key={post.id} className="explore-post w-full shrink-0" data-index={index}>
                        <ExplorePost
                            post={post}
                            isActive={index === activePostIndex}
                        />
                    </div>
                ))}

                {loading && (
                    <div className="w-full py-8 flex items-center justify-center snap-center shrink-0 h-32 bg-black">
                        <Loader2 className="w-6 h-6 animate-spin text-white/50" />
                    </div>
                )}
            </div>
        </div>
    );
};
