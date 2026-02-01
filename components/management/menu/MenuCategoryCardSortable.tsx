import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2 } from "lucide-react";
import { MenuItemRowSortable } from "./MenuItemRowSortable";
import { BusinessMenuCategory } from "@/models/business/menu/BusinessMenuCategory";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
    category: BusinessMenuCategory;
    categories: BusinessMenuCategory[];
    setCategories: (cats: BusinessMenuCategory[]) => void;
    onEdit: () => void;
    onDelete: () => void;
    onAddItem: () => void;
    onEditItem: (id: string) => void;
    onDeleteItem: (id: string) => void;
    onDuplicateItem: (id: string) => void;
};

export const MenuCategoryCardSortable = ({
    category,
    categories,
    setCategories,
    onEdit,
    onDelete,
    onAddItem,
    onEditItem,
    onDeleteItem,
    onDuplicateItem
}: Props) => {
    const [isOpen, setIsOpen] = useState(false);

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: category.id,
        data: { type: "category", name: category.name },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="mb-2">
            <Card className="border border-zinc-200 dark:border-zinc-700 rounded-xl hover:shadow-lg transition-all">
                <div className="flex items-center">
                    {/* DRAG HANDLE */}
                    <div
                        {...listeners}
                        {...attributes}
                        className="w-6 h-12 bg-zinc-200 dark:bg-zinc-700 cursor-grab rounded-l-xl flex items-center justify-center"
                    >
                        <svg className="w-3 h-3 text-zinc-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M7 4h2v2H7V4zm4 0h2v2h-2V4zM7 8h2v2H7V8zm4 0h2v2h-2V8z" />
                        </svg>
                    </div>

                    {/* HEADER */}
                    <CardHeader
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex flex-1 justify-between items-center cursor-pointer p-4 bg-zinc-100 dark:bg-zinc-800 rounded-r-xl"
                    >
                        <div className="flex items-center gap-3">
                            {isOpen ? <ChevronDown /> : <ChevronRight />}
                            <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
                            <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                ({category.items?.length || 0} items)
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                size="icon"
                                variant="destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                className="bg-indigo-500 text-white hover:bg-indigo-600"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddItem();
                                }}
                            >                                <Plus className="h-4 w-4 mr-1" /> Add Item
                            </Button>
                        </div>
                    </CardHeader>
                </div>

                {/* ITEMS */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <CardContent className="space-y-3 p-4 bg-white dark:bg-zinc-900 rounded-b-xl border-t border-zinc-200 dark:border-zinc-700">
                                {category.items && category.items.length > 0 ? (
                                    <SortableContext
                                        items={category.items.map(i => i.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {category.items.map(item => (
                                            <MenuItemRowSortable
                                                key={item.id}
                                                item={item}
                                                category={category}
                                                categories={categories}
                                                setCategories={setCategories}
                                                onEdit={() => onEditItem(item.id)}
                                                onDelete={() => onDeleteItem(item.id)}
                                                onDuplicate={() => onDuplicateItem(item.id)}
                                            />
                                        ))}
                                    </SortableContext>
                                ) : (
                                    <p className="text-zinc-500 dark:text-zinc-400 italic text-sm">
                                        No items yet. Click “Add Item” to start.
                                    </p>
                                )}
                            </CardContent>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </div>
    );
};
