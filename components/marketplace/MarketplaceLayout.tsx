import { MarketplaceSidebar } from './MarketplaceSidebar';
import { MarketplaceItemType } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import WebsiteLogo from '@/components/shared/WebsiteLogo';
import HeaderProfileAvatar from '@/components/shared/HeaderProfileAvatar';
import { usePageContext } from 'vike-react/usePageContext';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    const { user } = usePageContext();

    return (
        <SidebarProvider className="h-screen overflow-hidden">
            <MarketplaceSidebar
                activeType={activeType}
                activeCategory="all"
            />

            <SidebarInset className="flex flex-col h-full overflow-hidden">
                {/* Standard Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-background/70 backdrop-blur-md z-50 shrink-0">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger className="-ml-1" />
                        <WebsiteLogo />
                        <div className="h-6 w-[1px] bg-white/10 hidden md:block" />
                        <nav className="hidden lg:flex items-center gap-6">
                            <a href="/feed" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Feed</a>
                            <a href="/manage/overview" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Dashboard</a>
                            <a href="/marketplace/guest" className={`text-xs font-semibold uppercase tracking-widest transition-colors ${activeType === 'guest' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>Marketplace</a>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                placeholder="Search..."
                                className="bg-secondary/20 border-none rounded-full py-1.5 pl-9 pr-4 text-xs w-48 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                            />
                        </div>
                        {user ? (
                            <HeaderProfileAvatar />
                        ) : (
                            <Button size="sm" variant="default" className="rounded-full px-6" asChild>
                                <a href="/login">Join Us</a>
                            </Button>
                        )}
                    </div>
                </header>

                <main className="flex-1 flex flex-col min-w-0 bg-secondary/5 overflow-hidden">
                    <ScrollArea className="flex-1">
                        <div className="max-w-[1400px] mx-auto px-6 py-8">
                            <div className="mb-10">
                                <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-2 block">{title}</span>
                                <motion.h1
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-3xl font-bold tracking-tight"
                                >
                                    {subtitle}
                                </motion.h1>
                            </div>

                            {children}
                        </div>
                    </ScrollArea>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};
