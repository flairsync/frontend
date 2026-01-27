
import React, { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash, ChevronDown, ChevronRight } from "lucide-react";

type MenuItem = {
    id: string;
    name: string;
    category: string;
    price: string;
    description: string;
};

type Category = {
    id: string;
    name: string;
};

const initialCategories: Category[] = [
    { id: "1", name: "Drinks" },
    { id: "2", name: "Main" },
    { id: "3", name: "Desserts" },
    { id: "4", name: "Appetizers" },
];

const OwnerMenuManagementPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>(initialCategories);

    const [menuItems, setMenuItems] = useState<MenuItem[]>([
        {
            id: "1",
            name: "Cappuccino",
            category: "Drinks",
            price: "$3.50",
            description: "Classic Italian coffee.",
        },
        {
            id: "2",
            name: "Margherita Pizza",
            category: "Main",
            price: "$12.00",
            description: "Tomato, mozzarella, basil.",
        },
        {
            id: "3",
            name: "Chocolate Cake",
            category: "Desserts",
            price: "$5.50",
            description: "Rich chocolate cake.",
        },
    ]);

    const [expanded, setExpanded] = useState<string | null>(null);

    const removeMenuItem = (id: string) => {
        setMenuItems(menuItems.filter((item) => item.id !== id));
    };

    const toggleExpand = (cat: string) => {
        setExpanded(expanded === cat ? null : cat);
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
                    Menu Management
                </h1>

                {/* Top Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-sm text-zinc-500">Total Items</p>
                            <p className="text-2xl font-bold">{menuItems.length}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-sm text-zinc-500">Total Categories</p>
                            <p className="text-2xl font-bold">{categories.length}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-center">
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Add Item
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-center">
                            <Button variant="secondary" className="flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Add Category
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <Separator />

                {/* Categories Collapsible */}
                <div >
                    <Reorder.Group
                        onReorder={setCategories}
                        values={categories}
                        className="space-y-4"
                    >
                        {categories.map((cat) => {
                            const items = menuItems.filter((m) => m.category === cat.name);
                            const isOpen = expanded === cat.id;
                            return (
                                <Reorder.Item
                                    value={cat}
                                    key={cat.id}
                                >
                                    <Card key={cat.id + "_card"}>
                                        <CardHeader
                                            className="flex flex-row items-center justify-between cursor-pointer"
                                            onClick={() => toggleExpand(cat.id)}
                                        >
                                            <div className="flex items-center gap-2">
                                                {isOpen ? (
                                                    <ChevronDown className="h-4 w-4" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4" />
                                                )}
                                                <CardTitle>{cat.name}</CardTitle>
                                                <span className="text-sm text-zinc-500">
                                                    ({items.length} items)
                                                </span>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log("Add item under", cat.name);
                                                }}
                                            >
                                                <Plus className="h-4 w-4 mr-1" /> Add
                                            </Button>
                                        </CardHeader>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.25 }}
                                                >
                                                    <CardContent className="space-y-2">
                                                        {items.length === 0 && (
                                                            <p className="text-sm text-zinc-500">
                                                                No items in this category.
                                                            </p>
                                                        )}
                                                        {items.map((item) => (
                                                            <div
                                                                key={item.id}
                                                                className="flex items-center justify-between border-b py-2"
                                                            >
                                                                <div>
                                                                    <p className="font-medium">{item.name}</p>
                                                                    <p className="text-sm text-zinc-500">
                                                                        {item.description}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-semibold">{item.price}</p>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => removeMenuItem(item.id)}
                                                                    >
                                                                        <Trash className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </CardContent>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Card>
                                </Reorder.Item>
                            );
                        })}
                    </Reorder.Group>
                </div>
            </div>
        </div>
    );
};

export default OwnerMenuManagementPage;
