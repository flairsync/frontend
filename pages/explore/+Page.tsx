import React from 'react';
import PublicFeedHeader from '@/components/feed/PublicFeedHeader';
import { ExploreFeed } from '@/features/explore/ExploreFeed';
import { useTranslation } from 'react-i18next';

const Page = () => {
    const { t } = useTranslation();

    return (
        <div className="w-full h-100dvh min-h-screen bg-background overflow-hidden flex flex-col">
            <div className="flex-none">
                <PublicFeedHeader />
            </div>

            <main className="flex-1 w-full h-full relative xl:max-w-[500px] xl:mx-auto pt-[80px]">
                {/* 
                  On desktop, we slightly narrow the feed to look more like TikTok/Instagram Reels.
                  On mobile, it takes the full width and height.
                */}
                <ExploreFeed />
            </main>
        </div>
    );
};

export default Page;
