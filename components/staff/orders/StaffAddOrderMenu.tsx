"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { BusinessMenuItem } from "@/models/business/menu/BusinessMenuItem";

interface MenuCategory {
    id: string;
    name: string;
    items: BusinessMenuItem[];
}

interface MenuSelectorProps {
    categories: MenuCategory[];
    onSelectItem?: (item: BusinessMenuItem) => void;
    currencySymbol?: string;
}

const StaffAddOrderMenu: React.FC<MenuSelectorProps> = ({ categories, onSelectItem, currencySymbol = "$" }) => {
    const [search, setSearch] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

    const filteredCategories = useMemo(() => {
        let catsToFilter = categories;
        if (selectedCategoryId !== "all") {
            catsToFilter = categories.filter(c => c.id === selectedCategoryId);
        }

        if (!search.trim()) return catsToFilter;
        const lower = search.toLowerCase();

        return catsToFilter.map(cat => {
            const fItems = cat.items.filter(item =>
                item.name.toLowerCase().includes(lower) ||
                (item.description && item.description.toLowerCase().includes(lower))
            );
            return { ...cat, items: fItems };
        }).filter(cat => cat.items.length > 0);
    }, [categories, search, selectedCategoryId]);

    React.useEffect(() => {
        if (selectedCategoryId && selectedCategoryId !== "all") {
            const el = document.getElementById(`ordermenu-category-${selectedCategoryId}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [selectedCategoryId]);

    return (
        <section className="space-y-4 h-full flex flex-col overflow-hidden pb-2">


            {/* Search Box & Category Filter */}
            <div className="relative shrink-0 flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search for an item..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 border-border focus-visible:ring-ring"
                    />
                </div>
                {categories.length > 0 && (
                    <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                        <SelectTrigger className="w-[160px] border-border focus:ring-ring text-sm">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* Grouped Menu List */}
            <div className="flex-1 flex flex-col overflow-hidden h-full">
                <div className="overflow-y-auto h-full space-y-4 pr-2">
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => (
                            <div key={category.id} id={`ordermenu-category-${category.id}`} className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                                <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center justify-between sticky top-0 backdrop-blur-md z-10">
                                    <h3 className="font-semibold text-sm text-muted-foreground">{category.name}</h3>
                                    <span className="text-xs text-muted-foreground bg-card px-2 py-0.5 rounded-full border border-border shadow-sm">{category.items.length} items</span>
                                </div>
                                <div className="divide-y divide-border">
                                    {category.items.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => onSelectItem?.(item)}
                                            className="flex w-full flex-col items-start px-4 py-3 hover:bg-primary/5 transition-colors focus:outline-none focus:bg-primary/5"
                                        >
                                            <div className="flex w-full justify-between items-center text-left gap-2">
                                                <span className="font-medium text-foreground">{item.name}</span>
                                                <span className="font-semibold text-foreground shrink-0">{currencySymbol}{Number(item.price || 0).toFixed(2)}</span>
                                            </div>
                                            {item.description && (
                                                <span className="text-xs text-muted-foreground text-left mt-1 line-clamp-1">
                                                    {item.description}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <Card className="flex-1 flex flex-col border border-dashed border-border shadow-none h-full bg-muted/50 items-center justify-center">
                            <CardContent className="flex flex-col items-center p-6 text-center">
                                <Search className="w-8 h-8 text-muted-foreground/50 mb-3" />
                                <p className="text-muted-foreground font-medium">No items found</p>
                                <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your search</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </section>
    );
};

export default StaffAddOrderMenu;
