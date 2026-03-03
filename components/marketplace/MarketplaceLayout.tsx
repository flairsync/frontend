import { MarketplaceSidebar } from './MarketplaceSidebar';
import { MarketplaceItemType } from './types';
import { motion } from 'framer-motion';
import PublicFeedHeader from '@/components/feed/PublicFeedHeader';
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";

interface MarketplaceLayoutProps {
    children: React.ReactNode;
    activeType: MarketplaceItemType;
    title: string;
    subtitle: string;
}

export const MarketplaceLayout: React.FC<MarketplaceLayoutProps> = ({
    children,
    activeType,
    title,
    subtitle
}) => {
    return (
        <SidebarProvider>
            <MarketplaceSidebar
                activeType={activeType}
                activeCategory="all"
            />

            <SidebarInset className="flex flex-col flex-1 min-h-[calc(100vh-var(--public-header-height,80px))]">
                {/* Standard Header */}
                <PublicFeedHeader className="sticky top-0 w-full shrink-0 shadow-sm" />

                <main className="flex-1 flex flex-col min-w-0 bg-secondary/5">
                    <div className="flex-1">
                        <div className="max-w-[1400px] mx-auto px-6 py-8 relative">
                            <div className="mb-10 flex items-center gap-4">
                                <SidebarTrigger className="-ml-2 bg-background/50 hover:bg-background/80 shadow-sm border border-white/10" />
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-2 block">{title}</span>
                                    <motion.h1
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-3xl font-bold tracking-tight"
                                    >
                                        {subtitle}
                                    </motion.h1>
                                </div>
                            </div>

                            {children}
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};
