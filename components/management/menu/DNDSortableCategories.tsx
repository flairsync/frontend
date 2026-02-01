import React, { useEffect, useRef, useState } from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    DragStartEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { MenuCategoryCardSortable } from "./MenuCategoryCardSortable";
import { BusinessMenuCategory } from "@/models/business/menu/BusinessMenuCategory";

/* =========================
   Types
========================= */

export type OrderChange = {
    id: string;
    order: number;
};

export type ItemParentChange = {
    itemId: string;
    fromCategoryId: string;
    toCategoryId: string;
};

export type MenuChanges = {
    categoryOrderChanges: OrderChange[];
    itemOrderChanges: OrderChange[];
    itemParentChanges: ItemParentChange[];
};

type Props = {
    categories: BusinessMenuCategory[];
    setCategories: (cats: BusinessMenuCategory[]) => void;
    onChange?: (changes: MenuChanges) => void;
    onEditCategory: (id: string) => void;
    onDeleteCategory: (id: string) => void;
    onAddItem: (catId: string) => void;
    onEditItem: (id: string) => void;
    onDeleteItem: (id: string) => void;
    onDuplicateItem: (id: string) => void;
};

/* =========================
   Helpers
========================= */

/* =========================
   Component
 ========================= */

import { diffCategories, snapshotCategories } from "@/features/business/menu/menuUtils";

/* =========================
   Component
========================= */

export const MenuCategoriesSortable = ({
    categories,
    setCategories,
    onChange,
    onEditCategory,
    onDeleteCategory,
    onAddItem,
    onEditItem,
    onDeleteItem,
    onDuplicateItem,
}: Props) => {
    const sensors = useSensors(useSensor(PointerSensor));
    const [activeDrag, setActiveDrag] = useState<any>(null);

    // 🔒 Snapshot initial state ONCE
    const initialSnapshotRef = useRef(snapshotCategories(categories));

    const emitDiff = (updatedCategories: BusinessMenuCategory[]) => {
        const diff = diffCategories(initialSnapshotRef.current, updatedCategories);
        onChange?.(diff);
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDrag(event.active.data.current);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) {
            setActiveDrag(null);
            return;
        }

        /* ===== CATEGORY ===== */
        if (
            active.data.current?.type === "category" &&
            over.data.current?.type === "category"
        ) {
            const oldIndex = categories.findIndex(c => c.id === active.id);
            const newIndex = categories.findIndex(c => c.id === over.id);

            if (oldIndex !== newIndex) {
                const newCats = arrayMove(categories, oldIndex, newIndex);
                setCategories(newCats);
                emitDiff(newCats);
            }

            setActiveDrag(null);
            return;
        }

        /* ===== ITEM ===== */
        const sourceCategory = categories.find(c =>
            c.items?.some(i => i.id === active.id)
        );

        let destCategory: BusinessMenuCategory | undefined;

        if (over.data.current?.type === "category") {
            destCategory = categories.find(c => c.id === over.id);
        } else if (over.data.current?.type === "item") {
            destCategory = categories.find(c =>
                c.items?.some(i => i.id === over.id)
            );
        }

        if (!sourceCategory || !destCategory) {
            setActiveDrag(null);
            return;
        }

        const item = sourceCategory.items!.find(i => i.id === active.id)!;

        let newCategories: BusinessMenuCategory[];

        if (sourceCategory.id === destCategory.id) {
            const oldIndex = sourceCategory.items!.findIndex(i => i.id === item.id);
            const newIndex = destCategory.items!.findIndex(i => i.id === over.id);

            if (oldIndex === newIndex) {
                setActiveDrag(null);
                return;
            }

            const newItems = arrayMove(sourceCategory.items!, oldIndex, newIndex);

            newCategories = categories.map(c =>
                c.id === sourceCategory.id ? { ...c, items: newItems } : c
            );
        } else {
            const newSourceItems = sourceCategory.items!.filter(i => i.id !== item.id);
            const newDestItems = [...destCategory.items!, item];

            newCategories = categories.map(c => {
                if (c.id === sourceCategory.id)
                    return { ...c, items: newSourceItems };
                if (c.id === destCategory.id)
                    return { ...c, items: newDestItems };
                return c;
            });
        }

        setCategories(newCategories);
        emitDiff(newCategories);
        setActiveDrag(null);
    };

    useEffect(() => {
        if (!initialSnapshotRef.current.length && categories.length) {
            initialSnapshotRef.current = snapshotCategories(categories);
        }
    }, [categories]);


    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={categories.map(c => c.id)}
                strategy={verticalListSortingStrategy}
            >
                {categories.map(cat => (
                    <MenuCategoryCardSortable
                        key={cat.id}
                        category={cat}
                        categories={categories}
                        setCategories={setCategories}
                        onEdit={() => onEditCategory(cat.id)}
                        onDelete={() => onDeleteCategory(cat.id)}
                        onAddItem={() => onAddItem(cat.id)}
                        onEditItem={onEditItem}
                        onDeleteItem={onDeleteItem}
                        onDuplicateItem={onDuplicateItem}
                    />
                ))}
            </SortableContext>

            <DragOverlay>
                {activeDrag ? (
                    activeDrag.type === "category" ? (
                        <div className="shadow-lg p-4 bg-white rounded-xl">
                            {activeDrag.name}
                        </div>
                    ) : (
                        <div className="shadow-lg p-3 bg-zinc-100 rounded-lg">
                            {activeDrag.name}
                        </div>
                    )
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};
