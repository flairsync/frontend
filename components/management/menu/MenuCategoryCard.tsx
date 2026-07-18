import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence, Reorder, useDragControls, DragControls } from "framer-motion";

import {
    ChevronDown,
    ChevronRight,
    Plus,
    Pencil,
    Trash2,
} from "lucide-react";
import { MenuItemRow } from "./MenuItemRow";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { BusinessMenuCategory } from "@/models/business/menu/BusinessMenuCategory";
import { PointerEvent } from "react";

type MenuCategoryCardProps = {
    category: BusinessMenuCategory;
    isOpen: boolean;

    onToggle: () => void;

    onAddItem: () => void;
    onDuplicateItems: () => void;
    onEditItem: (item: any) => void;
    onDeleteItem: (itemId: string) => void;

    onEditCategory: (category: any) => void;
    onDeleteCategory: (categoryId: string) => void;


};


export const MenuCategoryCard = ({
    category,
    isOpen,
    onToggle,
    onAddItem,
    onDuplicateItems,
    onEditItem,
    onDeleteItem,
    onEditCategory,
    onDeleteCategory,
}: MenuCategoryCardProps) => {
    const items = category.items ?? [];
    const controls = useDragControls()

    return (
        <Reorder.Item
            key={category.id}
            value={category}
            dragListener={false} // only drag via handle
            dragControls={controls}

        >
            <Card className=" border border-border rounded-xl hover:shadow-lg transition-all">
                <div
                    className="flex flex-row "
                >
                    <div

                        className=" flex flex-1 hover:cursor-grab  bg-muted  rounded-l-xl"
                        onPointerDown={(e) => {
                            controls.start(e);
                        }}

                    />

                    {/* Category Header */}
                    <CardHeader
                        onClick={onToggle}
                        className="flex flex-8 justify-between items-center cursor-pointer p-4
                   bg-muted rounded-r-xl"
                    >

                        {/* Left */}
                        <div className="flex items-center gap-3">

                            {/* Drag handle */}

                            {isOpen ? <ChevronDown /> : <ChevronRight />}

                            <CardTitle className="text-lg font-semibold">
                                {category.name}
                            </CardTitle>

                            <span className="text-sm text-muted-foreground">
                                ({items.length} items)
                            </span>
                        </div>

                        {/* Right actions */}
                        <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Edit category */}
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => onEditCategory(category)}
                                className="hover:bg-muted"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>

                            {/* Delete category with confirmation */}
                            <ConfirmAction
                                onConfirm={() => onDeleteCategory(category.id)}
                                title="Delete category?"
                                description="This will remove the category and all its items."
                                confirmText="Delete"
                                storageKey="confirm-delete-category"
                            >
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="hover:bg-destructive/10 text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </ConfirmAction>

                            {/* Add item */}
                            <Button
                                size="sm"
                                onClick={onAddItem}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 transition"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Item
                            </Button>
                            <Button
                                size="sm"
                                onClick={onDuplicateItems}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 transition"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Duplicate items
                            </Button>
                        </div>
                    </CardHeader>
                </div>




                {/* Items */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <CardContent
                                className="space-y-3 p-4 bg-card
                            rounded-b-xl border-t border-border"
                            >

                                {items.length === 0 ? (
                                    <p className="text-muted-foreground italic text-sm">
                                        No items yet. Click “Add Item” to start.
                                    </p>
                                ) : (
                                    items.map((item: any) => (
                                        <MenuItemRow
                                            onDuplicate={() => { }}
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
        </Reorder.Item>
    );
};
