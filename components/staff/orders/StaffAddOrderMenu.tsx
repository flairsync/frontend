"use client";

import React, { useState, useMemo } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Coffee,
    Sandwich,
    Salad,
    GlassWater,
    Pizza,
    CupSoda,
} from "lucide-react";

type MenuItem = {
    name: string;
    price: string;
};

type MenuCategory = {
    id: string;
    title: string;
    icon: React.ReactNode;
    items: MenuItem[];
};

const MENU_CATEGORIES: MenuCategory[] = [
    {
        id: "coffee",
        title: "Coffee & Drinks",
        icon: <Coffee className="w-5 h-5 text-amber-600" />,
        items: [
            { name: "Espresso", price: "€2.50" },
            { name: "Cappuccino", price: "€3.50" },
            { name: "Latte Macchiato", price: "€3.80" },
            { name: "Iced Coffee", price: "€4.00" },
        ],
    },
    {
        id: "juice",
        title: "Fresh Juices",
        icon: <GlassWater className="w-5 h-5 text-green-500" />,
        items: [
            { name: "Orange Juice", price: "€3.50" },
            { name: "Apple Juice", price: "€3.20" },
            { name: "Mixed Berry", price: "€4.20" },
        ],
    },
    {
        id: "food",
        title: "Breakfast & Snacks",
        icon: <Sandwich className="w-5 h-5 text-orange-500" />,
        items: [
            { name: "Croissant", price: "€2.00" },
            { name: "Club Sandwich", price: "€5.50" },
            { name: "Avocado Toast", price: "€6.00" },
        ],
    },
    {
        id: "lunch",
        title: "Lunch & Meals",
        icon: <Pizza className="w-5 h-5 text-red-500" />,
        items: [
            { name: "Margherita Pizza", price: "€8.50" },
            { name: "Chicken Wrap", price: "€7.50" },
            { name: "Caesar Salad", price: "€6.50" },
        ],
    },
    {
        id: "cold-drinks",
        title: "Cold Drinks",
        icon: <CupSoda className="w-5 h-5 text-blue-500" />,
        items: [
            { name: "Coca-Cola", price: "€2.50" },
            { name: "Sparkling Water", price: "€2.00" },
            { name: "Iced Tea", price: "€3.00" },
        ],
    },
];

interface MenuSelectorProps {
    onSelectItem?: (item: MenuItem) => void;
}

const StaffAddOrderMenu: React.FC<MenuSelectorProps> = ({ onSelectItem }) => {
    const [search, setSearch] = useState("");

    const filteredCategories = useMemo(() => {
        if (!search.trim()) return MENU_CATEGORIES;
        const lower = search.toLowerCase();

        return MENU_CATEGORIES.map((cat) => ({
            ...cat,
            items: cat.items.filter((item) =>
                item.name.toLowerCase().includes(lower)
            ),
        })).filter((cat) => cat.items.length > 0);
    }, [search]);

    return (
        <section className="space-y-4">
            <h2 className="text-xl font-semibold">Select Items</h2>

            {/* Search Box */}
            <Input
                placeholder="Search for an item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-gray-300 focus-visible:ring-amber-500"
            />

            {/* Accordion Menu */}
            <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-0">
                    {filteredCategories.length > 0 ? (
                        <Accordion type="multiple" className="divide-y divide-gray-200">
                            {filteredCategories.map((category) => (
                                <AccordionItem key={category.id} value={category.id}>
                                    <AccordionTrigger className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-2">
                                            {category.icon}
                                            <span className="font-medium text-gray-800">
                                                {category.title}
                                            </span>
                                        </div>
                                    </AccordionTrigger>

                                    <AccordionContent className="bg-gray-50 px-6 py-3 space-y-2 animate-in slide-in-from-top-2">
                                        {category.items.map((item, index) => (
                                            <button
                                                key={index}
                                                onClick={() => onSelectItem?.(item)}
                                                className="flex w-full justify-between items-center text-gray-700 hover:bg-white rounded-md p-2 transition"
                                            >
                                                <span>{item.name}</span>
                                                <span className="font-semibold">{item.price}</span>
                                            </button>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                        <p className="text-center text-gray-500 py-4">
                            No items match your search.
                        </p>
                    )}
                </CardContent>
            </Card>
        </section>
    );
};

export default StaffAddOrderMenu;
