"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import {
    Coffee,
    Sandwich,
    Salad,
    GlassWater,
    Pizza,
    CupSoda,
    ChevronRight,
    Search
} from "lucide-react";
import { Input } from "../ui/input";

// ---- 🥐 Menu Data ---- //
type MenuItem = {
    name: string;
    price: string;
    description?: string;
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
        icon: <Coffee size={20} />,
        items: [
            { name: "Espresso", price: "€2.50", description: "Rich and bold single shot" },
            { name: "Cappuccino", price: "€3.50", description: "Perfect balance of espresso and foam" },
            { name: "Latte Macchiato", price: "€3.80", description: "Steamed milk spotted with espresso" },
            { name: "Iced Coffee", price: "€4.00", description: "Refreshing cold brew with ice" },
        ],
    },
    {
        id: "juice",
        title: "Fresh Juices",
        icon: <GlassWater size={20} />,
        items: [
            { name: "Orange Juice", price: "€3.50", description: "Freshly squeezed oranges" },
            { name: "Apple Juice", price: "€3.20", description: "Cold pressed local apples" },
            { name: "Mixed Berry", price: "€4.20", description: "Blend of seasonal berries" },
        ],
    },
    {
        id: "food",
        title: "Breakfast & Snacks",
        icon: <Sandwich size={20} />,
        items: [
            { name: "Croissant", price: "€2.00", description: "Butter flaky French pastry" },
            { name: "Club Sandwich", price: "€5.50", description: "Triple decker chicken and bacon" },
            { name: "Avocado Toast", price: "€6.00", description: "Sourdough bread with poached egg" },
        ],
    },
    {
        id: "lunch",
        title: "Lunch & Meals",
        icon: <Pizza size={20} />,
        items: [
            { name: "Margherita Pizza", price: "€8.50", description: "Fresh tomato, mozzarella, basil" },
            { name: "Chicken Wrap", price: "€7.50", description: "Grilled chicken with yogurt sauce" },
            { name: "Caesar Salad", price: "€6.50", description: "Crispy lettuce, parmesan, croutons" },
        ],
    },
];

// ---- ☕ Component ---- //
const BusinessDetailsMenu: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">
                        {t("business_page.menu.section_title", "Discover Menu")}
                    </h2>
                    <p className="text-muted-foreground">Handcrafted selections for every taste.</p>
                </div>

                <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                        placeholder="Search menu..."
                        className="pl-10 h-11 rounded-xl bg-card border-border/50 focus:ring-primary/20"
                    />
                </div>
            </div>

            <Card className="border-border/50 shadow-2xl shadow-primary/5 rounded-[2rem] overflow-hidden">
                <CardContent className="p-0">
                    <Accordion type="multiple" defaultValue={["coffee"]} className="divide-y divide-border/50">
                        {MENU_CATEGORIES.map((category) => (
                            <AccordionItem key={category.id} value={category.id} className="border-none">
                                <AccordionTrigger className="flex items-center gap-4 px-8 py-6 hover:cursor-pointer hover:bg-muted/50 transition-all">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="p-3 bg-muted rounded-2xl text-muted-foreground transition-all duration-300">
                                            {category.icon}
                                        </div>
                                        <div className="text-left">
                                            <span className="text-lg font-bold block">
                                                {category.title}
                                            </span>
                                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                                {category.items.length} Items Available
                                            </span>
                                        </div>
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="p-0">
                                    <div className="px-8 py-4 grid gap-4 border-t border-border/10">
                                        {category.items.map((item, index) => (
                                            <div
                                                key={index}
                                                className="group flex justify-between items-center p-4 rounded-2xl hover:bg-card hover:shadow-xl hover:shadow-primary/5 border border-transparent hover:border-border/50 transition-all cursor-pointer"
                                            >
                                                <div className="space-y-1">
                                                    <span className="font-bold text-foreground block">{item.name}</span>
                                                    <span className="text-sm text-muted-foreground line-clamp-1">{item.description}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-black text-primary bg-primary/5 px-3 py-1 rounded-lg">
                                                        {item.price}
                                                    </span>
                                                    <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>

        </section>
    );
};

export default BusinessDetailsMenu;

