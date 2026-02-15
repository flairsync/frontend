import React from 'react';
import { MarketplaceItemType } from './types';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
} from '@/components/ui/sidebar';
import {
    Users,
    Store,
    Settings,
    Trophy,
    Flame,
    Sparkles,
    Zap,
    Coffee,
    ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketplaceSidebarProps {
    activeType: MarketplaceItemType;
    activeCategory: string;
}

const MARKETPLACE_TYPES = [
    { id: 'guest' as MarketplaceItemType, label: 'Guest Marketplace', icon: Users },
    { id: 'b2b' as MarketplaceItemType, label: 'B2B Marketplace', icon: Store },
    { id: 'saas' as MarketplaceItemType, label: 'Shop', icon: Settings },
];

const CATEGORIES = [
    { id: 'all', label: 'All Items', icon: Sparkles },
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'restaurants', label: 'Restaurants', icon: ShoppingBag },
    { id: 'coffee', label: 'Coffee Shops', icon: Coffee },
    { id: 'equipment', label: 'Equipment', icon: Zap },
    { id: 'rewards', label: 'Rewards', icon: Trophy },
];

export function MarketplaceSidebar({
    activeType,
    activeCategory,
}: MarketplaceSidebarProps) {
    return (
        <Sidebar collapsible="icon" className="border-r border-white/5 bg-secondary/10 backdrop-blur-xl">
            <SidebarHeader className="h-16 flex items-center px-4 border-b border-white/5">
                <span className="text-sm font-bold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
                    MARKETPLACE
                </span>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
                        Discovery
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {MARKETPLACE_TYPES.map((type) => (
                            <SidebarMenuItem key={type.id}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={activeType === type.id}
                                    tooltip={type.label}
                                >
                                    <a href={`/marketplace/${type.id}`}>
                                        <type.icon />
                                        <span>{type.label}</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
                        Filter by
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {CATEGORIES.map((cat) => (
                            <SidebarMenuItem key={cat.id}>
                                <SidebarMenuButton
                                    isActive={activeCategory === cat.id}
                                    tooltip={cat.label}
                                >
                                    <cat.icon />
                                    <span>{cat.label}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
