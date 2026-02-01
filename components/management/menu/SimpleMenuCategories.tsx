
import React from "react";
import { BusinessMenuCategory } from "@/models/business/menu/BusinessMenuCategory";
import { SimpleMenuCategoryCard } from "./SimpleMenuCategoryCard";

type Props = {
    categories: BusinessMenuCategory[];
    onEditCategory: (id: string) => void;
    onDeleteCategory: (id: string) => void;
    onAddItem: (catId: string) => void;
    onEditItem: (id: string) => void;
    onDeleteItem: (id: string) => void;
    onDuplicateItem: (id: string) => void;
    onMoveItemUp: (itemId: string, catId: string) => void;
    onMoveItemDown: (itemId: string, catId: string) => void;
    onMoveItemToCategory: (itemId: string, catId: string) => void;
    onMoveCategoryUp: (catId: string) => void;
    onMoveCategoryDown: (catId: string) => void;
};

export const SimpleMenuCategories = ({
    categories,
    onEditCategory,
    onDeleteCategory,
    onAddItem,
    onEditItem,
    onDeleteItem,
    onDuplicateItem,
    onMoveItemUp,
    onMoveItemDown,
    onMoveItemToCategory,
    onMoveCategoryUp,
    onMoveCategoryDown
}: Props) => {
    return (
        <div className="space-y-4">
            {categories.length === 0 && (
                <p className="text-zinc-500 dark:text-zinc-400 italic text-sm">
                    No categories yet. Click “Add Category” to start.
                </p>
            )}

            {categories.map((cat, index) => (
                <SimpleMenuCategoryCard
                    key={cat.id}
                    category={cat}
                    onEdit={() => onEditCategory(cat.id)}
                    onDelete={() => onDeleteCategory(cat.id)}
                    onAddItem={() => onAddItem(cat.id)}
                    onEditItem={onEditItem}
                    onDeleteItem={onDeleteItem}
                    onDuplicateItem={onDuplicateItem}
                    onMoveItemUp={(itemId) => onMoveItemUp(itemId, cat.id)}
                    onMoveItemDown={(itemId) => onMoveItemDown(itemId, cat.id)}
                    onMoveItemToCategory={(itemId) => onMoveItemToCategory(itemId, cat.id)}
                    onMoveCategoryUp={index > 0 ? () => onMoveCategoryUp(cat.id) : undefined}
                    onMoveCategoryDown={index < categories.length - 1 ? () => onMoveCategoryDown(cat.id) : undefined}
                />
            ))}
        </div>
    );
};
