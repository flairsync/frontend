import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash, ChevronDown, ChevronRight, ImageIcon, ArrowLeft, Edit, AlertCircle, Info, CheckCircle } from "lucide-react";
import { usePageContext } from "vike-react/usePageContext";
import { navigate } from 'vike/client/router'
import { useBusinessSingleMenu } from "@/features/business/menu/useBusinessSingleMenu";
import { CategoryModal } from "@/components/management/menu/CreateCategoryModal";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { ItemModal } from "@/components/management/menu/CreateItemModal";
import { BusinessMenuItem } from "@/models/business/menu/BusinessMenuItem";
import { MenuHeader } from "@/features/business/menu/MenuHeader";
import { MenuCategoryCard } from "@/components/management/menu/MenuCategoryCard";
import { BusinessMenuCategory } from "@/models/business/menu/BusinessMenuCategory";
import { MenuModal } from "@/components/management/menu/CreateMenuModal";
import { Alert, AlertDescription } from "@/components/ui/alert";



const MenuDetailPage: React.FC = () => {
    const { routeParams } = usePageContext();
    const { menuId, id } = routeParams;

    const {
        //Menu
        businessMenu,
        updateMenu,
        //Categories
        createNewCategory,
        updateCategoriesOrder,
        updateCategory,
        removeCategory,
        //Items
        updateItem,
        createNewItem,
        removeItem
    } = useBusinessSingleMenu(id, menuId);

    const [createCategoryModal, setCreateCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<{
        id: string;
        name: string;
        description: string;
    }>();


    const [createItemCatId, setCreateItemCatId] = useState<string>();
    const [editingItem, setEditingItem] = useState<{
        category: string,
        item: BusinessMenuItem
    }>();


    const [editMenu, setEditMenu] = useState(false);

    const [expanded, setExpanded] = useState<string | null>(null);

    const toggleExpand = (catId: string) => setExpanded(expanded === catId ? null : catId);

    const [categories, setCategories] = useState(businessMenu?.getOrderedCategories() || []);


    useEffect(() => {
        setCategories(businessMenu?.getOrderedCategories() || []);
    }, [businessMenu]);

    const commitCategoriesOrder = (finalOrder: BusinessMenuCategory[]) => {

        if (!businessMenu) return;
        const payload = finalOrder.map((cat, index) => ({
            categoryId: cat.id,
            order: index,
        }));

        // Check if any order changed compared to current categories
        const hasChanged = payload.some((p) => {
            const currentCat = businessMenu?.getOrderedCategories().find((c) => c.id === p.categoryId);
            return !currentCat || currentCat.order !== p.order;
        });

        if (!hasChanged) return; // Nothing changed → skip API call

        updateCategoriesOrder(payload);
    };



    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8">

            <MenuModal
                isOpen={editMenu}
                onClose={() => {
                    setEditMenu(false)
                }}
                onSubmit={(data) => {
                    updateMenu({
                        description: data.description,
                        endDate: data.endDate,
                        endTime: data.endTime,
                        icon: data.icon,
                        name: data.name,
                        repeatDaysOfWeek: data.repeatDays,
                        repeatYearly: data.repeatYearly,
                        startDate: data.startDate,
                        startTime: data.startTime
                    })
                    setEditMenu(false)
                }}
                menu={businessMenu}
            />

            <CategoryModal
                open={createCategoryModal || editingCategory != undefined}
                onClose={() => {
                    setCreateCategoryModal(false);
                    setEditingCategory(undefined);

                }}
                category={editingCategory}
                onConfirm={(data) => {
                    if (editingCategory) {
                        updateCategory({
                            categoryId: editingCategory.id,
                            data
                        })
                    } else {
                        createNewCategory({
                            name: data.name,
                            description: data.description,
                        })
                    }
                    setEditingCategory(undefined);
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
                    businessMenu && <>
                        <MenuHeader
                            menu={{
                                name: businessMenu?.name,
                                id: businessMenu?.id,
                                description: businessMenu?.description,

                            }}
                            onEdit={() => {
                                setEditMenu(true);
                            }}
                            onDuplicate={() => { }}
                            onDelete={() => { }}
                        />
                        <h4 className="mb-2 text-lg font-semibold">Menu Hints:</h4>
                        <Card className="space-y-2">
                            <CardContent className="space-y-2">
                                {businessMenu.getMenuHints().map((hint, i) => {
                                    let Icon;
                                    let variant: "default" | "destructive" = "default";

                                    switch (hint.type) {
                                        case "danger":
                                            Icon = AlertCircle;
                                            variant = "destructive";
                                            break;
                                        case "info":
                                            Icon = Info;
                                            variant = "default";
                                            break;
                                        case "hint":
                                        default:
                                            Icon = CheckCircle;
                                            variant = "default";
                                            break;
                                    }

                                    return (
                                        <Alert key={i} variant={variant} className="p-2">
                                            <Icon className="w-4 h-4 mr-2 shrink-0" />
                                            <AlertDescription>{hint.message}</AlertDescription>
                                        </Alert>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </>
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
                        values={categories}
                        onReorder={setCategories}
                        className="space-y-4"
                    >
                        {categories.length === 0 && (
                            <p className="text-zinc-500 dark:text-zinc-400 italic text-sm">
                                No categories yet. Click “Add Category” to start.
                            </p>
                        )}

                        {categories.map((cat) => (
                            <Reorder.Item key={cat.id} value={cat}
                                onDragEnd={() => {
                                    commitCategoriesOrder(categories);
                                }}
                            >
                                <MenuCategoryCard
                                    onDeleteCategory={() => {
                                        removeCategory(cat.id);
                                    }}
                                    onEditCategory={() => {
                                        setEditingCategory({
                                            description: cat.description,
                                            id: cat.id,
                                            name: cat.name
                                        })
                                    }}
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
