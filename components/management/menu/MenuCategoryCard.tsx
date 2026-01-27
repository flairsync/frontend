import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { MenuItemRow } from "./MenuItemRow";

type MenuCategoryCardProps = {
    category: any;
    isOpen: boolean;

    onToggle: () => void;
    onAddItem: () => void;
    onEditItem: (item: any) => void;
    onDeleteItem: (itemId: string) => void;
};

export const MenuCategoryCard = ({
    category,
    isOpen,
    onToggle,
    onAddItem,
    onEditItem,
    onDeleteItem,
}: MenuCategoryCardProps) => {
    const items = category.items ?? [];

    return (
        <Card className="border border-zinc-200 dark:border-zinc-700 rounded-xl hover:shadow-lg transition-all">
            {/* Category Header */}
            <CardHeader
                onClick={onToggle}
                className="flex justify-between items-center cursor-pointer p-4
                   bg-zinc-100 dark:bg-zinc-800 rounded-t-xl"
            >
                <div className="flex items-center gap-3">
                    {isOpen ? <ChevronDown /> : <ChevronRight />}
                    <CardTitle className="text-lg font-semibold">
                        {category.name}
                    </CardTitle>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        ({items.length} items)
                    </span>
                </div>

                <Button
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddItem();
                    }}
                    className="bg-indigo-500 text-white hover:bg-indigo-600 transition"
                >
                    <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
            </CardHeader>

            {/* Items */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        <CardContent className="space-y-3 p-4 bg-white dark:bg-zinc-900
                                    rounded-b-xl border-t border-zinc-200 dark:border-zinc-700">
                            {items.length === 0 ? (
                                <p className="text-zinc-500 dark:text-zinc-400 italic text-sm">
                                    No items yet. Click “Add Item” to start.
                                </p>
                            ) : (
                                items.map((item: any) => (
                                    <MenuItemRow
                                        key={item.id}
                                        item={item}
                                        categoryId={category.id}
                                        onEdit={onEditItem}
                                        onDelete={onDeleteItem}
                                    />
                                ))
                            )}
                        </CardContent>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
};
