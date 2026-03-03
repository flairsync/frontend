export interface ExplorePostData {
    id: string;
    type: 'video' | 'image' | 'carousel';
    mediaUrls: string[];
    title: string;
    description: string;
    businessName: string;
    businessAvatar: string;
    distance: string;
    likes: number;
    comments: number;
    shares: number;
    isLiked?: boolean;
}

export const generateMockExplorePosts = (page: number): ExplorePostData[] => {
    // Generate a batch of posts based on the page number to simulate infinite scrolling
    const startId = page * 10;

    return Array.from({ length: 5 }).map((_, i) => {
        const id = startId + i;
        const typeInt = id % 3;
        const type = typeInt === 0 ? 'video' : typeInt === 1 ? 'image' : 'carousel';

        // We'll use publicly available placeholder videos/images about food
        const videoUrls = [
            'https://videos.pexels.com/video-files/3195215/3195215-uhd_2160_4096_25fps.mp4', // coffee pouring
            'https://videos.pexels.com/video-files/4253303/4253303-uhd_3840_2160_25fps.mp4',   // cutting pizza
            'https://videos.pexels.com/video-files/3015510/3015510-uhd_3840_2160_24fps.mp4',   // burger making
            'https://videos.pexels.com/video-files/1908064/1908064-uhd_3840_2160_24fps.mp4', // coffee roasting
            'https://videos.pexels.com/video-files/2809187/2809187-uhd_3840_2160_24fps.mp4'  // steak
        ];

        const mediaUrls = type === 'video'
            ? [videoUrls[id % videoUrls.length]]
            : type === 'image'
                ? [`https://picsum.photos/seed/${id}/600/1000`]
                : [
                    `https://picsum.photos/seed/${id}_1/600/1000`,
                    `https://picsum.photos/seed/${id}_2/600/1000`,
                    `https://picsum.photos/seed/${id}_3/600/1000`
                ];

        return {
            id: `post-${id}`,
            type,
            mediaUrls,
            title: `Amazing item ${id} 🔥`,
            description: `You have to try this! One of the best we've had in a while. Come visit us today and mention this video for a surprise! ✨ #foodie #restaurant`,
            businessName: `Restaurant ${id}`,
            businessAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
            distance: `${(id % 15) + 0.5} km`,
            likes: Math.floor(Math.random() * 10000) + 50,
            comments: Math.floor(Math.random() * 500) + 5,
            shares: Math.floor(Math.random() * 200) + 1,
            isLiked: false,
        };
    });
};
