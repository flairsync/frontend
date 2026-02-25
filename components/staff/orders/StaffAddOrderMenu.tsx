"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type BusinessMenuItem = {
    id: string;
    name: string;
    description?: string;
    price?: number;
    categoryId?: string;
};

interface MenuSelectorProps {
    items: BusinessMenuItem[];
    onSelectItem?: (item: BusinessMenuItem) => void;
}

const StaffAddOrderMenu: React.FC<MenuSelectorProps> = ({ items, onSelectItem }) => {
    const [search, setSearch] = useState("");

    const filteredItems = useMemo(() => {
        if (!search.trim()) return items;
        const lower = search.toLowerCase();
        return items.filter((item) =>
            item.name.toLowerCase().includes(lower) ||
            (item.description && item.description.toLowerCase().includes(lower))
        );
    }, [items, search]);

    return (
        <section className="space-y-4 h-full flex flex-col overflow-hidden pb-2">


            {/* Search Box */}
            <div className="relative shrink-0">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search for an item..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 border-gray-300 focus-visible:ring-amber-500"
                />
            </div>

            {/* Flat Menu List */}
            <Card className="flex-1 flex flex-col border border-gray-200 shadow-sm overflow-hidden h-full">
                <CardContent className="p-0 overflow-y-auto h-full">
                    {filteredItems.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {filteredItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onSelectItem?.(item)}
                                    className="flex w-full flex-col items-start px-4 py-3 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex w-full justify-between items-center">
                                        <span className="font-medium text-gray-800">{item.name}</span>
                                        <span className="font-semibold">${Number(item.price || 0).toFixed(2)}</span>
                                    </div>
                                    {item.description && (
                                        <span className="text-xs text-muted-foreground text-left mt-1 line-clamp-1">
                                            {item.description}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-6">
                            No items match your search.
                        </p>
                    )}
                </CardContent>
            </Card>
        </section>
    );
};

export default StaffAddOrderMenu;
