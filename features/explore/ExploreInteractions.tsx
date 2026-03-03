import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MapPin, Plus } from 'lucide-react';
import { ExplorePostData } from './data';
import { motion, AnimatePresence } from 'framer-motion';

interface ExploreInteractionsProps {
    post: ExplorePostData;
}

export const ExploreInteractions: React.FC<ExploreInteractionsProps> = ({ post }) => {
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likes, setLikes] = useState(post.likes);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikes(prev => isLiked ? prev - 1 : prev + 1);
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-20">
            {/* Avatar */}
            <div className="relative cursor-pointer group hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-muted shadow-lg ring-2 ring-primary/20">
                    <img src={post.businessAvatar} alt={post.businessName} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 -translate-x-1/2 left-1/2 bg-primary rounded-full p-0.5 shadow-sm">
                    <Plus size={14} className="text-primary-foreground" />
                </div>
            </div>

            {/* Interactions */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={handleLike}>
                <motion.div
                    whileTap={{ scale: 0.8 }}
                    className={`p-3 rounded-full backdrop-blur-md transition-colors duration-300 ${isLiked ? 'bg-primary/20 text-primary' : 'bg-black/20 text-white hover:bg-black/40'}`}
                >
                    <Heart size={28} className={isLiked ? 'fill-primary' : ''} />
                </motion.div>
                <span className="text-white text-xs font-semibold uppercase tracking-wider drop-shadow-md">{formatNumber(likes)}</span>
            </div>

            <div className="flex flex-col items-center gap-1 group cursor-pointer">
                <div className="p-3 rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-colors duration-300">
                    <MessageCircle size={28} />
                </div>
                <span className="text-white text-xs font-semibold uppercase tracking-wider drop-shadow-md">{formatNumber(post.comments)}</span>
            </div>

            <div className="flex flex-col items-center gap-1 group cursor-pointer">
                <div className="p-3 rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-colors duration-300">
                    <Share2 size={28} />
                </div>
                <span className="text-white text-xs font-semibold uppercase tracking-wider drop-shadow-md">{formatNumber(post.shares)}</span>
            </div>
        </div>
    );
};
