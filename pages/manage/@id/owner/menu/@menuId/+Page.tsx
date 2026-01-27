import React, { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash, ChevronDown, ChevronRight, ImageIcon, ArrowLeft, Edit } from "lucide-react";
import { usePageContext } from "vike-react/usePageContext";
import { navigate } from 'vike/client/router'
import { useBusinessSingleMenu } from "@/features/business/menu/useBusinessSingleMenu";
import { CreateCategoryModal } from "@/components/management/menu/CreateCategoryModal";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { ItemModal } from "@/components/management/menu/CreateItemModal";
import { BusinessMenuItem } from "@/models/business/menu/BusinessMenuItem";
import { MenuHeader } from "@/features/business/menu/MenuHeader";
import { MenuCategoryCard } from "@/components/management/menu/MenuCategoryCard";



const MenuDetailPage: React.FC = () => {
    const { routeParams } = usePageContext();
    const { menuId, id } = routeParams;

    const {
        businessMenu,
        createNewCategory,
        updateItem,
        createNewItem,
        removeItem
    } = useBusinessSingleMenu(id, menuId);

    const [createCategoryModal, setCreateCategoryModal] = useState(false);
    const [createItemCatId, setCreateItemCatId] = useState<string>();
    const [editingItem, setEditingItem] = useState<{
        category: string,
        item: BusinessMenuItem
    }>();


    const [expanded, setExpanded] = useState<string | null>(null);

    const toggleExpand = (catId: string) => setExpanded(expanded === catId ? null : catId);




    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8">
            <CreateCategoryModal
                open={createCategoryModal}
                onClose={() => {
                    setCreateCategoryModal(false);
                }}
                onConfirm={(data) => {
                    createNewCategory({
                        name: data.name,
                        description: data.description,
                    })
                    setCreateCategoryModal(false);
                }}
            />
            <ItemModal

                allergies={[]}
                onClose={() => {
                    setCreateItemCatId(undefined);
                    setEditingItem(undefined);
                }}
                initialData={editingItem?.item}
                open={(createItemCatId != undefined || editingItem != undefined)}
                onConfirm={(data: {
                    name: string;
                    description: string;
                    price: number;
                    allergyIds: string[];
                    images: File[];
                }) => {
                    if (!editingItem) {
                        createNewItem({
                            catid: createItemCatId!,
                            data: {
                                allergies: data.allergyIds,
                                description: data.description,
                                files: data.images,
                                name: data.name,
                                price: data.price,
                            },
                        });
                    } else {
                        updateItem({
                            categoryId: editingItem.category,
                            itemId: editingItem.item.id,
                            data: {
                                allergies: data.allergyIds,
                                description: data.description,
                                files: data.images,
                                name: data.name,
                                price: data.price,
                            }
                        })
                    }
                    setCreateItemCatId(undefined);
                    setEditingItem(undefined);

                }}

            />
            <a
                href="./"
            >

                <Button
                    className="flex items-center gap-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition rounded-lg px-4 py-2"
                >
                    <ArrowLeft className="h-4 w-4" /> Go back to all menus
                </Button>
            </a>

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                {
                    businessMenu &&
                    <MenuHeader
                        menu={{
                            name: businessMenu?.name,
                            id: businessMenu?.id,
                            description: businessMenu?.description,

                        }}
                        onEdit={() => { }}
                        onDuplicate={() => { }}
                        onDelete={() => { }}
                    />
                }

                {/* Add Category Button */}
                <Button
                    onClick={() => {
                        setCreateCategoryModal(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-500 text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition"
                >
                    <Plus className="h-4 w-4" /> Add Category
                </Button>

                {/* Categories */}
                {businessMenu && (
                    <Reorder.Group
                        values={businessMenu.categories}
                        onReorder={(newOrder) => console.log(newOrder)}
                        className="space-y-4"
                    >
                        {businessMenu.categories.length === 0 && (
                            <p className="text-zinc-500 dark:text-zinc-400 italic text-sm">
                                No categories yet. Click “Add Category” to start.
                            </p>
                        )}

                        {businessMenu.categories.map((cat) => (
                            <Reorder.Item key={cat.id} value={cat}>
                                <MenuCategoryCard
                                    category={cat}
                                    isOpen={expanded === cat.id}
                                    onToggle={() => toggleExpand(cat.id)}
                                    onAddItem={() => setCreateItemCatId(cat.id)}
                                    onEditItem={(item) =>
                                        setEditingItem({ category: cat.id, item })
                                    }
                                    onDeleteItem={(itemId) =>
                                        removeItem({ categoryId: cat.id, itemId })
                                    }
                                />
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                )}
            </div>
        </div>
    );
};

export default MenuDetailPage;
